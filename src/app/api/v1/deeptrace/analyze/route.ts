import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { z } from 'zod';
import {
  PlatformTypeEnum,
  PlatformType,
  DeepTraceInputMetadata,
  DeepTraceAnalysisInput
} from '../../../../../types/deeptrace';
import { visionExtractor } from '../../../../../services/visionExtractor';
import { deepTraceAnalyzer } from '../../../../../services/deepTraceAnalyzer';
import { env } from '../../../../../config/env';
import { caseRepository } from '../../../../../db/caseRepository';
import { rateLimiter } from '../../../../../services/rateLimiter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const FormDataMetadataSchema = z.object({
  claimedLocation: z.string().trim().max(120).optional(),
  claimedTimezone: z.string().trim().max(60).optional(),
  claimedAge: z.coerce.number().int().min(18).max(99).optional(),
  platform: PlatformTypeEnum.optional().default('OTHER'),
  targetHandle: z.string().trim().max(80).optional(),
  suspectDisplayName: z.string().trim().max(100).optional(),
  contextNotes: z.string().trim().max(1000).optional()
});

/**
 * Standardized error response builder
 */
function createErrorResponse(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message
      },
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * POST /api/v1/deeptrace/analyze
 * Hardened production endpoint for chat screenshot analysis with NVIDIA NIM
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // 0. Pre-Flight IP Rate Limit & GPU Abuse Guard (Before stream parsing / Sharp / NIM)
    const clientIp = extractClientIp(req);
    const rateLimitStatus = rateLimiter.checkLimit(clientIp);

    if (!rateLimitStatus.allowed) {
      const clickId = req.headers.get('x-flirtcheck-cid') || 'fc_rate_' + Date.now().toString(36);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Free daily limit reached (${rateLimitStatus.limit}/${rateLimitStatus.limit} scans). Unlock unlimited scans or return tomorrow.`,
            remaining: 0,
            resetInSeconds: rateLimitStatus.resetInSeconds,
            paywall: {
              title: 'Daily Forensic Quota Reached',
              description: 'To protect our neural compute nodes, free analyses are limited to 3 per 24 hours.',
              ctaText: 'Unlock Instant Unlimited Access →',
              monetizationUrl: `https://postback-engine.sov7.workers.dev/click?click_id=${clickId}&sub1=deeptrace&sub2=PAYWALL_LIMIT`
            }
          }
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitStatus.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitStatus.resetInSeconds.toString(),
            'Retry-After': rateLimitStatus.resetInSeconds.toString()
          }
        }
      );
    }

    // 1. Content-Type Header Verification
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return createErrorResponse(
        'INVALID_CONTENT_TYPE',
        'Content-Type must be multipart/form-data',
        400
      );
    }

    // 2. Pre-Stream Payload Size Guard (Check Content-Length before parsing stream)
    const contentLengthHeader = req.headers.get('content-length');
    if (contentLengthHeader) {
      const declaredLength = parseInt(contentLengthHeader, 10);
      if (declaredLength > env.MAX_UPLOAD_SIZE_BYTES) {
        return createErrorResponse(
          'PAYLOAD_TOO_LARGE',
          `Declared payload size (${(declaredLength / (1024 * 1024)).toFixed(2)} MB) exceeds limit of ${(env.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(2)} MB`,
          413
        );
      }
    }

    // 3. Form Data Extraction with Timeout Race
    const formDataPromise = req.formData();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), env.ANALYSIS_TIMEOUT_MS)
    );

    let formData: FormData;
    try {
      formData = await Promise.race([formDataPromise, timeoutPromise]);
    } catch (timeoutErr: any) {
      if (timeoutErr.message === 'REQUEST_TIMEOUT') {
        return createErrorResponse(
          'REQUEST_TIMEOUT',
          `The request exceeded the processing limit of ${env.ANALYSIS_TIMEOUT_MS}ms.`,
          504
        );
      }
      throw timeoutErr;
    }

    const screenshotEntry = formData.get('screenshot');
    if (!screenshotEntry || !(screenshotEntry instanceof Blob)) {
      return createErrorResponse(
        'INVALID_IMAGE',
        'Missing or invalid "screenshot" file in multipart form payload.',
        400
      );
    }

    // 4. File Size & MIME Verification
    if (screenshotEntry.size > env.MAX_UPLOAD_SIZE_BYTES) {
      return createErrorResponse(
        'FILE_TOO_LARGE',
        `Screenshot exceeds maximum allowed size of ${(env.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(2)} MB (Received: ${(screenshotEntry.size / (1024 * 1024)).toFixed(2)} MB).`,
        413
      );
    }

    const mimeType = (screenshotEntry.type || 'image/png').toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return createErrorResponse(
        'UNSUPPORTED_FORMAT',
        `Unsupported image format: "${mimeType}". Allowed formats: PNG, JPEG, WEBP.`,
        400
      );
    }

    // 5. Metadata Parsing & Validation
    const rawMeta = {
      claimedLocation: (formData.get('claimedLocation') as string) || undefined,
      claimedTimezone: (formData.get('claimedTimezone') as string) || undefined,
      claimedAge: formData.get('claimedAge') || undefined,
      platform: (formData.get('platform') as string) || undefined,
      targetHandle: (formData.get('targetHandle') as string) || undefined,
      suspectDisplayName: (formData.get('suspectDisplayName') as string) || undefined,
      contextNotes: (formData.get('contextNotes') as string) || undefined
    };

    const parsedMetadata = FormDataMetadataSchema.safeParse(rawMeta);
    if (!parsedMetadata.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_METADATA',
            message: 'Provided metadata fails schema validation.'
          },
          details: parsedMetadata.error.format()
        },
        { status: 400 }
      );
    }

    const meta = parsedMetadata.data;
    const inputMetadata: DeepTraceInputMetadata = {
      declaredLocation: meta.claimedLocation,
      declaredTimezone: meta.claimedTimezone,
      claimedAge: meta.claimedAge,
      platformType: meta.platform as PlatformType,
      targetHandle: meta.targetHandle,
      suspectDisplayName: meta.suspectDisplayName,
      contextNotes: meta.contextNotes
    };

    // 6. Image Optimization with Sharp (Strip EXIF, normalize max dimensions)
    const rawBuffer = Buffer.from(await screenshotEntry.arrayBuffer());
    let optimizedBuffer: Buffer;
    try {
      optimizedBuffer = await sharp(rawBuffer)
        .rotate()
        .resize({
          width: 1600,
          height: 2400,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } catch (sharpError: any) {
      console.error('[DeepTrace API] Sharp image optimization failed:', sharpError);
      return createErrorResponse(
        'CORRUPTED_IMAGE',
        'Failed to process screenshot. The image file appears damaged or unreadable.',
        400
      );
    }

    // 7. Multimodal Vision Extraction via NVIDIA NIM (Llama 3.2 Vision)
    let visionResult;
    try {
      visionResult = await visionExtractor.extractChatFromImage(
        optimizedBuffer,
        inputMetadata,
        'image/jpeg'
      );
    } catch (visionError: any) {
      console.error('[DeepTrace API] Vision extraction failure:', visionError);
      return createErrorResponse(
        'EXTRACTION_FAILED',
        `Unable to parse chat bubbles from screenshot: ${visionError.message}`,
        422
      );
    }

    // 8. Run DeepTrace Forensics & Generate Master Report DTO
    // Prioritize platform detected autonomously by NVIDIA NIM Vision model
    const aiDetectedPlatform = visionResult.extraction.detectedPlatform;
    if (aiDetectedPlatform && aiDetectedPlatform !== 'OTHER') {
      inputMetadata.platformType = aiDetectedPlatform;
    }

    const analysisInput: DeepTraceAnalysisInput = {
      imageBuffer: optimizedBuffer.toString('base64'),
      imageMimeType: 'image/jpeg',
      metadata: inputMetadata,
      requestedForensicDepth: 'DEEP'
    };

    const report = deepTraceAnalyzer.generateFullReport(
      visionResult.visionChatExtraction,
      analysisInput
    );

    // Auto-persist case record for public verification & shareable permalinks
    try {
      caseRepository.saveCase(
        report,
        report.inputMetadata.platformType || inputMetadata.platformType,
        inputMetadata.declaredLocation
      );
    } catch (dbErr) {
      console.error('[DeepTrace API] Failed to auto-persist case in SQLite:', dbErr);
    }

    // Record rate limit usage against client IP upon successful analysis
    try {
      rateLimiter.recordUsage(clientIp);
    } catch (rateErr) {
      console.warn('[DeepTrace API] Failed to record rate limit usage:', rateErr);
    }

    const elapsedMs = Date.now() - startTime;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flirtcheck.site';
    const shareUrl = `${appBaseUrl.replace(/\/$/, '')}/deeptrace/case/${report.caseReference}`;

    // 9. Return Response with Diagnostic Headers
    const responsePayload = {
      success: true,
      shareUrl,
      ...report,
      data: report
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-RateLimit-Limit': rateLimitStatus.limit.toString(),
        'X-RateLimit-Remaining': Math.max(0, rateLimitStatus.remaining - 1).toString(),
        'X-RateLimit-Reset': rateLimitStatus.resetInSeconds.toString(),
        'X-DeepTrace-Case-Ref': report.caseReference,
        'X-DeepTrace-Inference-Time-Ms': visionResult.inferenceTimeMs.toString(),
        'X-DeepTrace-Latency-Ms': elapsedMs.toString(),
        'X-DeepTrace-Engine': 'NVIDIA-NIM',
        'X-DeepTrace-Fallback': visionResult.isFallback ? 'true' : 'false'
      }
    });
  } catch (unexpectedError: any) {
    console.error('[DeepTrace API] Unhandled server error in analyze route:', unexpectedError);
    return createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred during forensic evaluation.',
      500
    );
  }
}
