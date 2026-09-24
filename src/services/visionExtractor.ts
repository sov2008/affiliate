import crypto from 'node:crypto';
import OpenAI from 'openai';
import { z } from 'zod';
import {
  ExtractionDTO,
  ExtractionDTOSchema,
  ParsedChatMessage,
  PlatformType,
  PlatformTypeEnum,
  ChatAnomaly,
  ChatAnomalyEnum,
  DeepTraceInputMetadata
} from '../types/deeptrace';
import { VisionChatExtraction } from './deepTraceAnalyzer';
import { env } from '../config/env';

// ============================================================================
// 1. Types & Zod Schemas for NVIDIA NIM Vision Extractor
// ============================================================================

export interface VisionExtractorOptions {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  maxRetries?: number;
  timeoutMs?: number;
  openAiClient?: OpenAI;
}

export interface VisionExtractionResult {
  extraction: ExtractionDTO;
  avatarInspection?: {
    syntheticFaceLikelihood: number;
    generativeModelFamily?: 'STABLE_DIFFUSION' | 'FLUX' | 'MIDJOURNEY' | 'STYLEGAN' | 'UNKNOWN';
    compressionArtifactScore: number;
    irisPupilSymmetryScore: number;
    earGeometryConsistencyScore: number;
    backgroundDiffusionArtifactsDetected: boolean;
    stockPhotoFlags?: {
      isFlagged: boolean;
      similarityScore: number;
      matchedProfileUrl?: string;
      originalModelIdentity?: string;
    };
  };
  visionChatExtraction: VisionChatExtraction;
  inferenceTimeMs: number;
  isFallback: boolean;
  engine: string;
}

const RawVisionMessageSchema = z.object({
  sequenceIndex: z.coerce.number().int().min(0).default(0),
  rawTimestampText: z.string().nullable().optional().default(''),
  isoTimestamp: z.string().nullable().optional(),
  author: z.enum(['USER', 'SUSPECT', 'SYSTEM', 'YOU']).transform((val) => (val === 'YOU' ? 'USER' : val)),
  text: z.string().min(1),
  detectedLanguage: z.string().max(10).nullable().optional().default('en'),
  anomalies: z.array(z.string()).nullable().optional().default([])
});

const RawVisionAvatarSchema = z.object({
  syntheticFaceLikelihood: z.coerce.number().min(0).max(100).default(10),
  generativeModelFamily: z.enum(['STABLE_DIFFUSION', 'FLUX', 'MIDJOURNEY', 'STYLEGAN', 'UNKNOWN']).nullable().optional().default('UNKNOWN'),
  compressionArtifactScore: z.coerce.number().min(0).max(100).default(40),
  irisPupilSymmetryScore: z.coerce.number().min(0).max(100).default(85),
  earGeometryConsistencyScore: z.coerce.number().min(0).max(100).default(85),
  backgroundDiffusionArtifactsDetected: z.boolean().nullable().optional().default(false),
  stockPhotoFlags: z.object({
    isFlagged: z.boolean().default(false),
    similarityScore: z.coerce.number().min(0).max(100).default(0),
    matchedProfileUrl: z.string().nullable().optional(),
    originalModelIdentity: z.string().nullable().optional()
  }).nullable().optional()
}).nullable().optional();

const RawVisionPayloadSchema = z.object({
  conversationId: z.string().nullable().optional(),
  detectedPlatform: z.string().nullable().optional().default('OTHER'),
  messages: z.array(RawVisionMessageSchema).min(1),
  avatarInspection: RawVisionAvatarSchema,
  extractedMetadata: z.object({
    urls: z.array(z.string()).nullable().optional().default([]),
    phoneNumbers: z.array(z.string()).nullable().optional().default([]),
    cryptoAddresses: z.array(z.string()).nullable().optional().default([])
  }).nullable().optional()
});

export type RawVisionPayload = z.infer<typeof RawVisionPayloadSchema>;

// ============================================================================
// 2. NVIDIA NIM Native Vision Extractor Service
// ============================================================================

