/**
 * Root Public API & Barrel Exports
 * Standardized for Affiliate Monorepo
 */

export * from '../core/src/types/pipeline.js';
export * from '../core/src/types/agent-config.js';
export * from '../core/src/agents/base.agent.js';
export * from '../core/src/agents/copy.agent.js';
export * from '../core/src/agents/guard.agent.js';
export * from '../core/src/orchestrator/pipeline.js';
export * from '../core/src/analytics/umami.client.js';
export * from '../core/src/db/queueRepository.js';
export * from '../core/src/services/llm-gateway.service.js';
export { runApprovalLoop } from '../core/src/index.js';
