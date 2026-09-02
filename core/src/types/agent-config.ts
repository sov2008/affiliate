/**
 * Agent Configuration, Roles, Clearance Tiers, and Tool Permissions
 * Affiliate Operations Multi-Agent Architecture
 */

export type AgentRole =
  | 'SCOUT_SCRAPER'
  | 'CONTEXT_COPYWRITER'
  | 'COPYWRITER_LOSPOLLOS_DATING'
  | 'COPYWRITER_MYLEAD_FINANCE'
  | 'COMPLIANCE_GUARD'
  | 'DISTRIBUTION_WORKER'
  | 'POSTBACK_MATCHER'
  | 'STRATEGIST_ORCHESTRATOR';

export type ClearanceTier = 'FAST_LPU' | 'BALANCED' | 'DEEP_REASONING';

export type ToolPermission =
  | 'PLAYWRIGHT_AUTOMATION'
  | 'UMAMI_ANALYTICS'
  | 'EVIDENCE_WRITER'
  | 'DIRECT_HTTP_POST'
  | 'PROXIES_ROTATION';

export interface AgentMetrics {
  passRate: number;
  avgLatencyMs: number;
  totalRuns: number;
}

export interface AgentConfig {
  id: string;
  role: AgentRole;
  name: string;
  clearanceTier: ClearanceTier;
  primaryModel: string;
  fallbackModel: string;
  systemPrompt: string;
  tokenBudgetDaily: number;
  tokensConsumedToday: number;
  requireHumanReview: boolean;
  allowedTools: ToolPermission[];
  isPaused: boolean;
  metrics: AgentMetrics;
}

export interface AgentRegistry {
  version: string;
  lastUpdated: string;
  agents: AgentConfig[];
}
