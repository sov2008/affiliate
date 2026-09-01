import express from 'express';
import http from 'http';
import { actionsRouter } from '../server/routes/actions.router.js';
import { EmergencyStopController } from '../../core/src/types/pipeline.js';
import { ContentQueueRepository } from '../../core/src/db/queueRepository.js';

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

async function runActionsRouterTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Operator Action Dispatcher Router Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const app = express();
  app.use(express.json());
  app.use('/api/actions', actionsRouter);

  const server = http.createServer(app);
  const PORT = 5589;

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api/actions`;

  try {
    // --- [TEST 1] E-STOP Controls: Trigger & Reset ---
    console.log('--- [TEST 1] E-STOP Controls: Trigger & Reset ---');
    const eStop = EmergencyStopController.getInstance();
    eStop.clear('INIT');

    // 1.1 Trigger E-STOP
    const resEstopTrigger = await fetch(`${baseUrl}/estop/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'QA Test Emergency Stop', operator: 'QA_TESTER' }),
    });
    const jsonEstopTrigger = await resEstopTrigger.json();
    assert(resEstopTrigger.status === 200, 'POST /estop/trigger returns HTTP 200');
    assert(jsonEstopTrigger.success === true, 'Response contains success: true');
    assert(jsonEstopTrigger.isHalted === true, 'Response reports isHalted: true');
    assert(eStop.isHalted() === true, 'EmergencyStopController reports halted state');

    // 1.2 Force Dispatch blocked by E-STOP
    const resBlockedDispatch = await fetch(`${baseUrl}/force-dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert(resBlockedDispatch.status === 403, 'POST /force-dispatch returns HTTP 403 when E-STOP is active');

    // 1.3 Reset E-STOP
    const resEstopReset = await fetch(`${baseUrl}/estop/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: 'QA_TESTER' }),
    });
    const jsonEstopReset = await resEstopReset.json();
    assert(resEstopReset.status === 200, 'POST /estop/reset returns HTTP 200');
    assert(jsonEstopReset.isHalted === false, 'Response reports isHalted: false');
    assert(eStop.isHalted() === false, 'EmergencyStopController cleared successfully');

    // --- [TEST 2] Generate Batch Action ---
    console.log('\n--- [TEST 2] Generate Batch Action ---');
    const resBatch = await fetch(`${baseUrl}/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 2,
        campaignId: 'cmp_trading_au',
        platform: 'reddit',
        niche: 'finance',
      }),
    });
    const jsonBatch = await resBatch.json();
    assert(resBatch.status === 200, 'POST /generate-batch returns HTTP 200');
    assert(jsonBatch.success === true, 'Batch generation reports success: true');
    assert(jsonBatch.count === 2, 'Generated requested count (2) of evidence bundles');
    assert(Array.isArray(jsonBatch.bundles), 'Bundles list returned in JSON');

    // Verify item in queue
    const queueRepo = ContentQueueRepository.getInstance();
    const pending = queueRepo.listPending(10);
    assert(pending.length >= 2, 'Generated items registered in ContentQueueRepository');

    // --- [TEST 3] Force Dispatch Action ---
    console.log('\n--- [TEST 3] Force Dispatch Action ---');
    // Mark one item as APPROVED
    const itemToApprove = pending[0];
    queueRepo.markApproved(itemToApprove.id);

    const resDispatch = await fetch(`${baseUrl}/force-dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: false }),
    });
    const jsonDispatch = await resDispatch.json();
    assert(resDispatch.status === 200, 'POST /force-dispatch returns HTTP 200');
    assert(jsonDispatch.success === true, 'Force dispatch executed successfully');
    assert(jsonDispatch.result !== undefined, 'Dispatch result payload returned');

    // --- [TEST 4] Trigger Scout Action ---
    console.log('\n--- [TEST 4] Trigger Scout Action ---');
    const resScout = await fetch(`${baseUrl}/trigger-scout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network: 'both', platform: 'reddit' }),
    });
    const jsonScout = await resScout.json();
    assert(resScout.status === 200, 'POST /trigger-scout returns HTTP 200');
    assert(jsonScout.success === true, 'Scout discovery reports success: true');
    assert(jsonScout.result.scoutedCount >= 1, 'Scouted at least 1 candidate offer');
    assert(jsonScout.result.topOffer !== undefined, 'AI Scorer picked topOffer');

    // --- [TEST 5] Calibrate Prompts Action ---
    console.log('\n--- [TEST 5] Calibrate Prompts Action ---');
    const resCalibrate = await fetch(`${baseUrl}/calibrate-prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stats: {
          removalRate: 0.02,
          avgComplianceScore: 97.0,
          epc: 4.5,
        },
      }),
    });
    const jsonCalibrate = await resCalibrate.json();
    assert(resCalibrate.status === 200, 'POST /calibrate-prompts returns HTTP 200');
    assert(jsonCalibrate.success === true, 'Prompt calibration reports success: true');
    assert(jsonCalibrate.calibration.actionTaken !== undefined, 'Calibration result contains actionTaken');

    // --- [TEST 6] Scaffold Campaign Action ---
    console.log('\n--- [TEST 6] Scaffold Campaign Action ---');
    const resScaffold = await fetch(`${baseUrl}/scaffold-campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerId: 'act_test_offer',
        vertical: 'finance',
        geos: ['US', 'DE'],
        basePayout: 130,
      }),
    });
    const jsonScaffold = await resScaffold.json();
    assert(resScaffold.status === 200, 'POST /scaffold-campaign returns HTTP 200');
    assert(jsonScaffold.success === true, 'Campaign scaffolding reports success: true');
    assert(jsonScaffold.scaffold.scaffoldedCampaigns.length === 2, 'Scaffolded 2 target GEO campaigns');
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 ACTIONS ROUTER SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runActionsRouterTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
