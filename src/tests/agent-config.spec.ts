import fs from 'fs';
import path from 'path';
import {
  WorkerController,
  LlmGatewayService,
  EmergencyStopController,
  RawContext,
} from '../index.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failed++;
  }
}

async function runAgentConfigSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Agent Configuration & Worker Controller Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const gateway = LlmGatewayService.getInstance();
  const eStop = EmergencyStopController.getInstance();
  const controller = new WorkerController();

  eStop.reset('SPEC_TEST_RUNNER');
  gateway.loadRegistry();

  const testContext: RawContext = {
    platform: 'reddit',
    sourceUrl: 'https://reddit.com/r/remotework/comments/banking',
    topicTitle: 'How to manage multi-currency accounts safely',
    sourceText: 'Looking for advice on low-fee international banking.',
    targetAudiencePain: 'High conversion fees and account freezes',
    metadata: { campaign_id: 'cmp_trading_au', network: 'mylead' },
  };

  // --------------------------------------------------------------------------
  // Test A: Single worker pause does not trigger global E-STOP
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST A] Single Worker Pause vs Global E-STOP ---');
  gateway.updateAgent('agent-context-copywriter-02', { isPaused: true });

  const pausedArtifact = await controller.executePipeline(testContext, 'finance-quiz-v1');
  assert(
    pausedArtifact.status === 'WORKER_SKIPPED_PAUSED',
    `Paused copywriter returned status WORKER_SKIPPED_PAUSED (Actual: ${pausedArtifact.status})`
  );
  assert(
    !eStop.isHalted(),
    'Global E-STOP is NOT halted when an individual worker is paused'
  );
  assert(
    gateway.getAgent('agent-compliance-guard-03')?.isPaused === false,
    'Other agents (Compliance Guard) remain active'
  );

  // Restore copywriter
  gateway.updateAgent('agent-context-copywriter-02', { isPaused: false });

  // --------------------------------------------------------------------------
  // Test B: Token budget limit stops further LLM calls
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST B] Token Budget Daily Limit Alert ---');
  const budgetTestAgentId = 'agent-postback-matcher-05';
  const originalBudget = gateway.getAgent(budgetTestAgentId)?.tokenBudgetDaily || 200000;

  gateway.updateAgent(budgetTestAgentId, { tokenBudgetDaily: 10, tokensConsumedToday: 100 });

  let budgetAlertRaised = false;
  try {
    await gateway.executeInference(budgetTestAgentId, {
      systemPrompt: 'System',
      userPrompt: 'User prompt',
      jsonMode: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('TOKEN_BUDGET_EXCEEDED')) {
      budgetAlertRaised = true;
    }
  }

  assert(budgetAlertRaised, 'Gateway raised alert and stopped LLM call when token budget exceeded');
  gateway.updateAgent(budgetTestAgentId, { tokenBudgetDaily: originalBudget, tokensConsumedToday: 0 });

  // --------------------------------------------------------------------------
  // Test C: Provider Fallback on Primary Model Failure
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST C] Seamless Provider Fallback ---');
  const fallbackTestAgentId = 'agent-scout-scraper-01';
  const originalPrimary = gateway.getAgent(fallbackTestAgentId)?.primaryModel || 'groq/qwen/qwen3.8-27b';

  // Set non-existent primary model on Groq to simulate failure
  gateway.updateAgent(fallbackTestAgentId, {
    primaryModel: 'groq/invalid-nonexistent-model-404',
    fallbackModel: 'groq/qwen/qwen3.8-27b',
  });

  const fallbackResult = await gateway.executeInference<{ status: string }>(fallbackTestAgentId, {
    systemPrompt: 'Respond strictly in JSON: {"status": "fallback_success"}',
    userPrompt: 'Test prompt for fallback mechanism',
    jsonMode: true,
  });

  assert(
    fallbackResult.parsedJson?.status === 'fallback_success',
    'Provider fallback triggered seamlessly on primary failure and returned parsed output'
  );
  assert(
    fallbackResult.modelUsed === 'qwen/qwen3.8-27b',
    `Fallback model executed successfully (Model: ${fallbackResult.modelUsed})`
  );

  // Restore agent models
  gateway.updateAgent(fallbackTestAgentId, {
    primaryModel: originalPrimary,
    fallbackModel: 'openrouter/qwen/qwen-2.5-72b-instruct',
  });

  // --------------------------------------------------------------------------
  // Test D: Review Gate flag routes bundles to /runs/pending/
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST D] Review Gate Routing to /runs/pending/ ---');
  gateway.updateAgent('agent-context-copywriter-02', { requireHumanReview: true });
  gateway.updateAgent('agent-distribution-worker-04', {
    requireHumanReview: true,
    allowedTools: ['PLAYWRIGHT_AUTOMATION', 'DIRECT_HTTP_POST', 'EVIDENCE_WRITER'],
  });

  const reviewGateArtifact = await controller.executePipeline(testContext, 'finance-quiz-v1');
  assert(
    reviewGateArtifact.status === 'AWAITING_HUMAN_APPROVAL',
    `Review Gate marked bundle as AWAITING_HUMAN_APPROVAL (Actual: ${reviewGateArtifact.status})`
  );

  const pendingBundlePath = path.resolve(
    process.cwd(),
    'runs',
    'pending',
    reviewGateArtifact.id,
    'bundle.json'
  );
  assert(
    fs.existsSync(pendingBundlePath),
    `Evidence Bundle routed to /runs/pending/${reviewGateArtifact.id}/bundle.json`
  );

  if (fs.existsSync(pendingBundlePath)) {
    const raw = fs.readFileSync(pendingBundlePath, 'utf8');
    const parsed = JSON.parse(raw);
    assert(
      parsed.status === 'AWAITING_HUMAN_APPROVAL',
      'Persisted pending bundle contains status AWAITING_HUMAN_APPROVAL'
    );
  }

  // Summary
  console.log('\n📊 ================================================================');
  console.log(`📊 Agent Config Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('📊 ================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAgentConfigSpec().catch((err) => {
  console.error('Fatal Spec Error:', err);
  process.exit(1);
});
