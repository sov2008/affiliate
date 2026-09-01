import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import axios from 'axios';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface AITelemetry {
  provider: 'groq' | 'openrouter' | 'cloudflare' | 'heuristic';
  model: string;
  latencyMs: number;
  tokensUsed?: number;
  timestamp: string;
}

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
}

export class AIGateway {
  private static groqClient: OpenAI | null = null;
  private static openRouterClient: OpenAI | null = null;

  private static getGroq(): OpenAI | null {
    if (!this.groqClient && process.env.GROQ_API_KEY) {
      this.groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
        timeout: 20000,
      });
    }
    return this.groqClient;
  }

  private static getOpenRouter(): OpenAI | null {
    if (!this.openRouterClient && process.env.OPENROUTER_API_KEY) {
      this.openRouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://github.com/sov2008/affiliate',
          'X-Title': 'Affiliate Ops AI Gateway',
        },
        timeout: 25000,
      });
    }
    return this.openRouterClient;
  }

  /**
   * Universal text generation with multi-provider waterfall fallback.
   * Priority: Groq -> OpenRouter -> Cloudflare Workers AI
   */
  public static async generateText(
    systemPrompt: string,
    userPrompt: string,
    options: AIGenerationOptions = {}
  ): Promise<{ text: string; telemetry: AITelemetry }> {
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens ?? 2048;
    const errors: string[] = [];

    // --- Provider 1: Groq ---
    const groq = this.getGroq();
    if (groq) {
      const start = Date.now();
      const candidateModels = ['llama-3.3-70b-versatile', 'groq/compound-mini', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
      for (const model of candidateModels) {
        try {
          const response = await groq.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature,
            max_tokens: maxTokens,
          });

          const text = response.choices[0]?.message?.content?.trim() || '';
          if (text) {
            const latencyMs = Date.now() - start;
            const telemetry: AITelemetry = {
              provider: 'groq',
              model,
              latencyMs,
              tokensUsed: response.usage?.total_tokens,
              timestamp: new Date().toISOString(),
            };
            this.logTelemetry(telemetry);
            return { text, telemetry };
          }
        } catch (err: any) {
          errors.push(`Groq [${model}]: ${err?.message || String(err)}`);
          if (err?.status !== 404 && err?.status !== 400) {
            break; // Stop model iteration on rate-limit / server error to fall back to next provider
          }
        }
      }
    }

    // --- Provider 2: OpenRouter (Waterfall Fallback) ---
    const openrouter = this.getOpenRouter();
    if (openrouter) {
      const start = Date.now();
      const candidateModels = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct',
        'google/gemini-2.0-flash-lite-preview-02-05:free',
        'mistralai/mistral-7b-instruct:free',
      ];
      for (const model of candidateModels) {
        try {
          const response = await openrouter.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature,
            max_tokens: maxTokens,
          });

          const text = response.choices[0]?.message?.content?.trim() || '';
          if (text) {
            const latencyMs = Date.now() - start;
            const telemetry: AITelemetry = {
              provider: 'openrouter',
              model,
              latencyMs,
              tokensUsed: response.usage?.total_tokens,
              timestamp: new Date().toISOString(),
            };
            this.logTelemetry(telemetry);
            return { text, telemetry };
          }
        } catch (err: any) {
          errors.push(`OpenRouter [${model}]: ${err?.message || String(err)}`);
        }
      }
    }

    // --- Provider 3: Cloudflare Workers AI (Edge Fallback) ---
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    if (accountId && apiToken) {
      const start = Date.now();
      const cfModels = ['@cf/meta/llama-3.3-70b-instruct', '@cf/meta/llama-3.1-8b-instruct'];
      for (const model of cfModels) {
        try {
          const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
          const res = await axios.post(
            endpoint,
            {
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: maxTokens,
            },
            {
              headers: {
                Authorization: `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
              },
              timeout: 20000,
            }
          );

          const text = res.data?.result?.response?.trim() || '';
          if (text) {
            const latencyMs = Date.now() - start;
            const telemetry: AITelemetry = {
              provider: 'cloudflare',
              model,
              latencyMs,
              timestamp: new Date().toISOString(),
            };
            this.logTelemetry(telemetry);
            return { text, telemetry };
          }
        } catch (err: any) {
          errors.push(`Cloudflare AI [${model}]: ${err?.message || String(err)}`);
        }
      }
    }

    throw new Error(`[AIGateway] All multi-provider AI backends failed:\n${errors.join('\n')}`);
  }

  /**
   * Generates strictly typed JSON with schema validation using Zod.
   */
  public static async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    schema: z.ZodSchema<T>,
    options: AIGenerationOptions = {}
  ): Promise<{ data: T; telemetry: AITelemetry }> {
    const enrichedSystemPrompt = `${systemPrompt}\n\nCRITICAL: You MUST respond ONLY with a raw JSON object matching the requested schema. Do NOT include markdown explanations, intro, or wrapping outside the JSON object.`;

    const { text, telemetry } = await this.generateText(enrichedSystemPrompt, userPrompt, {
      ...options,
      temperature: options.temperature ?? 0.3,
    });

    const parsedJson = this.extractJSON(text);
    const validation = schema.safeParse(parsedJson);

    if (validation.success) {
      return { data: validation.data, telemetry };
    }

    // Attempt one automatic repair cycle if validation failed
    console.warn(`[AIGateway] Schema validation failed: ${validation.error.message}. Attempting automated repair...`);
    const repairPrompt = `The previous JSON response did not match the required schema: ${validation.error.message}.\nOriginal response:\n${text}\n\nPlease fix and return the corrected raw JSON only.`;
    
    const repairResult = await this.generateText(enrichedSystemPrompt, repairPrompt, { temperature: 0.1 });
    const repairedJson = this.extractJSON(repairResult.text);
    const finalValidation = schema.parse(repairedJson);

    return { data: finalValidation, telemetry: repairResult.telemetry };
  }

  /**
   * Robust JSON extraction handling markdown blocks, leading text, or raw strings.
   */
  private static extractJSON(text: string): any {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(clean);
    } catch {
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const substr = clean.substring(firstBrace, lastBrace + 1);
        return JSON.parse(substr);
      }
      throw new Error(`[AIGateway] Failed to parse JSON from AI response:\n${text}`);
    }
  }

  private static logTelemetry(telemetry: AITelemetry) {
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const dim = '\x1b[2m';
    const reset = '\x1b[0m';
    console.log(
      `${dim}[AI Gateway Telemetry]${reset} ${green}${telemetry.provider.toUpperCase()}${reset} (${cyan}${telemetry.model}${reset}) -> ${telemetry.latencyMs}ms ${telemetry.tokensUsed ? `| ${telemetry.tokensUsed} tokens` : ''}`
    );
  }
}
