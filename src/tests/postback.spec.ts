import fs from 'fs';
import path from 'path';
import {
  FinancialTelemetryMatcher,
  extractPostbackEvent,
  GoldCatalogService,
  BundleArtifact,
} from '../index.js';
import { handlePostback } from '../../core/src/server/routes/postback.router.js';
import { TelegramLeadRepository } from '../../core/src/db/tg-leads.repository.js';

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

async function runPostbackSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 CPA Postback Ingestion & Financial Telemetry Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testStorageDir = path.resolve(process.cwd(), 'scratch/test_postback');
  if (!fs.existsSync(testStorageDir)) {
    fs.mkdirSync(testStorageDir, { recursive: true });
  }

  const testTelemetryPath = path.join(testStorageDir, 'test_telemetry.json');
  const testGoldPath = path.join(testStorageDir, 'test_gold.json');

  if (fs.existsSync(testTelemetryPath)) fs.unlinkSync(testTelemetryPath);
  if (fs.existsSync(testGoldPath)) fs.unlinkSync(testGoldPath);

  // Initialize isolated services
  FinancialTelemetryMatcher.resetInstance();
  GoldCatalogService.resetInstance();

  const matcher = FinancialTelemetryMatcher.getInstance(testTelemetryPath);
  const goldCatalog = GoldCatalogService.getInstance(testGoldPath);

  // Setup a test bundle on disk in /runs/test-bundle-cpa-101/
  const bundleId = 'test-bundle-cpa-101';
  const bundleDir = path.resolve(process.cwd(), 'runs', bundleId);
  if (!fs.existsSync(bundleDir)) {
    fs.mkdirSync(bundleDir, { recursive: true });
  }
  const bundleFilePath = path.join(bundleDir, 'bundle.json');

  const initialBundle: BundleArtifact = {
    id: bundleId,
    createdAt: Date.now(),
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'COMPLIANT', 'APPROVED'],
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/dating_advice/comments/cpa_postback_test',
      topicTitle: 'High converting test discussion',
      sourceText: 'Organic reference source text',
      targetAudiencePain: 'Audience pain point for postback test',
      metadata: { campaign_id: 'cmp_trading_au', network: 'mylead' },
    },
    creative: {
      headline: 'Proven Winning Creative Headline',
      body: 'Body story of the tested creative',
      callToAction: 'Stealth CTA question',
      prelanderSlug: 'trading-quiz-v1',
      generatedPrompt: 'Cinematic lifestyle photo 8k',
    },
    compliance: {
      passed: true,
      score: 95,
      flaggedKeywords: [],
      reasoning: 'Clean compliance',
    },
  };

  fs.writeFileSync(bundleFilePath, JSON.stringify(initialBundle, null, 2), 'utf8');

  // --------------------------------------------------------------------------
  // Test 1: Parameter Extraction & Normalization
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] CPA Postback Parameter Extraction ---');
  const mockReqGet = {
    query: {
      click_id: 'clk_live_98765',
      sub1: bundleId,
      sub2: 'cmp_trading_au',
      sub3: 'reddit',
      payout: '45.50',
      currency: 'USD',
      status: 'sale',
    },
    body: {},
  } as any;

  const extracted = extractPostbackEvent(mockReqGet);
  assert(extracted.clickId === 'clk_live_98765', 'click_id extracted correctly');
  assert(extracted.bundleId === bundleId, 'sub1 mapped to bundleId');
  assert(extracted.campaignId === 'cmp_trading_au', 'sub2 mapped to campaignId');
  assert(extracted.platform === 'reddit', 'sub3 mapped to platform');
  assert(extracted.payout === 45.5, 'payout parsed as float 45.5');
  assert(extracted.currency === 'USD', 'currency parsed as USD');
  assert(extracted.status === 'sale', 'status normalized to sale');

  // --------------------------------------------------------------------------
  // Test 2: Ingestion & Financial Telemetry Matching
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Ingestion & Financial Telemetry Matching ---');
  const result1 = matcher.processPostback(extracted);

  assert(result1.success === true, 'Postback processed successfully');
  assert(result1.duplicate === false, 'First occurrence is NOT marked as duplicate');
  assert(result1.bundleUpdated === true, 'Bundle on disk was updated');
  assert(result1.durationMs < 50, `Execution is ultra-fast (< 50ms, actual: ${result1.durationMs}ms)`);

  // Verify updated bundle.json on disk
  const rawUpdatedBundle = fs.readFileSync(bundleFilePath, 'utf8');
  const updatedBundle: BundleArtifact = JSON.parse(rawUpdatedBundle);

  assert(Boolean(updatedBundle.financials), 'Bundle has financials object');
  assert(updatedBundle.financials?.conversions === 1, 'conversions incremented to 1');
  assert(updatedBundle.financials?.totalPayout === 45.5, 'totalPayout updated to 45.50');
  assert(Boolean(updatedBundle.financials?.lastConversionAt), 'lastConversionAt timestamp recorded');
  assert(updatedBundle.financials?.epc === 45.5, 'EPC calculated correctly ($45.50)');
  assert(updatedBundle.financials?.cr === 100, 'CR calculated correctly (100%)');

  // --------------------------------------------------------------------------
  // Test 3: GoldCatalogService Integration on Payout > 0
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] GoldCatalogService Automated Ingestion ---');
  const goldEntries = goldCatalog.getEntries();
  const catalogEntry = goldEntries.find((e) => e.id === bundleId || e.inputContext.sourceUrl.includes('cpa_postback_test'));

  assert(Boolean(catalogEntry), 'Bundle automatically ingested into Gold Catalog upon conversion payout');
  assert(catalogEntry?.performanceMetrics.conversions === 1, 'Gold Catalog reflects 1 conversion');
  assert(catalogEntry?.performanceMetrics.revenue === 45.5, 'Gold Catalog reflects $45.50 revenue');

  // --------------------------------------------------------------------------
  // Test 4: Deduplication of Duplicate Postbacks
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 4] Postback Deduplication (Double-Count Prevention) ---');
  const duplicateResult = matcher.processPostback(extracted);

  assert(duplicateResult.success === true, 'Duplicate postback returns success');
  assert(duplicateResult.duplicate === true, 'Duplicate postback flagged as duplicate: true');
  assert(duplicateResult.bundleUpdated === false, 'Duplicate postback does NOT update bundle again');

  const bundleAfterDup: BundleArtifact = JSON.parse(fs.readFileSync(bundleFilePath, 'utf8'));
  assert(
    bundleAfterDup.financials?.conversions === 1,
    'Conversions remained 1 (no double counting)'
  );
  assert(
    bundleAfterDup.financials?.totalPayout === 45.5,
    'Revenue remained 45.50 (no double counting)'
  );

  // --------------------------------------------------------------------------
  // Test 5: Cumulative Metrics & Second Distinct Postback
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 5] Cumulative Financial Calculations (EPC & CR) ---');
  const secondPostback = {
    clickId: 'clk_live_98766',
    transactionId: 'tx_distinct_202',
    bundleId: bundleId,
    campaignId: 'cmp_trading_au',
    platform: 'reddit' as const,
    payout: 25.0,
    currency: 'USD',
    status: 'lead' as const,
  };

  const result2 = matcher.processPostback(secondPostback);
  assert(result2.success === true && result2.duplicate === false, 'Second distinct postback accepted');

  const finalBundle: BundleArtifact = JSON.parse(fs.readFileSync(bundleFilePath, 'utf8'));
  assert(finalBundle.financials?.conversions === 2, 'Cumulative conversions = 2');
  assert(finalBundle.financials?.totalPayout === 70.5, 'Cumulative payout = $70.50');
  assert(finalBundle.financials?.epc === 35.25, 'Updated EPC = $35.25 (70.50 / 2)');
  assert(finalBundle.financials?.cr === 100, 'Updated CR = 100%');

  // Check campaign level metrics
  const summary = matcher.getTelemetrySummary();
  const campMetrics = summary.campaigns['cmp_trading_au'];
  assert(Boolean(campMetrics), 'Campaign metrics aggregated');
  assert(campMetrics.conversions === 2, 'Campaign conversions = 2');
  assert(campMetrics.revenue === 70.5, 'Campaign revenue = $70.50');

  // --------------------------------------------------------------------------
  // Test 6: Rejected / Zero-Payout Handling
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 6] Rejected / Declined Postback Handling ---');
  const rejectedPostback = {
    clickId: 'clk_live_rejected_303',
    transactionId: 'tx_rejected_303',
    bundleId: bundleId,
    campaignId: 'cmp_trading_au',
    platform: 'reddit' as const,
    payout: 0,
    currency: 'USD',
    status: 'rejected' as const,
  };

  const rejResult = matcher.processPostback(rejectedPostback);
  assert(rejResult.success === true, 'Rejected postback processed');
  const bundleAfterRej: BundleArtifact = JSON.parse(fs.readFileSync(bundleFilePath, 'utf8'));
  assert(
    bundleAfterRej.financials?.conversions === 2,
    'Conversions not incremented for rejected postback'
  );

  // --- [TEST 7] NanoID Click-ID Attribution Bridge ---
  console.log('\n--- [TEST 7] NanoID Click-ID Attribution Bridge ---');
  const leadRepo = TelegramLeadRepository.getInstance();
  const testChatId = '555444333';
  const testClickId = 'clk_abc123xyz';

  // Seed a quiz completed lead
  leadRepo.saveLead({
    chat_id: testChatId,
    username: 'attribution_tester',
    status: 'QUIZ_COMPLETED',
    selected_offer: 'mylead',
  });

  // Save click attribution
  leadRepo.saveClickAttribution(testClickId, testChatId, 'mylead');

  // Simulate postback with click_id as sub1
  let responseData: any = null;
  const mockReq: any = {
    path: '/api/postback',
    method: 'GET',
    query: {
      sub1: testClickId,
      payout: '32.50',
      status: 'sale',
    },
    body: {},
  };
  const mockRes: any = {
    status: (code: number) => ({
      json: (data: any) => {
        responseData = data;
      },
    }),
  };

  await handlePostback(mockReq, mockRes);
  assert(responseData !== null && responseData.success === true, 'handlePostback returned 200 success for NanoID click');

  const convertedLead = leadRepo.getLead(testChatId);
  assert(convertedLead?.status === 'CONVERTED', 'Lead status upgraded to CONVERTED via click attribution');

  console.log('\n================================================================');
  console.log(`📊 POSTBACK SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  // Clean up test runs and files
  try {
    if (fs.existsSync(bundleFilePath)) fs.unlinkSync(bundleFilePath);
    if (fs.existsSync(bundleDir)) fs.rmdirSync(bundleDir);
    if (fs.existsSync(testTelemetryPath)) fs.unlinkSync(testTelemetryPath);
    if (fs.existsSync(testGoldPath)) fs.unlinkSync(testGoldPath);
    if (fs.existsSync(testStorageDir)) fs.rmdirSync(testStorageDir);
  } catch {}

  if (failed > 0) {
    process.exit(1);
  }
}

runPostbackSpec().catch((err) => {
  console.error('Fatal Postback Spec Error:', err);
  process.exit(1);
});
