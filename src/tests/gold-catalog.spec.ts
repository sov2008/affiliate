import fs from 'fs';
import path from 'path';
import {
  GoldCatalogService,
  GoldCatalogEntry,
  BundleArtifact,
  RawContext,
  GeneratedCreative,
  CopywriterAgent,
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

async function runGoldCatalogSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Automated Few-Shot Dataset Collector (Gold Catalog) Test Suite');
  console.log('🧪 ================================================================\n');

  const testDataDir = path.resolve(process.cwd(), 'scratch/test_gold');
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  const testStoragePath = path.join(testDataDir, 'test_gold_catalog.json');
  if (fs.existsSync(testStoragePath)) {
    fs.unlinkSync(testStoragePath);
  }

  // Initialize service with isolated test storage
  GoldCatalogService.resetInstance();
  const service = GoldCatalogService.getInstance(testStoragePath);

  // --------------------------------------------------------------------------
  // Test 1: Initial Empty State & Storage File Creation
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Initial Empty State & File Creation ---');
  assert(service.count() === 0, 'Catalog starts empty');
  assert(fs.existsSync(testStoragePath), 'Storage file is created on disk');
  const emptyExamples = service.getFewShotExamples('reddit', 'finance');
  assert(emptyExamples === '', 'Returns empty string when catalog is empty');

  // --------------------------------------------------------------------------
  // Test 2: Ingestion Trigger Qualification (Score >= 90 or Conversions > 0)
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Ingestion Qualification Rules ---');
  const lowScoreBundle: BundleArtifact = {
    id: 'bundle-low-score',
    createdAt: Date.now(),
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'COMPLIANT', 'APPROVED'],
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/investing/comments/crypto_tips',
      topicTitle: 'How to trade crypto without getting rekt',
      sourceText: 'Looking for disciplined risk management rules.',
      targetAudiencePain: 'Losing portfolio to high leverage',
      metadata: { vertical: 'finance' },
    },
    creative: {
      headline: 'Simple 1% Risk Rule That Saved My Portfolio',
      body: 'Never risk more than 1-2% per trade. Here is the exact calculation method.',
      callToAction: 'Drop your risk management tips below',
      prelanderSlug: 'trading-calc-v1',
      generatedPrompt: 'A clean desk with trading charts and a notebook, photorealistic, 8k',
    },
    compliance: {
      passed: true,
      score: 85, // < 90
      flaggedKeywords: [],
      reasoning: 'Borderline financial terminology',
    },
  };

  const lowScoreIngested = service.ingestApprovedBundle(lowScoreBundle);
  assert(!lowScoreIngested, 'Bundle with score 85 (< 90) and 0 conversions is REJECTED');
  assert(service.count() === 0, 'Catalog remains empty after non-qualifying bundle');

  const highScoreBundle: BundleArtifact = {
    id: 'bundle-high-score',
    createdAt: Date.now(),
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'COMPLIANT', 'APPROVED'],
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/dating_advice/comments/honest_apps',
      topicTitle: 'Are there any dating apps focused on intentional connections?',
      sourceText: 'Tired of endless superficial swipes with zero conversations.',
      targetAudiencePain: 'Swipe fatigue and fake profiles',
      metadata: { vertical: 'dating' },
    },
    creative: {
      headline: 'The Shift From Mindless Swiping to Verified Community Events',
      body: 'I deleted 3 standard apps last month and tested curated social platforms instead.',
      callToAction: 'Curious if anyone else has tried curated local events?',
      prelanderSlug: 'dating-quiz-v1',
      generatedPrompt: 'A warm cozy coffee shop meetup, candid lifestyle photography, 8k',
    },
    compliance: {
      passed: true,
      score: 95, // >= 90
      flaggedKeywords: [],
      reasoning: '100% compliant, organic, empathetic, zero banned keywords',
    },
  };

  const highScoreIngested = service.ingestApprovedBundle(highScoreBundle);
  assert(highScoreIngested, 'Bundle with score 95 (>= 90) and APPROVED status is INGESTED');
  assert(service.count() === 1, 'Catalog has 1 entry');

  // Ingest low compliance score but with LIVE conversions (> 0)
  const convertingBundle: BundleArtifact = {
    id: 'bundle-converting',
    createdAt: Date.now(),
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'COMPLIANT', 'APPROVED'],
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/freelance/comments/invoicing_tools',
      topicTitle: 'Best way to automate international contractor invoices',
      sourceText: 'Spending hours every week on currency conversions and manual PDFs.',
      targetAudiencePain: 'Time-consuming manual invoicing and high FX fees',
      metadata: { vertical: 'finance' },
    },
    creative: {
      headline: 'How I Cut Invoice Overhead From 4 Hours to 10 Minutes',
      body: 'Automated workflow breakdown for multi-currency freelancers.',
      callToAction: 'Happy to share the template if anyone needs it',
      prelanderSlug: 'freelance-flow-v1',
      generatedPrompt: 'Modern minimalist home office with laptop and coffee, photorealistic',
    },
    compliance: {
      passed: true,
      score: 82, // < 90
      flaggedKeywords: [],
      reasoning: 'Passable',
    },
  };

  const convertingIngested = service.ingestApprovedBundle(convertingBundle, {
    metrics: { clicks: 45, conversions: 3, revenue: 84.5 },
  });
  assert(convertingIngested, 'Bundle with conversions > 0 is INGESTED despite score < 90');
  assert(service.count() === 2, 'Catalog now has 2 entries');

  // --------------------------------------------------------------------------
  // Test 3: Deduplication by context.sourceUrl & Metric Updates
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Deduplication by context.sourceUrl ---');
  const duplicateBundle: BundleArtifact = {
    id: 'bundle-dup-updated',
    createdAt: Date.now(),
    status: 'APPROVED',
    tracePath: ['DISCOVERED', 'GENERATED', 'COMPLIANT', 'APPROVED'],
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/dating_advice/comments/honest_apps', // Same URL as highScoreBundle
      topicTitle: 'Updated Dating apps topic',
      sourceText: 'Updated text content',
      targetAudiencePain: 'Swipe fatigue',
      metadata: { vertical: 'dating' },
    },
    creative: {
      headline: 'Improved Headline: Curated Social Groups Over Swiping',
      body: 'Even better empathetic story.',
      callToAction: 'What are your thoughts on niche communities?',
      prelanderSlug: 'dating-quiz-v2',
      generatedPrompt: 'Warm evening dinner party with friends laughing, 8k',
    },
    compliance: {
      passed: true,
      score: 98,
      flaggedKeywords: [],
      reasoning: 'Exemplary organic tone',
    },
  };

  service.ingestApprovedBundle(duplicateBundle);
  assert(service.count() === 2, 'Deduplication prevented duplicate entry for same sourceUrl');

  const datingEntry = service.getEntries().find((e) => e.inputContext.sourceUrl.includes('honest_apps'));
  assert(datingEntry?.complianceScore === 98, 'Deduplicated entry updated with higher compliance score (98)');
  assert(
    datingEntry?.approvedCreative.headline.includes('Improved Headline'),
    'Deduplicated entry updated with new creative headline'
  );

  // --------------------------------------------------------------------------
  // Test 4: Top 50 Highest-Performing Retention Limit & Ranking
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 4] Top 50 Retention & Performance Ranking ---');
  for (let i = 0; i < 60; i++) {
    service.upsertEntry({
      id: `bulk-entry-${i}`,
      platform: i % 2 === 0 ? 'reddit' : 'quora',
      niche: i % 3 === 0 ? 'dating' : 'finance',
      inputContext: {
        platform: i % 2 === 0 ? 'reddit' : 'quora',
        sourceUrl: `https://test-source.com/post/${i}`,
        topicTitle: `Topic title ${i}`,
        sourceText: `Source context text for item ${i}`,
        targetAudiencePain: `Specific user pain point ${i}`,
        metadata: { index: i },
      },
      approvedCreative: {
        headline: `Proven Viral Hook #${i}`,
        body: `Authentic story body text ${i}`,
        callToAction: `Natural closing discussion question ${i}`,
        prelanderSlug: `slug-${i}`,
        generatedPrompt: `Cinematic visual scene ${i}`,
      },
      complianceScore: 90 + (i % 10),
      performanceMetrics: {
        clicks: i * 10,
        conversions: i === 55 ? 25 : i % 5,
        revenue: i * 2.5,
      },
      addedAt: new Date(Date.now() - (60 - i) * 60000).toISOString(),
    });
  }

  assert(service.count() === 50, `Catalog strictly capped at 50 entries (Actual count: ${service.count()})`);
  const topEntry = service.getEntries()[0];
  assert(
    topEntry.performanceMetrics.conversions === 25,
    `Top-ranked entry has highest conversions (25) (Actual: ${topEntry.performanceMetrics.conversions})`
  );

  // --------------------------------------------------------------------------
  // Test 5: Dynamic Few-Shot Prompt Formatting
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 5] Dynamic Few-Shot Injection Helper ---');
  const fewShotDating = service.getFewShotExamples('reddit', 'dating', 3);
  assert(
    fewShotDating.includes('FEW-SHOT HIGH-PERFORMING HISTORICAL EXAMPLES'),
    'Few-shot prompt header is present'
  );
  assert(
    fewShotDating.includes('REDDIT') && fewShotDating.includes('DATING'),
    'Few-shot prompt targets specified platform and niche'
  );
  assert(
    fewShotDating.includes('[PROVEN HIGH-CONVERTING CREATIVE]'),
    'Few-shot prompt contains structured Creative block'
  );
  assert(
    fewShotDating.includes('[INPUT CONTEXT]'),
    'Few-shot prompt contains structured Input Context block'
  );

  // --------------------------------------------------------------------------
  // Test 6: Verify CopywriterAgent Integration
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 6] CopywriterAgent Integration ---');
  const copywriter = new CopywriterAgent();
  assert(typeof copywriter.execute === 'function', 'CopywriterAgent.execute is callable');

  console.log('\n================================================================');
  console.log(`📊 SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  // Clean up test file
  try {
    if (fs.existsSync(testStoragePath)) fs.unlinkSync(testStoragePath);
  } catch {}

  if (failed > 0) {
    process.exit(1);
  }
}

runGoldCatalogSpec().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