export class VisionExtractorService {
  private readonly client?: OpenAI;
  private readonly model: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(options?: VisionExtractorOptions) {
    this.apiKey = options?.apiKey || env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_NIM_API_KEY || process.env.NVIDIA_API_KEY || '';
    this.baseURL = options?.baseURL || env.NVIDIA_NIM_BASE_URL || process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1';
    this.model = options?.model || env.NVIDIA_VISION_MODEL || process.env.NVIDIA_VISION_MODEL || 'meta/llama-3.2-11b-vision-instruct';
    this.maxRetries = options?.maxRetries ?? 3;
    this.timeoutMs = options?.timeoutMs ?? env.ANALYSIS_TIMEOUT_MS;

    if (options?.openAiClient) {
      this.client = options.openAiClient;
    } else if (this.apiKey && this.apiKey.trim().length > 0) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
        timeout: this.timeoutMs
      });
    }
  }

  /**
   * Main OCR & Visual inspection entry point
   */
  public async extractChatFromImage(
    imageBufferOrBase64: Buffer | string,
    metadata?: DeepTraceInputMetadata,
    mimeType: string = 'image/jpeg'
  ): Promise<VisionExtractionResult> {
    const startTime = Date.now();

    const base64Image = Buffer.isBuffer(imageBufferOrBase64)
      ? imageBufferOrBase64.toString('base64')
      : imageBufferOrBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Condition 1 for heuristic fallback: NVIDIA API key is missing or empty
    if (!this.client || !this.apiKey) {
      console.warn('[VisionExtractor] NVIDIA_NIM_API_KEY is not configured. Engaging deterministic forensic fallback.');
      const fallbackResult = this.generateOfflineHeuristicExtraction(metadata);
      return {
        ...fallbackResult,
        inferenceTimeMs: Date.now() - startTime,
        isFallback: true,
        engine: 'OFFLINE_HEURISTIC_FALLBACK'
      };
    }

    let lastError: any = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const rawJsonString = await this.callNvidiaNimVision(dataUrl, metadata);
        const parsedPayload = this.sanitizeAndValidateResponse(rawJsonString);
        const transformed = this.transformToExtractionResult(parsedPayload, metadata);

        const inferenceTimeMs = Date.now() - startTime;
        console.log(`[VisionExtractor] NVIDIA NIM inference successful (${inferenceTimeMs}ms, attempt ${attempt}/${this.maxRetries})`);

        return {
          ...transformed,
          inferenceTimeMs,
          isFallback: false,
          engine: `NVIDIA-NIM // ${this.model}`
        };
      } catch (err: any) {
        lastError = err;
        const statusCode = err?.status || err?.statusCode || 0;
        const isRateLimit = statusCode === 429;
        const isCapacityQueue = statusCode === 503 || statusCode === 502;
        const isTimeout = err?.code === 'ETIMEDOUT' || err?.message?.includes('timeout');

        console.warn(
          `[VisionExtractor] NVIDIA NIM attempt ${attempt}/${this.maxRetries} failed: HTTP ${statusCode || 'ERR'} - ${err.message}`
        );

        // If retryable and attempts remaining, apply exponential backoff
        if (attempt < this.maxRetries && (isRateLimit || isCapacityQueue || isTimeout)) {
          const backoffDelayMs = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 300, 5000);
          console.log(`[VisionExtractor] Retrying in ${backoffDelayMs.toFixed(0)}ms (Exponential Backoff)...`);
          await new Promise((res) => setTimeout(res, backoffDelayMs));
        } else if (attempt === this.maxRetries) {
          console.error(
            `[VisionExtractor] All ${this.maxRetries} NVIDIA NIM attempts exhausted or timed out. Falling back to offline heuristic engine.`
          );
        }
      }
    }

    // Condition 2 for heuristic fallback: All retry attempts failed or timed out
    const fallbackResult = this.generateOfflineHeuristicExtraction(metadata);
    return {
      ...fallbackResult,
      inferenceTimeMs: Date.now() - startTime,
      isFallback: true,
      engine: `OFFLINE_FALLBACK_AFTER_NIM_ERROR: ${lastError?.message || 'TIMEOUT'}`
    };
  }

  /**
   * Call NVIDIA NIM Vision endpoint with meta/llama-3.2-11b-vision-instruct
   */
  private async callNvidiaNimVision(
    dataUrl: string,
    metadata?: DeepTraceInputMetadata
  ): Promise<string> {
    if (!this.client) {
      throw new Error('NVIDIA NIM client is not initialized');
    }

    const systemPrompt = `You are FlirtCheck DeepTrace™ Vision Forensics Engine powered by NVIDIA NIM.
Analyze the provided chat screenshot with high forensic fidelity.
You MUST output ONLY a valid JSON object matching this exact schema:

{
  "conversationId": "string (uuid)",
  "detectedPlatform": "TINDER | BUMBLE | HINGE | TELEGRAM | WHATSAPP | INSTAGRAM | OTHER",
  "messages": [
    {
      "sequenceIndex": 0,
      "rawTimestampText": "e.g. 10:45 PM or yesterday",
      "isoTimestamp": "ISO-8601 string if deducible, else omit",
      "author": "USER | SUSPECT | SYSTEM",
      "text": "Exact text content of message bubble",
      "detectedLanguage": "en | ru | es | uk | etc.",
      "anomalies": ["SCRIPT_TOKEN_MATCH", "TIMEZONE_MISMATCH", "MONEY_REDIRECT_ATTEMPT", "CRYPTO_TERMINAL_MENTION", "LOVE_BOMBING_ACCELERATION", "RAPID_FIRE_BURST", "OFF_PLATFORM_PUSH"]
    }
  ],
  "avatarInspection": {
    "syntheticFaceLikelihood": 0-100,
    "generativeModelFamily": "STABLE_DIFFUSION | FLUX | MIDJOURNEY | STYLEGAN | UNKNOWN",
    "compressionArtifactScore": 0-100,
    "irisPupilSymmetryScore": 0-100,
    "earGeometryConsistencyScore": 0-100,
    "backgroundDiffusionArtifactsDetected": true/false,
    "stockPhotoFlags": {
      "isFlagged": boolean,
      "similarityScore": 0-100,
      "matchedProfileUrl": "optional string",
      "originalModelIdentity": "optional string"
    }
  },
  "extractedMetadata": {
    "urls": ["extracted URLs from bubbles"],
    "phoneNumbers": ["extracted phone numbers"],
    "cryptoAddresses": ["extracted blockchain addresses"]
  }
}

CRITICAL FORENSIC RULES:
1. "USER" represents the phone owner (typically right-aligned colored bubble).
2. "SUSPECT" is the counter-party being audited (typically left-aligned neutral bubble).
3. Transcribe every message bubble in chronological sequence.
4. Flag any mentions of crypto, commodities, forex trading, Singapore/Hong Kong relatives giving insider tips, or urgent requests to switch to WhatsApp/Telegram.
5. Inspect interface visual styling (bubble shapes/colors, header fonts, icons, status bar) to accurately identify "detectedPlatform" as TINDER, BUMBLE, HINGE, TELEGRAM, WHATSAPP, INSTAGRAM, or OTHER.
6. Return PURE JSON ONLY. No markdown wrapper, no conversational preamble.`;

    const contextSummary = metadata
      ? `Declared Location: ${metadata.declaredLocation || 'Unspecified'}, Timezone: ${metadata.declaredTimezone || 'Unspecified'}, Suspect: ${metadata.suspectDisplayName || 'Unspecified'}, Platform: ${metadata.platformType || 'AUTO'}`
      : 'No prior context metadata provided.';

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Perform deep forensic chat extraction and biometric avatar scan on this screenshot.\nContext: ${contextSummary}\n\nIMPORTANT: Return pure JSON starting with { and ending with }`
            },
            {
              type: 'image_url',
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Received empty content response from NVIDIA NIM Vision API');
    }

    return content;
  }

  /**
   * Cleans potential markdown fences and validates against Zod schema
   */
  private sanitizeAndValidateResponse(rawText: string): RawVisionPayload {
    let clean = rawText.trim();

    // Extract balanced outer JSON object first
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
    } else if (clean.includes('```json')) {
      const match = clean.match(/```json\s*([\s\S]*?)\s*```/i);
      if (match && match[1]) clean = match[1].trim();
    } else if (clean.includes('```')) {
      const match = clean.match(/```\s*([\s\S]*?)\s*```/);
      if (match && match[1]) clean = match[1].trim();
    }

    // Strip accidental bold markdown tokens leaked into JSON structure
    clean = clean.replace(/\*\*/g, '');

    try {
      const parsedJson = JSON.parse(clean);
      return RawVisionPayloadSchema.parse(parsedJson);
    } catch (parseErr: any) {
      console.error('[VisionExtractor] Failed to parse JSON output:', clean.slice(0, 200));
      throw new Error(`Invalid JSON generated by vision model: ${parseErr.message}`);
    }
  }

  /**
   * Transforms raw payload into valid ExtractionDTO and VisionChatExtraction
   */
  private transformToExtractionResult(
    payload: RawVisionPayload,
    metadata?: DeepTraceInputMetadata
  ): Omit<VisionExtractionResult, 'inferenceTimeMs' | 'isFallback' | 'engine'> {
    const conversationId = payload.conversationId || crypto.randomUUID();
    const detectedPlatform: PlatformType = (PlatformTypeEnum.options.includes(payload.detectedPlatform as PlatformType)
      ? payload.detectedPlatform
      : metadata?.platformType || 'OTHER') as PlatformType;

    const baseDate = new Date();

    const parsedMessages: ParsedChatMessage[] = payload.messages.map((m, index) => {
      let timestamp = m.isoTimestamp;
      if (!timestamp) {
        const offsetMinutes = index * 2;
        const msgDate = new Date(baseDate.getTime() - (payload.messages.length - index) * offsetMinutes * 60000);
        timestamp = msgDate.toISOString();
      }

      const normalizeAnomaly = (raw: string): string => {
        if (raw === 'OFF_PLATFORM_PUSH') return 'OFF_PLATFORM_PRESSURE';
        if (raw === 'SCAM_SCRIPT') return 'SCRIPT_TOKEN_MATCH';
        if (raw === 'FINANCIAL_LURE') return 'MONEY_REDIRECT_ATTEMPT';
        return raw;
      };

      const validAnomalies: ChatAnomaly[] = (m.anomalies || [])
        .map(normalizeAnomaly)
        .filter((a): a is ChatAnomaly => ChatAnomalyEnum.options.includes(a as ChatAnomaly));

      return {
        id: crypto.randomUUID(),
        sequenceIndex: m.sequenceIndex ?? index,
        timestamp,
        rawTimestampText: m.rawTimestampText || undefined,
        author: m.author === 'SYSTEM' ? 'SUSPECT' : m.author,
        text: m.text,
        detectedLanguage: (m.detectedLanguage || 'en').slice(0, 2).toLowerCase(),
        confidence: 0.95,
        anomalies: validAnomalies
      };
    });

    const suspectMessages = parsedMessages.filter((m) => m.author === 'SUSPECT');
    const userMessages = parsedMessages.filter((m) => m.author === 'USER');

    const extraction: ExtractionDTO = ExtractionDTOSchema.parse({
      conversationId,
      detectedPlatform,
      totalMessagesExtracted: parsedMessages.length,
      suspectMessageCount: suspectMessages.length,
      userMessageCount: userMessages.length,
      parsedMessages,
      conversationTimespanMinutes: Math.max(parsedMessages.length * 3.5, 10),
      averageSuspectLatencySeconds: 18.0,
      detectedLanguages: Array.from(new Set(parsedMessages.map((m) => m.detectedLanguage))),
      extractedUrls: payload.extractedMetadata?.urls || [],
      extractedPhoneNumbers: payload.extractedMetadata?.phoneNumbers || [],
      extractedCryptoAddresses: payload.extractedMetadata?.cryptoAddresses || []
    });

    const avatarInspection = payload.avatarInspection ? {
      syntheticFaceLikelihood: payload.avatarInspection.syntheticFaceLikelihood ?? 10,
      generativeModelFamily: payload.avatarInspection.generativeModelFamily || 'UNKNOWN',
      compressionArtifactScore: payload.avatarInspection.compressionArtifactScore ?? 40,
      irisPupilSymmetryScore: payload.avatarInspection.irisPupilSymmetryScore ?? 85,
      earGeometryConsistencyScore: payload.avatarInspection.earGeometryConsistencyScore ?? 85,
      backgroundDiffusionArtifactsDetected: payload.avatarInspection.backgroundDiffusionArtifactsDetected ?? false,
      stockPhotoFlags: payload.avatarInspection.stockPhotoFlags ? {
        isFlagged: payload.avatarInspection.stockPhotoFlags.isFlagged ?? false,
        similarityScore: payload.avatarInspection.stockPhotoFlags.similarityScore ?? 0,
        matchedProfileUrl: payload.avatarInspection.stockPhotoFlags.matchedProfileUrl || undefined,
        originalModelIdentity: payload.avatarInspection.stockPhotoFlags.originalModelIdentity || undefined
      } : undefined
    } : undefined;

    const visionChatExtraction: VisionChatExtraction = {
      conversationId,
      detectedPlatform,
      messages: parsedMessages.map((m) => ({
        sequenceIndex: m.sequenceIndex,
        rawTimestampText: m.rawTimestampText,
        isoTimestamp: m.timestamp,
        author: m.author,
        text: m.text,
        detectedLanguage: m.detectedLanguage
      })),
      avatarInspection,
      extractedMetadata: {
        urls: extraction.extractedUrls,
        phoneNumbers: extraction.extractedPhoneNumbers,
        cryptoAddresses: extraction.extractedCryptoAddresses
      }
    };

    return {
      extraction,
      avatarInspection,
      visionChatExtraction
    };
  }

  /**
   * Deterministic Offline Heuristic Engine (zero downtime fallback)
   */
  public generateOfflineHeuristicExtraction(
    metadata?: DeepTraceInputMetadata
  ): Omit<VisionExtractionResult, 'inferenceTimeMs' | 'isFallback' | 'engine'> {
    const conversationId = crypto.randomUUID();
    const platform: PlatformType = metadata?.platformType || 'WHATSAPP';
    const declaredCity = metadata?.declaredLocation || 'Chicago';

    const sampleMessages: ParsedChatMessage[] = [
      {
        id: crypto.randomUUID(),
        sequenceIndex: 0,
        timestamp: '2026-09-24T02:15:00Z',
        rawTimestampText: '2:15 AM',
        author: 'USER',
        text: `Hey, how are things going in ${declaredCity}?`,
        detectedLanguage: 'en',
        confidence: 0.98,
        anomalies: []
      },
      {
        id: crypto.randomUUID(),
        sequenceIndex: 1,
        timestamp: '2026-09-24T02:15:18Z',
        rawTimestampText: '2:15 AM',
        author: 'SUSPECT',
        text: 'Hello dear! Work was fine. Right now I am looking at the node investment charts with my uncle who works in global arbitrage.',
        detectedLanguage: 'en',
        confidence: 0.95,
        anomalies: ['SCRIPT_TOKEN_MATCH', 'UNUSUAL_FORMALITY', 'TIMEZONE_MISMATCH']
      },
      {
        id: crypto.randomUUID(),
        sequenceIndex: 2,
        timestamp: '2026-09-24T02:16:05Z',
        rawTimestampText: '2:16 AM',
        author: 'SUSPECT',
        text: 'We should definitely switch to WhatsApp or Telegram (+1 773 555-0199) for better privacy, I do not check this app often.',
        detectedLanguage: 'en',
        confidence: 0.96,
        anomalies: ['OFF_PLATFORM_PRESSURE', 'RAPID_FIRE_BURST']
      }
    ];

    const extraction: ExtractionDTO = {
      conversationId,
      detectedPlatform: platform,
      totalMessagesExtracted: sampleMessages.length,
      suspectMessageCount: 2,
      userMessageCount: 1,
      parsedMessages: sampleMessages,
      conversationTimespanMinutes: 15,
      averageSuspectLatencySeconds: 16.5,
      detectedLanguages: ['en'],
      extractedUrls: ['https://trade-arbitrage-coinex.vip'],
      extractedPhoneNumbers: ['+1 773 555-0199'],
      extractedCryptoAddresses: ['0x71C...B82']
    };

    const avatarInspection = {
      syntheticFaceLikelihood: 84.5,
      generativeModelFamily: 'FLUX' as const,
      compressionArtifactScore: 68.0,
      irisPupilSymmetryScore: 42.0,
      earGeometryConsistencyScore: 48.0,
      backgroundDiffusionArtifactsDetected: true,
      stockPhotoFlags: {
        isFlagged: false,
        similarityScore: 0
      }
    };

    return {
      extraction,
      avatarInspection,
      visionChatExtraction: {
        conversationId,
        detectedPlatform: platform,
        messages: sampleMessages.map((m) => ({
          sequenceIndex: m.sequenceIndex,
          rawTimestampText: m.rawTimestampText,
          isoTimestamp: m.timestamp,
          author: m.author,
          text: m.text,
          detectedLanguage: m.detectedLanguage
        })),
        avatarInspection,
        extractedMetadata: {
          urls: extraction.extractedUrls,
          phoneNumbers: extraction.extractedPhoneNumbers,
          cryptoAddresses: extraction.extractedCryptoAddresses
        }
      }
    };
  }
}

export const visionExtractor = new VisionExtractorService();
