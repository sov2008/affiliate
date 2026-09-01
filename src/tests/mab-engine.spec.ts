import fs from 'fs';
import path from 'path';
import { MabEngineService, VariantMetrics } from '../services/mab-engine.service.js';

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

async function runMabTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Multi-Armed Bandit Traffic Allocator Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_mab_' + Date.now());
  const testStatePath = path.join(testDir, 'mab_state.json');
  const testCampaignsDir = path.join(testDir, 'campaigns');

  fs.mkdirSync(path.join(testCampaignsDir, 'cmp_trading_au/v1'), { recursive: true });
  fs.mkdirSync(path.join(testCampaignsDir, 'cmp_trading_au/v2'), { recursive: true });
  fs.mkdirSync(path.join(testCampaignsDir, 'cmp_vpn_us/v1'), { recursive: true });
  fs.mkdirSync(path.join(testCampaignsDir, 'cmp_vpn_us/v2'), { recursive: true });
  fs.mkdirSync(path.join(testCampaignsDir, 'cmp_vpn_us/v3'), { recursive: true });

  MabEngineService.resetInstance();
  const mab = MabEngineService.getInstance({
    stateFilePath: testStatePath,
    campaignsDir: testCampaignsDir,
  });

  // --- [TEST 1] Minimum Sample Size & Confidence Check (< 20 clicks) ---
  console.log('--- [TEST 1] Minimum Sample Size & Confidence Check (< 20 clicks) ---');
  const lowSampleMetrics: Record<string, VariantMetrics> = {
    v1: { clicks: 8, conversions: 1, revenue: 50.0, epc: 6.25, cr: 12.5 },
    v2: { clicks: 5, conversions: 0, revenue: 0, epc: 0, cr: 0 },
  };

  const lowResult = mab.computeAllocation('cmp_trading_au', lowSampleMetrics);
  assert(lowResult.confidenceMet === false, 'Flags confidenceMet = false when total clicks < 20 (actual: 13)');
  assert(lowResult.weights.v1 === 50, 'v1 assigned 50% split in exploration/sample stage');
  assert(lowResult.weights.v2 === 50, 'v2 assigned 50% split in exploration/sample stage');
  assert(lowResult.status === 'COLLECTING_SAMPLE', 'Status is COLLECTING_SAMPLE');

  // --- [TEST 2] Epsilon-Greedy Traffic Allocation (85% Winner / 15% Challenger) ---
  console.log('\n--- [TEST 2] Epsilon-Greedy Traffic Allocation (85% Winner / 15% Challenger) ---');
  const highSampleMetrics: Record<string, VariantMetrics> = {
    v1: { clicks: 60, conversions: 5, revenue: 250.0, epc: 4.1667, cr: 8.33 },
    v2: { clicks: 55, conversions: 1, revenue: 35.0, epc: 0.6364, cr: 1.82 },
  };

  const highResult = mab.computeAllocation('cmp_trading_au', highSampleMetrics);
  assert(highResult.confidenceMet === true, 'ConfidenceMet = true with total clicks > 20 (actual: 115)');
  assert(highResult.winner === 'v1', 'Identified v1 as winning variant (EPC $4.17 vs $0.64)');
  assert(highResult.weights.v1 === 85, 'Winner v1 allocated exactly 85% dominant exploitation traffic');
  assert(highResult.weights.v2 === 15, 'Challenger v2 allocated exactly 15% exploration traffic');
  assert(highResult.status === 'OPTIMIZED', 'Status is OPTIMIZED');

  // --- [TEST 3] Multi-Variant Challenger Distribution (v1, v2, v3) ---
  console.log('\n--- [TEST 3] Multi-Variant Challenger Distribution (v1, v2, v3) ---');
  const threeVariantMetrics: Record<string, VariantMetrics> = {
    v1: { clicks: 40, conversions: 2, revenue: 70.0, epc: 1.75, cr: 5.0 },
    v2: { clicks: 50, conversions: 8, revenue: 400.0, epc: 8.0, cr: 16.0 }, // Winner
    v3: { clicks: 30, conversions: 1, revenue: 20.0, epc: 0.67, cr: 3.33 },
  };

  const threeResult = mab.computeAllocation('cmp_vpn_us', threeVariantMetrics);
  assert(threeResult.winner === 'v2', 'Identified v2 as winning variant with highest EPC ($8.00)');
  assert(threeResult.weights.v2 === 85, 'Winner v2 allocated 85% traffic');
  assert(threeResult.weights.v1 + threeResult.weights.v3 === 15, 'Challengers (v1 + v3) share exactly 15% exploration traffic');
  assert(
    threeResult.weights.v1 + threeResult.weights.v2 + threeResult.weights.v3 === 100,
    'Total weights sum to 100%'
  );

  // --- [TEST 4] Single Campaign Optimization & Edge Router HTML Generation ---
  console.log('\n--- [TEST 4] Single Campaign Optimization & Edge Router HTML Generation ---');
  const optResult = await mab.optimizeCampaign('cmp_trading_au', {
    customMetrics: highSampleMetrics,
  });

  assert(optResult.winner === 'v1', 'optimizeCampaign returned winner v1');
  assert(optResult.routerUpdated === true, 'Edge router index.html was updated');
  assert(optResult.routerPath !== undefined && fs.existsSync(optResult.routerPath), 'Router file exists on disk');

  const routerContent = fs.readFileSync(optResult.routerPath!, 'utf8');
  assert(routerContent.includes('"v1":85'), 'Router HTML contains 85% weight for v1');
  assert(routerContent.includes('"v2":15'), 'Router HTML contains 15% weight for v2');
  assert(routerContent.includes('localStorage.getItem'), 'Router HTML includes sticky user variant caching');
  assert(routerContent.includes('window.location.search'), 'Router HTML preserves URL query parameters');

  // --- [TEST 5] State Persistence to disk (mab_state.json) ---
  console.log('\n--- [TEST 5] State Persistence to disk (mab_state.json) ---');
  assert(fs.existsSync(testStatePath), 'mab_state.json persisted to disk');
  const savedState = JSON.parse(fs.readFileSync(testStatePath, 'utf8'));
  assert(savedState.campaigns['cmp_trading_au'] !== undefined, 'Saved state contains cmp_trading_au record');
  assert(savedState.campaigns['cmp_trading_au'].winnerVariant === 'v1', 'Saved state records winnerVariant = v1');
  assert(savedState.campaigns['cmp_trading_au'].totalClicks === 115, 'Saved state records totalClicks = 115');
  assert(savedState.campaigns['cmp_trading_au'].totalRevenue === 285.0, 'Saved state records totalRevenue = $285.00');

  // --- [TEST 6] Batch Optimization of All Campaigns ---
  console.log('\n--- [TEST 6] Batch Optimization of All Campaigns ---');
  const batchResults = await mab.optimizeAllCampaigns({ dryRun: true });
  assert(Object.keys(batchResults).length >= 2, 'Batch optimized multiple discovered campaigns');
  assert(batchResults['cmp_trading_au'] !== undefined, 'Contains cmp_trading_au in batch result');
  assert(batchResults['cmp_vpn_us'] !== undefined, 'Contains cmp_vpn_us in batch result');

  // Cleanup test sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 MAB ENGINE SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMabTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
