import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AgentConfig, AgentRegistry } from '../types/agent-config.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { MalformedJsonError } from '../agents/base.agent.js';

// Ensure environment variables are loaded
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface InferencePayload {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface InferenceResult<T = unknown> {
  rawText: string;
  parsedJson?: T;
  providerUsed: string;
  modelUsed: string;
  latencyMs: number;
  tokensUsed: number;
  tokensConsumedToday: number;
  tokenBudgetRemaining: number;
}

export class LlmGatewayService {
  private static instance: LlmGatewayService;
  private readonly agents: Map<string, AgentConfig> = new Map();
  private readonly groqClient?: OpenAI;
  private readonly openRouterClient?: OpenAI;
  private registryFilePath: string;

  private constructor() {
    // 1. Initialize API Clients
    const groqKey = process.env.GROQ_API_KEY || '';
    if (groqKey) {
      this.groqClient = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }

    const openRouterKey = process.env.OPENROUTER_API_KEY || '';
    if (openRouterKey) {
      this.openRouterClient = new OpenAI({
        apiKey: openRouterKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://affiliate-ops.internal',
          'X-Title': 'AffiliateOps-MultiAgent-Gateway',
        },
      });
    }

    // 2. Resolve registry file path
    const candidatePaths = [
      path.resolve(process.cwd(), 'src/config/agent-registry.json'),
      path.resolve(process.cwd(), 'core/src/config/agent-registry.json'),
      path.resolve(__dirname, '../config/agent-registry.json'),
    ];

    this.registryFilePath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];
    this.loadRegistry();
  }

  public static getInstance(): LlmGatewayService {
    if (!LlmGatewayService.instance) {
      LlmGatewayService.instance = new LlmGatewayService();
    }
    return LlmGatewayService.instance;
  }

  /**
   * Load or refresh agents from registry JSON
   */
  public loadRegistry(): void {
    try {
      if (fs.existsSync(this.registryFilePath)) {
        const raw = fs.readFileSync(this.registryFilePath, 'utf8');
        const data = JSON.parse(raw) as AgentRegistry;
        if (Array.isArray(data.agents)) {
          this.agents.clear();
          for (const a of data.agents) {
            this.agents.set(a.id, a);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[LlmGatewayService] Could not read registry file: ${msg}`);
    }
  }

  public getAgent(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId);
  }

  public listAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  public updateAgent(agentId: string, partial: Partial<AgentConfig>): boolean {
    const existing = this.agents.get(agentId);
    if (!existing) return false;

    const updated: AgentConfig = { ...existing, ...partial };
    this.agents.set(agentId, updated);
    this.saveRegistry();
    return true;
  }

  public resetDailyTokenBudgets(): void {
    for (const [id, agent] of this.agents.entries()) {
      agent.tokensConsumedToday = 0;
      this.agents.set(id, agent);
    }
    this.saveRegistry();
  }

  private saveRegistry(): void {
    try {
      const registry: AgentRegistry = {
        version: '2.0.0',
        lastUpdated: new Date().toISOString(),
        agents: Array.from(this.agents.values()),
      };
      fs.writeFileSync(this.registryFilePath, JSON.stringify(registry, null, 2), 'utf8');
    } catch {}
  }

  /**
   * Clean JSON markdown fences
   */
  private cleanJsonString(raw: string): string {
    return raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  /**
   * Normalize model names for provider
   */
  private parseModelSpec(modelSpec: string): { provider: 'groq' | 'openrouter' | 'direct'; modelName: string } {
    if (modelSpec.startsWith('groq/')) {
      return { provider: 'groq', modelName: modelSpec.replace('groq/', '') };
    }
    if (modelSpec.startsWith('openrouter/')) {
      return { provider: 'openrouter', modelName: modelSpec.replace('openrouter/', '') };
    }
    return { provider: 'groq', modelName: modelSpec };
  }

  /**
   * Execute multi-provider inference with token budgeting, circuit breaking, and 1-retry fallback
   */
  public async executeInference<T = unknown>(
    agentId: string,
    payload: InferencePayload
  ): Promise<InferenceResult<T>> {
    const startTime = Date.now();

    // 1. Verify Agent Registration
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`[AGENT_NOT_FOUND] Agent '${agentId}' is not registered in LLM Gateway registry.`);
    }

    // 2. Verify Worker State
    if (agent.isPaused) {
      throw new Error(`[AGENT_PAUSED] Agent '${agentId}' (${agent.name}) is currently paused.`);
    }

    // 3. Verify Atomic E-STOP
    EmergencyStopController.getInstance().check();

    // 4. Token Budget Guard
    const estimatedInputTokens = Math.ceil((payload.systemPrompt.length + payload.userPrompt.length) / 3.8);
    if (agent.tokensConsumedToday + estimatedInputTokens > agent.tokenBudgetDaily) {
      throw new Error(
        `[TOKEN_BUDGET_EXCEEDED] Agent '${agentId}' daily budget exceeded (${agent.tokensConsumedToday}/${agent.tokenBudgetDaily} tokens consumed).`
      );
    }

    const { primaryModel, fallbackModel } = agent;
    const primarySpec = this.parseModelSpec(primaryModel);
    const fallbackSpec = this.parseModelSpec(fallbackModel);

    let rawOutput = '';
    let providerUsed = primarySpec.provider;
    let modelUsed = primarySpec.modelName;
    let attempts = 0;
    let success = false;

    // Helper: Execute single completion attempt
    const runCompletion = async (
      provider: 'groq' | 'openrouter' | 'direct',
      model: string,
      temperature: number
    ): Promise<string> => {
      const messages = [
        { role: 'system' as const, content: payload.systemPrompt },
        { role: 'user' as const, content: payload.userPrompt },
      ];

      if (provider === 'groq' && this.groqClient) {
        const response = await this.groqClient.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: payload.maxTokens || 2048,
          response_format: payload.jsonMode ? { type: 'json_object' } : undefined,
        });
        return response.choices[0]?.message?.content || '';
      }

      if (provider === 'openrouter' && this.openRouterClient) {
        const response = await this.openRouterClient.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens: payload.maxTokens || 2048,
          response_format: payload.jsonMode ? { type: 'json_object' } : undefined,
        });
        return response.choices[0]?.message?.content || '';
      }

      throw new Error(`Provider '${provider}' client is not configured or missing API key.`);
    };

    // 5. Primary execution attempt
    try {
      attempts++;
      rawOutput = await runCompletion(primarySpec.provider, primarySpec.modelName, payload.temperature ?? 0.3);
      success = true;
    } catch (primaryErr: unknown) {
      const errMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.warn(
        `[LlmGatewayService] Primary provider ${primarySpec.provider} (${primarySpec.modelName}) failed for ${agentId}: ${errMsg}. Attempting fallback...`
      );

      // 6. Secondary fallback execution attempt
      try {
        attempts++;
        providerUsed = fallbackSpec.provider;
        modelUsed = fallbackSpec.modelName;
        rawOutput = await runCompletion(fallbackSpec.provider, fallbackSpec.modelName, 0.1);
        success = true;
      } catch (fallbackErr: unknown) {
        const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        throw new Error(
          `[GATEWAY_ALL_PROVIDERS_FAILED] Primary (${primaryModel}) and Fallback (${fallbackModel}) failed for agent '${agentId}'. Last error: ${fallbackMsg}`
        );
      }
    }

    // 7. Deterministic JSON Validation & 1-Retry Mechanism
    let parsedJson: T | undefined;

    if (payload.jsonMode) {
      try {
        const cleaned = this.cleanJsonString(rawOutput);
        parsedJson = JSON.parse(cleaned) as T;
      } catch (jsonErr: unknown) {
        console.warn(`[LlmGatewayService] JSON parsing failed for ${agentId}. Triggering 1 automatic retry...`);
        try {
          attempts++;
          const retryPrompt = `${payload.userPrompt}\n\nCRITICAL FIX: Your previous response was not valid parseable JSON. Respond with ONLY the raw JSON object and nothing else.`;
          const retryOutput = await runCompletion(providerUsed as any, modelUsed, 0.1);
          rawOutput = retryOutput;
          parsedJson = JSON.parse(this.cleanJsonString(retryOutput)) as T;
        } catch (retryJsonErr: unknown) {
          const retryMsg = retryJsonErr instanceof Error ? retryJsonErr.message : String(retryJsonErr);
          throw new MalformedJsonError(agentId, retryMsg, rawOutput, retryJsonErr);
        }
      }
    }

    // 8. Telemetry & Metrics Accounting
    const latencyMs = Date.now() - startTime;
    const estimatedOutputTokens = Math.ceil(rawOutput.length / 3.8);
    const tokensUsed = estimatedInputTokens + estimatedOutputTokens;

    agent.tokensConsumedToday += tokensUsed;
    agent.metrics.totalRuns += 1;
    agent.metrics.avgLatencyMs =
      agent.metrics.totalRuns === 1
        ? latencyMs
        : Math.round((agent.metrics.avgLatencyMs * (agent.metrics.totalRuns - 1) + latencyMs) / agent.metrics.totalRuns);
    agent.metrics.passRate = success ? 100.0 : Math.max(0, agent.metrics.passRate - 5);

    this.agents.set(agentId, agent);
    this.saveRegistry();

    return {
      rawText: rawOutput,
      parsedJson,
      providerUsed,
      modelUsed,
      latencyMs,
      tokensUsed,
      tokensConsumedToday: agent.tokensConsumedToday,
      tokenBudgetRemaining: Math.max(0, agent.tokenBudgetDaily - agent.tokensConsumedToday),
    };
  }
}
