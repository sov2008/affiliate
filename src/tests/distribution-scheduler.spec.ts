import fs from 'fs';
import path from 'path';
import {
  DistributionScheduler,
  getGaussianDelay,
  ContentQueueRepository,
  EmergencyStopController,
  LlmGatewayService,
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

async function runDistributionSchedulerSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Autonomous Stealth Distribution Scheduler Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_scheduler');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const testStateFile = path.join(testDir, 'test_scheduler_state.json');
  if (fs.existsSync(testStateFile)) fs.unlinkSync(testStateFile);

  const testRunsDir = path.join(testDir, 'runs');
  if (!fs.existsSync(testRunsDir)) {
    fs.mkdirSync(testRunsDir, { recursive: true });
  }

  // Setup instances
  EmergencyStopController.getInstance().reset('SCHEDULER_SPEC_RUNNER');
  const gateway = LlmGatewayService.getInstance();
  gateway.loadRegistry();
  gateway.updateAgent('agent-distribution-worker-04', { isPaused: false });

  const repo = ContentQueueRepository.getInstance();
  repo.clearAll();

  DistributionScheduler.resetInstance();
  const scheduler = DistributionScheduler.getInstance({
    pollIntervalMs: 5000,
    stateFilePath: testStateFile,
    runsDir: testRunsDir,
  });

  // --------------------------------------------------------------------------
  // Test 1: Gaussian Randomized Delay Generator
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Gaussian Randomized Delay Generator ---');
  const minDelay = 45 * 60 * 1000;
  const maxDelay = 90 * 60 * 1000;
  const sampleDelays: number[] = [];

  for (let i = 0; i < 50; i++) {
    const delay = getGaussianDelay(minDelay, maxDelay);
    sampleDelays.push(delay);
    assert(
      delay >= minDelay && delay <= maxDelay,
      `Sample #${i} delay ${delay}ms falls within bounds [${minDelay}, ${maxDelay}]`
    );
  }

  const avgDelay = sampleDelays.reduce((a, b) => a + b, 0) / sampleDelays.length;
  const expectedMean = (minDelay + maxDelay) / 2;
  const devRatio = Math.abs(avgDelay - expectedMean) / expectedMean;
  assert(devRatio < 0.1, `Average delay (${avgDelay}ms) is centered near mean ${expectedMean}ms (Deviation: ${(devRatio * 100).toFixed(1)}%)`);

  // --------------------------------------------------------------------------
  // Test 2: Safety Check - Worker Pause Guard
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Safety Check - Individual Worker Pause ---');
  // Enqueue test item
  const item1 = repo.enqueue({
    id: 'test-bundle-sched-01',
    campaign_id: 'cmp_trading_au',
    network: 'mylead',
    hook: 'How to manage fluctuating freelance income safely',
    body: 'Practical workflow notes for digital nomads and contractors.',
    stealth_cta: 'Curious what tools other nomads use in 2026?',
    tracking_url: 'https://mylead.global/track/12345',
    image_path: '',
    target_platform: 'reddit',
    risk_score: 5,
    status: 'APPROVED',
  });

  // Pause distribution worker in registry
  gateway.updateAgent('agent-distribution-worker-04', { isPaused: true });

  const pausedCycle = await scheduler.runCycle({ dryRun: true });
  assert(pausedCycle.dispatched === false, 'Scheduler did NOT dispatch item when worker is paused');
  assert(pausedCycle.status === 'WORKER_PAUSED', 'Cycle returned status WORKER_PAUSED');
  assert(!EmergencyStopController.getInstance().isHalted(), 'Global E-STOP is NOT tripped when individual worker is paused');

  // Re-enable distribution worker
  gateway.updateAgent('agent-distribution-worker-04', { isPaused: false });

  // --------------------------------------------------------------------------
  // Test 3: Successful Dispatch & Cooldown Enforcement
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Successful Dispatch & Platform Cooldown ---');
  // Create bundle directory in testRunsDir
  const bundleDir = path.join(testRunsDir, item1.id);
  if (!fs.existsSync(bundleDir)) fs.mkdirSync(bundleDir, { recursive: true });

  const successCycle = await scheduler.runCycle({ dryRun: true });
  assert(successCycle.dispatched === true, 'Item successfully dispatched');
  assert(successCycle.status === 'SUCCESS', 'Cycle status is SUCCESS');

  // Verify SQLite queue marked as DISPATCHED
  const updatedItem = repo.getItem(item1.id);
  assert(updatedItem?.status === 'DISPATCHED', 'Queue item status updated to DISPATCHED');
  assert(Boolean(updatedItem?.published_url), 'Queue item has published_url assigned');

  // Verify dispatch_log.json created on disk
  const dispatchLogFile = path.join(bundleDir, 'dispatch_log.json');
  assert(fs.existsSync(dispatchLogFile), 'dispatch_log.json created in runs directory');
  const logContent = JSON.parse(fs.readFileSync(dispatchLogFile, 'utf8'));
  assert(logContent.status === 'SUCCESS', 'Dispatch log records SUCCESS status');
  assert(Boolean(logContent.publishedUrl), 'Dispatch log records live published URL');

  // Test cooldown enforcement for immediate second item on same platform
  repo.enqueue({
    id: 'test-bundle-sched-02',
    campaign_id: 'cmp_trading_au',
    network: 'mylead',
    hook: 'Second immediate Reddit post test',
    body: 'This should be blocked by Reddit cooldown.',
    stealth_cta: 'Discussion question',
    tracking_url: 'https://mylead.global/track/12345',
    image_path: '',
    target_platform: 'reddit',
    risk_score: 5,
    status: 'APPROVED',
  });

  const cooldownCycle = await scheduler.runCycle({ dryRun: true });
  assert(cooldownCycle.dispatched === false, 'Second Reddit post blocked by platform cooldown');
  assert(cooldownCycle.status === 'COOLDOWN_ACTIVE', 'Cycle returned COOLDOWN_ACTIVE status');
  assert(Boolean(cooldownCycle.remainingCooldownMs && cooldownCycle.remainingCooldownMs > 0), 'Remaining cooldown is positive');

  // --------------------------------------------------------------------------
  // Test 4: Circuit Breaker on CAPTCHA / Account Flag Error
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 4] Circuit Breaker (CAPTCHA / Account Flag Detection) ---');
  assert(
    scheduler.detectCircuitBreakerTrigger('Cloudflare Turnstile captcha challenge required') === 'CAPTCHA_TRIGGERED',
    'Detected CAPTCHA challenge trigger'
  );
  assert(
    scheduler.detectCircuitBreakerTrigger('Account flagged: Shadowban or temporary suspension') === 'ACCOUNT_FLAGGED',
    'Detected Account Flagged trigger'
  );
  assert(
    scheduler.detectCircuitBreakerTrigger('Generic network timeout') === null,
    'Generic network error does not trigger circuit breaker'
  );

  // --------------------------------------------------------------------------
  // Test 5: Global E-STOP Integration
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 5] Global Emergency Stop Check ---');
  EmergencyStopController.getInstance().trigger('Simulated Operator Emergency Halt', 'SPEC_TEST');

  const estopCycle = await scheduler.runCycle({ dryRun: true });
  assert(estopCycle.dispatched === false, 'Cycle blocked when Emergency Stop is triggered');
  assert(estopCycle.status === 'ESTOP_HALTED', 'Status is ESTOP_HALTED');

  EmergencyStopController.getInstance().reset('SPEC_CLEANUP');

  // --------------------------------------------------------------------------
  // Test 6: Lifecycle State Management (Start / Stop / Status)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 6] Scheduler Lifecycle (Start / Stop) ---');
  scheduler.start(5000);
  assert(scheduler.getStatus().isRunning === true, 'Scheduler isRunning is true after start()');

  scheduler.stop();
  assert(scheduler.getStatus().isRunning === false, 'Scheduler isRunning is false after stop()');

  console.log('\n================================================================');
  console.log(`📊 SCHEDULER SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  // Cleanup test files
  try {
    if (fs.existsSync(testStateFile)) fs.unlinkSync(testStateFile);
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  if (failed > 0) {
    process.exit(1);
  }
}

runDistributionSchedulerSpec().catch((err) => {
  console.error('Fatal Distribution Scheduler Spec Error:', err);
  process.exit(1);
});
