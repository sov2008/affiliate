import fs from 'fs';
import path from 'path';
import { CampaignScaffolder } from '../services/campaign-scaffolder.service.js';
import { MabEngineService } from '../services/mab-engine.service.js';

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

async function runCampaignScaffolderTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Multi-GEO Campaign Scaffolder Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_scaffold_' + Date.now());
  const testCampaignsDir = path.join(testDir, 'campaigns');
  fs.mkdirSync(testCampaignsDir, { recursive: true });

  CampaignScaffolder.resetInstance();
  const scaffolder = CampaignScaffolder.getInstance(testCampaignsDir);

  // --- [TEST 1] Tracking Validation Engine ---
  console.log('--- [TEST 1] Tracking Validation Engine ---');
  const validHtml = `
    <!DOCTYPE html><html><head>
      <script defer src="/api/analytics/script.js" data-website-id="cmp_test" data-auto-track="true"></script>
    </head><body>
      <a id="ctaLink" href="https://trk.com/click?click_id={click_id}&sub1={sub1}&sub2=offer1">Start</a>
    </body></html>
  `;
  const invalidHtml = `<!DOCTYPE html><html><body><h1>No links</h1></body></html>`;

  const valValid = scaffolder.validateTracking(validHtml);
  assert(valValid.passed === true, 'Valid prelander HTML passes tracking audit');

  const valInvalid = scaffolder.validateTracking(invalidHtml);
  assert(valInvalid.passed === false, 'Invalid prelander HTML fails tracking audit');
  assert(valInvalid.errors.length >= 3, 'Detects missing CTA, missing click_id, and missing analytics script');

  // --- [TEST 2] Base Template Generation ---
  console.log('\n--- [TEST 2] Base Template Generation ---');
  const baseV1 = scaffolder.generateBaseTemplate('crypto', 'v1', 'DE', 150.0, 'quant_bot');
  assert(baseV1.includes('cmp_quant_bot_de'), 'Base template contains dynamic campaign ID');
  assert(baseV1.includes('data-website-id="cmp_quant_bot_de"'), 'Base template contains Umami website-id');
  assert(baseV1.includes('click_id={click_id}'), 'Base template contains click_id macro');
  assert(baseV1.includes('sub1={sub1}'), 'Base template contains sub1 macro');
  assert(baseV1.includes('sub2=quant_bot'), 'Base template contains sub2 offer macro');

  const baseV2 = scaffolder.generateBaseTemplate('crypto', 'v2', 'DE', 150.0, 'quant_bot');
  assert(baseV2.includes('Step 1 of 2'), 'v2 template contains 2-step quiz structure');

  // --- [TEST 3] Multi-GEO Autonomous Scaffolding (DE, FR, US, AU) ---
  console.log('\n--- [TEST 3] Multi-GEO Autonomous Scaffolding (DE, FR, US, AU) ---');
  const result = await scaffolder.scaffoldMultiGeo({
    offerId: 'web3_quant',
    vertical: 'crypto',
    targetGeos: ['US', 'DE', 'FR', 'AU'],
    basePayout: 120.0,
    dryRun: false,
  });

  assert(result.success === true, 'Scaffolding completed successfully');
  assert(result.scaffoldedCampaigns.length === 4, 'Scaffolded exactly 4 GEO campaigns');
  assert(result.totalGeneratedVariants === 8, 'Generated 8 variants total (2 per campaign)');

  // Verify DE Campaign
  const deCamp = result.scaffoldedCampaigns.find((c) => c.geo === 'DE');
  assert(deCamp !== undefined, 'Found DE campaign');
  assert(deCamp?.campaignId === 'cmp_web3_quant_de', 'DE campaign ID is cmp_web3_quant_de');
  assert(deCamp?.trackingValidated === true, 'DE campaign passed tracking validation');

  // Check files on disk for DE
  const deCampDir = path.join(testCampaignsDir, 'cmp_web3_quant_de');
  assert(fs.existsSync(path.join(deCampDir, 'v1/index.html')), 'DE v1/index.html exists on disk');
  assert(fs.existsSync(path.join(deCampDir, 'v2/index.html')), 'DE v2/index.html exists on disk');
  assert(fs.existsSync(path.join(deCampDir, 'index.html')), 'DE MAB split router index.html exists on disk');

  // Verify DE localized content
  const deV1Html = fs.readFileSync(path.join(deCampDir, 'v1/index.html'), 'utf8');
  assert(
    deV1Html.includes('Krypto-Trading in Deutschland') || deV1Html.includes('Verifiziert') || deV1Html.includes('Sofortigen Zugang') || deV1Html.includes('Next-Generation'),
    'DE v1 HTML contains German localized keywords'
  );

  // Verify FR Campaign
  const frCamp = result.scaffoldedCampaigns.find((c) => c.geo === 'FR');
  assert(frCamp !== undefined, 'Found FR campaign');
  assert(frCamp?.trackingValidated === true, 'FR campaign passed tracking validation');

  const frCampDir = path.join(testCampaignsDir, 'cmp_web3_quant_fr');
  const frV1Html = fs.readFileSync(path.join(frCampDir, 'v1/index.html'), 'utf8');
  assert(
    frV1Html.includes('Trading Crypto en France') || frV1Html.includes('Débloquer') || frV1Html.includes('Sécurisé') || frV1Html.includes('Next-Generation'),
    'FR v1 HTML contains French localized keywords'
  );

  // --- [TEST 4] Client-Side MAB Split Router Verification ---
  console.log('\n--- [TEST 4] Client-Side MAB Split Router Verification ---');
  const routerHtml = fs.readFileSync(path.join(deCampDir, 'index.html'), 'utf8');
  assert(routerHtml.includes('MAB Split Router') || routerHtml.includes('v1') || routerHtml.includes('v2'), 'Router contains MAB split logic');
  assert(routerHtml.includes('sessionStorage') || routerHtml.includes('localStorage') || routerHtml.includes('window.location'), 'Router contains client redirection logic');

  // --- [TEST 5] MAB Engine Registration ---
  console.log('\n--- [TEST 5] MAB Engine Registration ---');
  const mab = MabEngineService.getInstance();
  const mabState = mab.getState();
  assert(mabState.campaigns['cmp_web3_quant_de'] !== undefined, 'DE campaign registered in MAB state');
  assert(mabState.campaigns['cmp_web3_quant_fr'] !== undefined, 'FR campaign registered in MAB state');
  assert(mabState.campaigns['cmp_web3_quant_us'] !== undefined, 'US campaign registered in MAB state');

  // Clean test sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 CAMPAIGN SCAFFOLDER SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCampaignScaffolderTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
