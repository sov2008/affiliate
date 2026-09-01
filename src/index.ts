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
export * from '../core/src/orchestrator/worker-controller.js';
export * from '../core/src/analytics/umami.client.js';
export * from '../core/src/db/queueRepository.js';
export * from '../core/src/services/llm-gateway.service.js';
export * from '../core/src/services/gold-catalog.service.js';
export * from '../core/src/server/telemetry-matcher.js';
export * from '../core/src/server/routes/postback.router.js';
export * from '../core/src/automation/distribution-scheduler.js';
export * from '../core/src/skills/proxy-rotator-skill.js';
export { runApprovalLoop } from '../core/src/index.js';
