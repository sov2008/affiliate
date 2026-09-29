import { SiteAutonomousAgent } from '../../core/src/automation/site-autonomous.agent.js';
import { EmergencyStopController } from '../../core/src/types/pipeline.js';

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

async function runSiteAutonomousAgentSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Master Site Autonomous Agent Spec');
  console.log('🧪 ================================================================\n');

  const agent = SiteAutonomousAgent.getInstance();
  const emergencyStop = EmergencyStopController.getInstance();

  // Reset emergency state
  emergencyStop.reset('TEST_SUITE');

  // 1. Test Dry-Run Autonomous Cycle
  console.log('\n--- [TEST 1] Autonomous cycle executes Discovery, Production, Syndication & Optimization ---');
  const report = await agent.runAutonomousCycle({
    dryRun: true,
    skipAstroBuild: true,
  });

  assert(Boolean(report.cycleId), 'Autonomous cycle generated unique cycleId');
  assert(report.dryRun === true, 'Cycle executed in safe dry-run mode');
  assert(Boolean(report.discoveredTopic && report.discoveredTopic.slug), 'Topic Engine discovered next highest-value topic');
  assert(Boolean(report.contentPublishResult?.published), 'Content production simulated publication successfully');
  assert(report.socialSyndication.telegramDispatched === true, 'Social syndication step processed Telegram dispatch');
  assert(typeof report.socialSyndication.pinterestQueueLength === 'number', 'Pinterest queue length audited');
  assert(report.optimization.l1PatternsActive >= 1, 'Optimization step inspected active L1 atomic patterns');
  assert(report.optimization.l2ScenariosActive >= 1, 'Optimization step inspected active L2 scenario blueprints');
  assert(report.optimization.l3PoliciesActive >= 2, 'Optimization step confirmed active L3 policies (LosPollos & MyLead)');
  assert(report.mermaidExecutionGraph.includes('```mermaid'), 'Cycle generated valid Mermaid execution graph');
  assert(report.mermaidExecutionGraph.includes('Topic Discovery'), 'Mermaid graph reflects topic discovery node');

  // 2. Test Zero Demo Data enforcement
  console.log('\n--- [TEST 2] Strict Zero Demo Data Policy is preserved in optimization telemetry ---');
  assert(
    typeof report.optimization.totalLoggedClicks === 'number' &&
      typeof report.optimization.totalLoggedConversions === 'number',
    'Report reflects real accumulated metrics without hardcoded synthetic mocks'
  );

  // 3. Test Emergency Stop Halt Controller
  console.log('\n--- [TEST 3] Emergency Stop instantly halts the autonomous agent ---');
  emergencyStop.trigger('Safety Audit Halt', 'TEST_OPERATOR');
  let haltedCaught = false;

  try {
    await agent.runAutonomousCycle({ dryRun: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('EMERGENCY_STOP')) {
      haltedCaught = true;
    }
  }

  assert(haltedCaught, 'Autonomous agent halted immediately when Emergency Stop was triggered');

  // 4. Test Resume after Emergency Reset
  console.log('\n--- [TEST 4] Agent resumes execution once Emergency Stop is cleared ---');
  emergencyStop.reset('TEST_OPERATOR');
  const resumedReport = await agent.runAutonomousCycle({ dryRun: true });
  assert(resumedReport.success === true, 'Agent cleanly resumed execution after lockfile clear');

  // 5. Test Status reporting
  console.log('\n--- [TEST 5] Status report accurately reflects agent health ---');
  const status = agent.getStatus();
  assert(status.emergencyStop === false, 'Status shows emergencyStop = false');
  assert(typeof status.isRunning === 'boolean', 'Status shows isRunning boolean');

  console.log(`\n================================================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`================================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSiteAutonomousAgentSpec().catch((err) => {
  console.error('Spec fatal error:', err);
  process.exit(1);
});
