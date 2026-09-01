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

async function runActionControlsTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 QA Action Controls Endpoint Automation Test Suite');
  console.log('🧪 ================================================================\n');

  const app = express();
  app.use(express.json());
  app.use('/api/actions', actionsRouter);

  const server = http.createServer(app);
  const PORT = 5594;

  await new Promise<void>((resolve) => {
    server.listen(PORT, () => resolve());
  });

  const baseUrl = `http://127.0.0.1:${PORT}/api/actions`;

  try {
    const eStop = EmergencyStopController.getInstance();
    eStop.clear('INIT');

    // Warm up HTTP connection
    await fetch(`${baseUrl}/estop/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: 'WARMUP' }),
    });

    // --- TEST A: POST /api/actions/estop/trigger (< 5ms internal atomic lock check) ---
    console.log('--- [TEST A] E-STOP Trigger & Atomic Latency Check ---');
    const startAtomic = performance.now();
    eStop.trigger('Atomic Latency Benchmark', 'QA_SPEED_TEST');
    const atomicDuration = performance.now() - startAtomic;
    eStop.clear('INIT_AGAIN');

    const startTrigger = performance.now();
    const resTrigger = await fetch(`${baseUrl}/estop/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'QA Speed Benchmark Test', operator: 'QA_SPEED_TEST' }),
    });
    const triggerDuration = performance.now() - startTrigger;
    const dataTrigger = await resTrigger.json();

    assert(resTrigger.status === 200, 'POST /estop/trigger returns HTTP 200 OK');
    assert(dataTrigger.success === true, 'Payload contains success: true');
    assert(dataTrigger.isHalted === true, 'Payload confirms isHalted: true');
    assert(eStop.isHalted() === true, 'EmergencyStopController reports halted state');
    console.log(`⏱️ E-STOP Atomic Lock Latency: ${atomicDuration.toFixed(3)}ms | HTTP Roundtrip: ${triggerDuration.toFixed(2)}ms`);
    assert(atomicDuration < 5.0, `Atomic E-STOP lock executed in < 5ms (${atomicDuration.toFixed(3)}ms)`);

    // --- TEST B: POST /api/actions/estop/reset (Restore Normal Execution) ---
    console.log('\n--- [TEST B] E-STOP Reset & Execution Restoration ---');
    const resReset = await fetch(`${baseUrl}/estop/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator: 'QA_SPEED_TEST' }),
    });
    const dataReset = await resReset.json();

    assert(resReset.status === 200, 'POST /estop/reset returns HTTP 200 OK');
    assert(dataReset.success === true, 'Payload contains success: true');
    assert(dataReset.isHalted === false, 'Payload confirms isHalted: false');
    assert(eStop.isHalted() === false, 'EmergencyStopController reports operational state');

    // --- TEST C: POST /api/actions/force-dispatch (Graceful Empty Queue Handling) ---
    console.log('\n--- [TEST C] Graceful Empty Queue Handling in Force Dispatch ---');
    const queueRepo = ContentQueueRepository.getInstance();
    
    // Ensure no items are in APPROVED status
    const approvedItems = queueRepo.listApproved(100);
    for (const item of approvedItems) {
      queueRepo.updateStatus(item.id, 'DISPATCHED');
    }

    const resEmptyDispatch = await fetch(`${baseUrl}/force-dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dryRun: false }),
    });
    const dataEmptyDispatch = await resEmptyDispatch.json();

    assert(resEmptyDispatch.status === 200, 'POST /force-dispatch returns HTTP 200 OK on empty queue');
    assert(dataEmptyDispatch.success === false, 'Payload reports success: false (No crash)');
    assert(
      dataEmptyDispatch.message.includes('No APPROVED posts waiting'),
      'Payload returns helpful empty queue explanation message'
    );

    // --- TEST D: POST /api/actions/generate-batch (Job Acceptance & Queueing) ---
    console.log('\n--- [TEST D] Batch Generation Job Acceptance & Task Queueing ---');
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
    const dataBatch = await resBatch.json();

    assert(resBatch.status === 200, 'POST /generate-batch returns HTTP 200 OK');
    assert(dataBatch.success === true, 'Batch generation payload contains success: true');
    assert(dataBatch.count === 2, 'Generated expected count of 2 items');
    assert(Array.isArray(dataBatch.bundles) && dataBatch.bundles.length === 2, 'Returned 2 generated bundles');

    // Verify task queueing in SQLite
    const updatedPending = queueRepo.listPending(10);
    assert(updatedPending.length >= 2, 'Tasks successfully enqueued in SQLite content_queue_v2');
  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`📊 ACTION CONTROLS SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runActionControlsTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
