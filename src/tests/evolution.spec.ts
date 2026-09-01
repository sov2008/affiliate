import fs from 'fs';
import path from 'path';
import { VariantEvolutionAgent } from '../agents/evolution.agent.js';
import { VariantMetrics } from '../services/mab-engine.service.js';

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

async function runEvolutionTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Variant Evolution Agent (Challenger Synthesizer) Test Suite');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_evo_' + Date.now());
  const testCampaignsDir = path.join(testDir, 'campaigns');
  const campId = 'cmp_trading_au';

  fs.mkdirSync(path.join(testCampaignsDir, campId, 'v1'), { recursive: true });
  fs.mkdirSync(path.join(testCampaignsDir, campId, 'v2'), { recursive: true });

  // Write base v1 HTML with tracking macros
  const v1Html = `<!DOCTYPE html>
<html>
<head><title>Original Prelander v1</title></head>
<body>
  <h1>Trade Crypto in Australia</h1>
  <a id="ctaLink" href="https://trk.network.com/?click_id={click_id}&sub1={sub1}">Start Now</a>
</body>
</html>`;
  fs.writeFileSync(path.join(testCampaignsDir, campId, 'v1/index.html'), v1Html, 'utf8');

  VariantEvolutionAgent.resetInstance();
  const agent = VariantEvolutionAgent.getInstance(testCampaignsDir);

  // --- [TEST 1] Evolution Trigger Rule A: >= 50 clicks with 0 conversions ---
  console.log('--- [TEST 1] Evolution Trigger Rule A: >= 50 clicks with 0 conversions ---');
  const zeroConvMetrics: VariantMetrics = {
    clicks: 52,
    conversions: 0,
    revenue: 0,
    epc: 0,
    cr: 0,
  };
  const evalA = agent.evaluateVariant(campId, 'v2', zeroConvMetrics, { epc: 2.5, totalClicks: 100 });
  assert(evalA.status === 'STALE_UNDERPERFORMING', 'Flags STALE_UNDERPERFORMING on 52 clicks with 0 conversions');
  assert(evalA.reason?.includes('Zero conversions after 52 clicks') === true, 'Reason mentions 52 clicks');

  // --- [TEST 2] Evolution Trigger Rule B: EPC 50% below campaign average ---
  console.log('\n--- [TEST 2] Evolution Trigger Rule B: EPC 50% below campaign average ---');
  const lowEpcMetrics: VariantMetrics = {
    clicks: 30,
    conversions: 1,
    revenue: 15.0,
    epc: 0.5,
    cr: 3.33,
  };
  // Campaign average EPC is $3.00, variant EPC is $0.50 (< 1.50)
  const evalB = agent.evaluateVariant(campId, 'v2', lowEpcMetrics, { epc: 3.0, totalClicks: 80 });
  assert(evalB.status === 'STALE_UNDERPERFORMING', 'Flags STALE_UNDERPERFORMING when EPC is $0.50 vs campaign $3.00 (>50% drop)');
  assert(evalB.reason?.includes('below campaign average') === true, 'Reason explains EPC drop');

  // --- [TEST 3] Healthy / Sample Collecting Variants ---
  console.log('\n--- [TEST 3] Healthy / Sample Collecting Variants ---');
  const smallSample: VariantMetrics = { clicks: 12, conversions: 0, revenue: 0, epc: 0, cr: 0 };
  const evalSmall = agent.evaluateVariant(campId, 'v1', smallSample, { epc: 2.0, totalClicks: 12 });
  assert(evalSmall.status === 'COLLECTING_DATA', 'Status is COLLECTING_DATA when clicks < 20');

  const healthyMetrics: VariantMetrics = { clicks: 40, conversions: 4, revenue: 160.0, epc: 4.0, cr: 10.0 };
  const evalHealthy = agent.evaluateVariant(campId, 'v1', healthyMetrics, { epc: 3.0, totalClicks: 80 });
  assert(evalHealthy.status === 'OPTIMAL', 'Status is OPTIMAL when EPC exceeds average');

  // --- [TEST 4] Next Variant Tag Resolution ---
  console.log('\n--- [TEST 4] Next Variant Tag Resolution ---');
  const nextTag = agent.getNextVariantTag(campId);
  assert(nextTag === 'v3', 'Correctly resolves next variant tag as v3 from [v1, v2]');

  // --- [TEST 5] Tracking Validation Macro Audit ---
  console.log('\n--- [TEST 5] Tracking Validation Macro Audit ---');
  const validHtml = `<html><body><a id="ctaLink" href="https://trk.com/?click_id={click_id}&sub1={sub1}">Click</a></body></html>`;
  const invalidHtml = `<html><body><h1>No links and no macros</h1></body></html>`;
  assert(agent.validateTracking(validHtml).passed === true, 'Valid HTML passes tracking audit');
  assert(agent.validateTracking(invalidHtml).passed === false, 'Invalid HTML fails tracking audit');
  assert(agent.validateTracking(invalidHtml).errors.length >= 2, 'Detects missing macros and missing CTA');

  // --- [TEST 6] Autonomous Challenger Synthesis & Deployment ---
  console.log('\n--- [TEST 6] Autonomous Challenger Synthesis & Deployment ---');
  const result = await agent.synthesizeChallenger(campId, 'v2', {
    angleConcept: 'Curiosity Gap & Contrarian Proof',
    niche: 'crypto',
  });

  assert(result.status === 'EVOLVED', 'Evolution status is EVOLVED');
  assert(result.newVariant === 'v3', 'New challenger tag is v3');
  assert(result.htmlPath !== undefined && fs.existsSync(result.htmlPath), 'New challenger v3/index.html deployed to disk');
  assert(result.trackingValidated === true, 'Generated challenger passed tracking validation');

  const generatedHtml = fs.readFileSync(result.htmlPath!, 'utf8');
  assert(generatedHtml.includes('<html') && generatedHtml.includes('</html>'), 'Generated valid standalone HTML structure');
  assert(generatedHtml.includes('ctaLink'), 'Generated HTML contains CTA link');

  // Next variant increment after v3 deployed
  const afterV3Tag = agent.getNextVariantTag(campId);
  assert(afterV3Tag === 'v4', 'Next tag dynamically increments to v4');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 EVOLUTION SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEvolutionTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
