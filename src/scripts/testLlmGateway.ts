import { LlmGatewayService } from '../services/llm-gateway.service.js';
import { EmergencyStopController } from '../types/pipeline.js';

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

async function runLlmGatewayTests() {
  console.log('\n🧠 ================================================================');
  console.log('🧠 Multi-Provider LLM Gateway: Token Budget & Tier Routing Tests');
  console.log('🧠 ================================================================\n');

  const gateway = LlmGatewayService.getInstance();
  const eStop = EmergencyStopController.getInstance();
  eStop.reset('TEST_RUNNER');

  // Test 1: Registry initialization and listing
  console.log('\n--- 1. Registry & Agent Listing ---');
  const agents = gateway.listAgents();
  assert(agents.length === 6, `Agent registry loaded 6 roles (Actual: ${agents.length})`);
  
  const copywriterAgent = gateway.getAgent('agent-context-copywriter-02');
  assert(copywriterAgent !== undefined, 'Copywriter agent registered (agent-context-copywriter-02)');
  assert(copywriterAgent?.clearanceTier === 'BALANCED', 'Copywriter clearance tier is BALANCED');

  // Test 2: Standard JSON Inference & Metrics Recording
  console.log('\n--- 2. Live Tier Routing & JSON Inference ---');
  const initialTokens = copywriterAgent?.tokensConsumedToday || 0;
  const initialRuns = copywriterAgent?.metrics.totalRuns || 0;

  const result = await gateway.executeInference<{ headline: string; hook: string }>(
    'agent-context-copywriter-02',
    {
      systemPrompt: 'You are an organic copywriter. Respond ONLY with a valid JSON object: {"headline": "Test Title", "hook": "Test Hook"}',
      userPrompt: 'Generate a quick test hook for a finance quiz.',
      jsonMode: true,
    }
  );

  assert(result.parsedJson !== undefined, 'Gateway successfully parsed JSON response');
  assert(Boolean(result.parsedJson?.headline), 'Parsed JSON has headline field');
  assert(result.tokensUsed > 0, `Tokens calculated and tracked (Used: ${result.tokensUsed} tokens)`);
  assert(result.latencyMs > 0, `Latency recorded (Latency: ${result.latencyMs}ms)`);
  assert(result.providerUsed === 'groq', `Tier routing selected primary provider: ${result.providerUsed}`);

  const updatedCopywriter = gateway.getAgent('agent-context-copywriter-02');
  assert(
    (updatedCopywriter?.tokensConsumedToday || 0) > initialTokens,
    `Daily token budget counter incremented (${updatedCopywriter?.tokensConsumedToday}/${updatedCopywriter?.tokenBudgetDaily})`
  );
  assert(
    (updatedCopywriter?.metrics.totalRuns || 0) === initialRuns + 1,
    `Agent metrics totalRuns incremented (Now: ${updatedCopywriter?.metrics.totalRuns})`
  );

  // Test 3: Token Budget Exceeded Guard
  console.log('\n--- 3. Token Budget Daily Limit Guard ---');
  const budgetTestAgentId = 'agent-postback-matcher-05';
  const originalBudget = gateway.getAgent(budgetTestAgentId)?.tokenBudgetDaily || 200000;
  
  // Set budget artificially low
  gateway.updateAgent(budgetTestAgentId, { tokenBudgetDaily: 5, tokensConsumedToday: 10 });
  
  let budgetBlocked = false;
  try {
    await gateway.executeInference(budgetTestAgentId, {
      systemPrompt: 'System',
      userPrompt: 'User prompt that exceeds budget limit',
      jsonMode: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('TOKEN_BUDGET_EXCEEDED')) {
      budgetBlocked = true;
    }
  }

  assert(budgetBlocked, 'Gateway blocked inference when daily token budget is exceeded (TOKEN_BUDGET_EXCEEDED)');
  // Restore budget
  gateway.updateAgent(budgetTestAgentId, { tokenBudgetDaily: originalBudget, tokensConsumedToday: 0 });

  // Test 4: Paused Worker State Guard
  console.log('\n--- 4. Paused Worker State Guard ---');
  const pauseTestAgentId = 'agent-scout-scraper-01';
  gateway.updateAgent(pauseTestAgentId, { isPaused: true });

  let pauseBlocked = false;
  try {
    await gateway.executeInference(pauseTestAgentId, {
      systemPrompt: 'System',
      userPrompt: 'Hello',
      jsonMode: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('AGENT_PAUSED')) {
      pauseBlocked = true;
    }
  }

  assert(pauseBlocked, 'Gateway blocked inference for paused agent (AGENT_PAUSED)');
  // Restore agent active state
  gateway.updateAgent(pauseTestAgentId, { isPaused: false });

  // Test 5: Atomic E-STOP Circuit Breaker
  console.log('\n--- 5. Atomic E-STOP Circuit Breaker ---');
  eStop.trigger('Gateway test emergency stop', 'QA_TESTER');

  let eStopBlocked = false;
  try {
    await gateway.executeInference('agent-context-copywriter-02', {
      systemPrompt: 'System',
      userPrompt: 'Hello',
      jsonMode: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('EMERGENCY_STOP')) {
      eStopBlocked = true;
    }
  }

  assert(eStopBlocked, 'Gateway blocked inference when E-STOP is active ([EMERGENCY_STOP])');
  eStop.reset('TEST_CLEANUP');

  // Summary
  console.log('\n📊 ================================================================');
  console.log(`📊 LLM Gateway Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('📊 ================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLlmGatewayTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
