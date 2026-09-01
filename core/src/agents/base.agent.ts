import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { EmergencyStopController } from '../types/pipeline.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface CompleteJsonOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AgentExecutionError extends Error {
  constructor(
    public readonly agentName: string,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(`[${agentName}] ${message}`);
    this.name = 'AgentExecutionError';
  }
}

export class MalformedJsonError extends AgentExecutionError {
  constructor(agentName: string, message: string, public readonly rawPayload?: string, originalError?: unknown) {
    super(agentName, `[MALFORMED_JSON] ${message}`, originalError);
    this.name = 'MalformedJsonError';
  }
}

export abstract class BaseAgent {
  protected readonly agentName: string;
  protected readonly groqClient: OpenAI;
  protected readonly openRouterClient?: OpenAI;
  protected readonly defaultModel: string = 'qwen/qwen3.8-27b';

  constructor(agentName: string) {
    this.agentName = agentName;

    const groqKey = process.env.GROQ_API_KEY || '';
    if (!groqKey) {
      console.warn(`\x1b[33m[${agentName}] Warning: GROQ_API_KEY is not defined in environment.\x1b[0m`);
    }

    this.groqClient = new OpenAI({
      apiKey: groqKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      this.openRouterClient = new OpenAI({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://antigravity.ai',
          'X-Title': 'Antigravity Affiliate Agent',
        },
      });
    }
  }

  /**
   * Enforces immediate atomic emergency stop check before executing agent operations.
   */
  protected checkEmergencyStop(): void {
    EmergencyStopController.getInstance().check();
  }

  /**
   * Executes LLM inference with enforced structured JSON output, deterministic temperature,
   * atomic emergency halt verification, 1 automatic retry on malformed output, and strict type parsing.
   */
  public async completeJson<T>(
    systemPrompt: string,
    userPrompt: string,
    options: CompleteJsonOptions = {}
  ): Promise<T> {
    // 1. Pre-execution atomic halt check
    this.checkEmergencyStop();

    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 4096;

    const sanitizedSystemPrompt = systemPrompt.includes('JSON')
      ? systemPrompt
      : `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object.`;

    // Attempt 1
    try {
      const response = await this.groqClient.chat.completions.create({
        model,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: sanitizedSystemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Received empty completion payload from Groq.');
      }

      return this.parseJsonSafely<T>(content);
    } catch (err: unknown) {
      // If halted by E-STOP, rethrow immediately without retries
      this.checkEmergencyStop();

      console.warn(`\x1b[33m[${this.agentName}] Attempt 1 failed (${err instanceof Error ? err.message : String(err)}). Triggering 1 automatic retry...\x1b[0m`);

      // Attempt 2: Retry with explicit strict JSON enforcement
      try {
        this.checkEmergencyStop();
        const retryResponse = await this.groqClient.chat.completions.create({
          model,
          temperature: 0.1, // Lower temperature for deterministic formatting
          max_tokens: maxTokens,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${sanitizedSystemPrompt}\nCRITICAL: Respond STRICTLY with raw JSON. No explanations, no markdown fences.` },
            { role: 'user', content: userPrompt },
          ],
        });

        const retryContent = retryResponse.choices[0]?.message?.content;
        if (!retryContent) {
          throw new Error('Empty payload on retry attempt.');
        }

        return this.parseJsonSafely<T>(retryContent);
      } catch (retryErr: unknown) {
        this.checkEmergencyStop();

        // Fallback to OpenRouter if available
        if (this.openRouterClient) {
          console.warn(`\x1b[33m[${this.agentName}] Groq retry failed. Attempting OpenRouter fallback...\x1b[0m`);
          try {
            this.checkEmergencyStop();
            const fallbackResponse = await this.openRouterClient.chat.completions.create({
              model: 'meta-llama/llama-3.3-70b-instruct:free',
              temperature: 0.1,
              max_tokens: maxTokens,
              response_format: { type: 'json_object' },
              messages: [
                { role: 'system', content: sanitizedSystemPrompt },
                { role: 'user', content: userPrompt },
              ],
            });

            const fbContent = fallbackResponse.choices[0]?.message?.content;
            if (fbContent) {
              return this.parseJsonSafely<T>(fbContent);
            }
          } catch (fbErr: unknown) {
            this.checkEmergencyStop();
          }
        }

        const parseMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        throw new MalformedJsonError(
          this.agentName,
          `LLM generated malformed JSON after retry and fallback attempts: ${parseMsg}`,
          undefined,
          retryErr
        );
      }
    }
  }

  protected parseJsonSafely<T>(rawContent: string): T {
    try {
      let cleaned = rawContent.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }
      return JSON.parse(cleaned) as T;
    } catch (jsonErr: unknown) {
      const parseMsg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      throw new MalformedJsonError(
        this.agentName,
        `Failed to parse JSON: ${parseMsg}`,
        rawContent,
        jsonErr
      );
    }
  }

  /**
   * Abstract execution method to be implemented by concrete agent workers.
   */
  public abstract execute(...args: unknown[]): Promise<unknown>;
}
