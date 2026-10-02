/**
 * Credits Monitor Service Tests
 * Autonomous verification of credits monitoring functionality
 */

import { CreditsMonitorService } from '../services/credits-monitor.service';

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

async function runCreditsMonitorSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Credits Monitor Service Spec');
  console.log('🧪 ================================================================\n');

  const service = new CreditsMonitorService({
    groqApiKey: process.env.GROQ_API_KEY || 'test_groq_key',
    openRouterApiKey: process.env.OPENROUTER_API_KEY || 'test_openrouter_key',
    checkInterval: 60000,
  });

  assert(service !== undefined, 'CreditsMonitorService initialized successfully');

  const status = await service.getDashboardStatus();
  assert(status !== undefined, 'getDashboardStatus returned status object');
  assert(Array.isArray(status.alerts), 'status.alerts is an array');

  const metrics = await service.getMetrics();
  assert(metrics !== undefined, 'getMetrics returned metrics object');
  assert(Array.isArray(metrics.dailyTrend), 'metrics.dailyTrend is an array');

  const csv = await service.getCSVReport();
  assert(typeof csv === 'string', 'getCSVReport returned string output');
  assert(csv.includes('Timestamp') && csv.includes('Provider'), 'CSV report contains standard header');

  const emptyService = new CreditsMonitorService({
    groqApiKey: '',
    openRouterApiKey: '',
    checkInterval: 60000,
  });

  const emptyStatus = await emptyService.getDashboardStatus();
  assert(emptyStatus !== undefined, 'Empty service handled gracefully');

  console.log('\n📊 ================================================================');
  console.log(`📊 Credits Monitor Spec Results: ${passed} Passed, ${failed} Failed`);
  console.log('📊 ================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCreditsMonitorSpec().catch((err) => {
  console.error('Fatal Credits Monitor Spec Error:', err);
  process.exit(1);
});
