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

export abstract class BaseAgent {
  protected readonly agentName: string;
  protected readonly groqClient: OpenAI;
  protected readonly openRouterClient?: OpenAI;
  protected readonly defaultModel: string = 'llama-3.3-70b-versatile';

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
   * atomic emergency halt verification, and strict type parsing.
   */
  public async completeJson<T>(
    systemPrompt: string,
    userPrompt: string,
    options: CompleteJsonOptions = {}
  ): Promise<T> {
    // 1. Atomic halt check before LLM invocation
    this.checkEmergencyStop();

    const model = options.model || this.defaultModel;
    const temperature = options.temperature ?? 0.2;
    const maxTokens = options.maxTokens ?? 4096;

    // Ensure system prompt instructs JSON response
    const sanitizedSystemPrompt = systemPrompt.includes('JSON')
      ? systemPrompt
      : `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid JSON object.`;

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
      const errorMsg = err instanceof Error ? err.message : String(err);

      // Fallback to OpenRouter if available
      if (this.openRouterClient) {
        console.warn(
          `\x1b[33m[${this.agentName}] Groq call failed (${errorMsg}). Retrying via OpenRouter fallback...\x1b[0m`
        );
        try {
          this.checkEmergencyStop();
          const fallbackResponse = await this.openRouterClient.chat.completions.create({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: sanitizedSystemPrompt },
              { role: 'user', content: userPrompt },
            ],
          });

          const fbContent = fallbackResponse.choices[0]?.message?.content;
          if (!fbContent) {
            throw new Error('Received empty completion from OpenRouter fallback.');
          }

          return this.parseJsonSafely<T>(fbContent);
        } catch (fallbackErr: unknown) {
          const fbMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
          throw new AgentExecutionError(
            this.agentName,
            `Primary and fallback LLM inference failed: Groq (${errorMsg}) | OpenRouter (${fbMsg})`,
            fallbackErr
          );
        }
      }

      throw new AgentExecutionError(this.agentName, `LLM inference failed: ${errorMsg}`, err);
    }
  }

  private parseJsonSafely<T>(rawContent: string): T {
    try {
      let cleaned = rawContent.trim();
      // Remove markdown ```json fences if present
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      }
      return JSON.parse(cleaned) as T;
    } catch (jsonErr: unknown) {
      const parseMsg = jsonErr instanceof Error ? jsonErr.message : String(jsonErr);
      throw new AgentExecutionError(
        this.agentName,
        `Failed to parse JSON response: ${parseMsg}. Raw payload: "${rawContent.slice(0, 150)}..."`,
        jsonErr
      );
    }
  }

  /**
   * Abstract execution method to be implemented by concrete agent workers.
   */
  public abstract execute(...args: unknown[]): Promise<unknown>;
}
