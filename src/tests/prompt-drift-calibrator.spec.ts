import fs from 'fs';
import path from 'path';
import { PromptDriftCalibrator } from '../services/prompt-drift-calibrator.service.js';
import { LlmGatewayService } from '../services/llm-gateway.service.js';

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

async function runPromptDriftCalibratorTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Continuous Calibration Loop for Copywriter & Compliance (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_drift_' + Date.now());
  const strategyMemoryPath = path.join(testDir, 'strategy_memory.json');
  const negativePatternsPath = path.join(testDir, 'negative_patterns.json');
  fs.mkdirSync(testDir, { recursive: true });

  // Create initial negative patterns fixture
  const initialNegatives = [
    {
      id: 'np_1',
      platform: 'reddit',
      campaignId: 'cmp_trading',
      hook: 'Make 100% guaranteed profit today',
      bannedKeywords: ['guaranteed profit', 'instant riches', '100% win rate'],
      reason: 'Rule 9 violation',
    },
  ];
  fs.writeFileSync(negativePatternsPath, JSON.stringify(initialNegatives, null, 2), 'utf8');

  PromptDriftCalibrator.resetInstance();
  const calibrator = PromptDriftCalibrator.getInstance({
    strategyMemoryPath,
    negativePatternsPath,
  });

  const gateway = LlmGatewayService.getInstance();
  gateway.loadRegistry();

  // --- [TEST 1] Ingestion & Default Strategy Memory ---
  console.log('--- [TEST 1] Ingestion & Default Strategy Memory ---');
  const initialMemory = calibrator.getStrategyMemory();
  assert(initialMemory.version !== undefined, 'Initial strategy memory has version definition');
  assert(Array.isArray(initialMemory.blacklistedPhrasingStructures), 'Strategy memory has blacklisted phrasing array');

  // --- [TEST 2] Dynamic Calibration Rule 1: High Removal Rate (> 5%) ---
  console.log('\n--- [TEST 2] Dynamic Calibration Rule 1: High Removal Rate (> 5%) ---');
  const highRemovalStats = {
    removalRate: 0.085, // 8.5% > 5%
    avgComplianceScore: 88.0,
    epc: 3.20,
    cr: 5.0,
    avgUpvotes: 4,
    totalPosts: 60,
  };

  const calib1 = await calibrator.calibrate(highRemovalStats);
  assert(calib1.actionTaken === 'STRICT_CONVERSATIONAL_ALIGNMENT', 'Action taken is STRICT_CONVERSATIONAL_ALIGNMENT');
  assert(calib1.recommendedTemperature === 0.25, 'Lowered recommended temperature to 0.25');
  assert(calib1.updatedCopywriterPrompt.includes('STRICT ANTI-DETECT'), 'Injected strict anti-detect constraints');
  assert(calib1.blacklistedPhrasingStructures.includes('guaranteed profit'), 'Includes blacklisted phrases from negative patterns');

  // Check agent registry update
  const updatedAgent1 = gateway.getAgent('agent-context-copywriter-02');
  assert(updatedAgent1?.systemPrompt.includes('STRICT ANTI-DETECT'), 'Updated agent-context-copywriter-02 prompt in registry');

  // Check strategy memory file
  const memoryAfterCalib1 = JSON.parse(fs.readFileSync(strategyMemoryPath, 'utf8'));
  assert(memoryAfterCalib1.calibrationAction === 'STRICT_CONVERSATIONAL_ALIGNMENT', 'Memory file records calibrationAction');
  assert(memoryAfterCalib1.recommendedTemperature === 0.25, 'Memory file records temperature 0.25');
  assert(memoryAfterCalib1.history.length === 1, 'Memory file has 1 history record');

  // --- [TEST 3] Dynamic Calibration Rule 2: High Compliance with Low EPC (Creative Variance) ---
  console.log('\n--- [TEST 3] Dynamic Calibration Rule 2: High Compliance with Low EPC (Creative Variance) ---');
  const lowEpcStats = {
    removalRate: 0.015, // 1.5% <= 5%
    avgComplianceScore: 98.0, // High compliance
    epc: 0.45, // Low EPC < $1.50
    cr: 1.2,
    avgUpvotes: 12,
    totalPosts: 80,
    totalClicks: 200,
  };

  const calib2 = await calibrator.calibrate(lowEpcStats);
  assert(calib2.actionTaken === 'CREATIVE_EXPANSION', 'Action taken is CREATIVE_EXPANSION');
  assert(calib2.recommendedTemperature === 0.65, 'Increased recommended temperature to 0.65');
  assert(calib2.updatedCopywriterPrompt.includes('CREATIVE EXPANSION'), 'Injected creative expansion guidelines');
  assert(calib2.activeWinningHooks.length > 0, 'Injected winning hooks from Gold Catalog');

  const memoryAfterCalib2 = JSON.parse(fs.readFileSync(strategyMemoryPath, 'utf8'));
  assert(memoryAfterCalib2.calibrationAction === 'CREATIVE_EXPANSION', 'Memory records CREATIVE_EXPANSION');
  assert(memoryAfterCalib2.recommendedTemperature === 0.65, 'Memory records 0.65');
  assert(memoryAfterCalib2.history.length === 2, 'History array grew to 2 entries');

  // --- [TEST 4] Dynamic Calibration Rule 3: Optimal Performance (Maintain) ---
  console.log('\n--- [TEST 4] Dynamic Calibration Rule 3: Optimal Performance (Maintain) ---');
  const optimalStats = {
    removalRate: 0.02, // 2% <= 5%
    avgComplianceScore: 96.0,
    epc: 4.80, // Healthy EPC
    cr: 8.5,
    avgUpvotes: 25,
    totalPosts: 100,
  };

  const calib3 = await calibrator.calibrate(optimalStats);
  assert(calib3.actionTaken === 'MAINTAIN_OPTIMAL', 'Action taken is MAINTAIN_OPTIMAL');
  assert(calib3.recommendedTemperature === 0.40, 'Maintains balanced temperature (0.40)');

  // Clean test sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 PROMPT DRIFT CALIBRATOR SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPromptDriftCalibratorTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
