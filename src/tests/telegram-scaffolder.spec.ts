import fs from 'fs';
import path from 'path';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { CampaignScaffolder } from '../services/campaign-scaffolder.service.js';
import { EmergencyStopController, BundleArtifact } from '../../core/src/types/pipeline.js';
import { ContentQueueRepository } from '../../core/src/db/queueRepository.js';
import { DistributionScheduler } from '../automation/distribution-scheduler.js';

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

async function runTelegramScaffolderTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 QA Automated Suite: Telegram Bot Commands & Multi-GEO Scaffolder');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_tg_scaffold_' + Date.now());
  const runsDir = path.join(testDir, 'runs');
  const campaignsDir = path.join(testDir, 'campaigns');
  fs.mkdirSync(runsDir, { recursive: true });
  fs.mkdirSync(campaignsDir, { recursive: true });

  // ----------------------------------------------------------------
  // TEST A: Telegram /estop atomic lockfile & worker halt
  // ----------------------------------------------------------------
  console.log('--- [TEST A] Telegram /estop command -> Atomic Lockfile & Worker Halt ---');
  const eStop = EmergencyStopController.getInstance();
  eStop.clear('QA_INIT');

  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_QA_TOKEN_999',
    defaultChatId: '12345678',
    allowedUserIds: ['12345678'],
    runsDir,
  });

  // 1. Send /estop command from authorized Telegram user
  const estopResponse = await bot.handleCommand({
    message_id: 101,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'LeadQA', username: 'lead_qa' },
    date: Date.now(),
    text: '/estop',
  });

  assert(estopResponse.includes('EMERGENCY STOP TRIGGERED'), 'Bot replied with EMERGENCY STOP TRIGGERED confirmation');
  assert(eStop.isHalted() === true, 'EmergencyStopController reports isHalted() === true');

  // Check lockfile on disk
  const lockFilePath = path.resolve(process.cwd(), '.antigravity/emergency_stop.lock');
  assert(fs.existsSync(lockFilePath), 'Atomic emergency_stop.lock file exists on disk');

  // Verify DistributionScheduler immediately halts on tick
  DistributionScheduler.resetInstance();
  const scheduler = DistributionScheduler.getInstance({
    pollIntervalMs: 1000,
    redditCooldownMs: 1000,
    quoraCooldownMs: 1000,
    runsDir,
  });

  const cycleResult = await scheduler.tick();
  assert(cycleResult.status === 'ESTOP_HALTED', 'DistributionScheduler cycle was immediately blocked by E-STOP');

  // Clear estop for next tests
  const resetResponse = await bot.handleCommand({
    message_id: 102,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'LeadQA' },
    date: Date.now(),
    text: '/reset_estop',
  });
  assert(resetResponse.includes('EMERGENCY STOP CLEARED'), 'Bot replied with EMERGENCY STOP CLEARED confirmation');
  assert(eStop.isHalted() === false, 'EmergencyStopController reports operational state');
  assert(!fs.existsSync(lockFilePath), 'emergency_stop.lock file was unlinked from disk');

  // ----------------------------------------------------------------
  // TEST B: Inline Keyboard approval -> SQLite queue & /runs/ update
  // ----------------------------------------------------------------
  console.log('\n--- [TEST B] Inline Keyboard Approval -> SQLite Queue & /runs/ Bundle Update ---');
  const bundleId = 'bun_qa_hitl_888';
  const bundleFolder = path.join(runsDir, bundleId);
  fs.mkdirSync(bundleFolder, { recursive: true });

  const initialBundle: BundleArtifact = {
    id: bundleId,
    createdAt: Date.now(),
    status: 'AWAITING_HUMAN_APPROVAL',
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/web3/test',
      topicTitle: 'Decentralized High Yield Arbitrage',
      sourceText: 'Seeking automated risk-reversal trading strategies',
      targetAudiencePain: 'High volatility slippage',
      metadata: {},
    },
    creative: {
      headline: 'Next-Gen Algorithmic Execution System 2026',
      body: 'Verified low-latency institutional quant execution.',
      callToAction: 'Unlock Instant Access',
      prelanderSlug: 'cmp_web3_de',
      generatedPrompt: 'prompt_qa',
    },
    compliance: {
      passed: true,
      score: 95,
      flaggedKeywords: [],
      reasoning: 'Compliant financial educational creative',
    },
  };

  fs.writeFileSync(path.join(bundleFolder, 'bundle.json'), JSON.stringify(initialBundle, null, 2), 'utf8');

  // Enqueue to ContentQueueRepository
  const queueRepo = ContentQueueRepository.getInstance();
  queueRepo.enqueue({
    id: bundleId,
    campaign_id: 'cmp_web3_de',
    network: 'mylead',
    hook: initialBundle.creative.headline,
    body: initialBundle.creative.body,
    stealth_cta: initialBundle.creative.callToAction,
    tracking_url: 'https://trk.mylead.com/click/888',
    image_path: '',
    target_platform: 'reddit',
    risk_score: 5,
    status: 'PENDING_APPROVAL',
  });

  const beforeQueueItem = queueRepo.fetchById(bundleId);
  assert(beforeQueueItem?.status === 'PENDING_APPROVAL', 'SQLite item starts in PENDING_APPROVAL status');

  // Simulate operator clicking [✅ Approve] button in Telegram
  await bot.handleCallbackQuery({
    id: 'cb_query_qa_approve',
    from: { id: 12345678, first_name: 'LeadQA', username: 'lead_qa' },
    message: {
      message_id: 201,
      chat: { id: 12345678, type: 'private' },
      date: Date.now(),
      text: 'HITL Review Prompt',
    },
    data: `approve_${bundleId}`,
  });

  // Verify SQLite queue update
  const afterQueueItem = queueRepo.fetchById(bundleId);
  assert(afterQueueItem?.status === 'APPROVED', 'SQLite item status transitioned to APPROVED');

  // Verify /runs/{bundleId}/bundle.json update
  const updatedBundleOnDisk: BundleArtifact = JSON.parse(
    fs.readFileSync(path.join(bundleFolder, 'bundle.json'), 'utf8')
  );
  assert(updatedBundleOnDisk.status === 'APPROVED', 'Bundle artifact on disk status transitioned to APPROVED');

  // ----------------------------------------------------------------
  // TEST C: Campaign scaffolding -> 100% valid HTML with zero broken macro links
  // ----------------------------------------------------------------
  console.log('\n--- [TEST C] Campaign Scaffolding -> 100% Valid HTML & Zero Broken Macro Links ---');
  CampaignScaffolder.resetInstance();
  const scaffolder = CampaignScaffolder.getInstance(campaignsDir);

  const scaffoldResult = await scaffolder.scaffoldMultiGeo({
    offerId: 'qa_finance_suite',
    vertical: 'finance',
    targetGeos: ['US', 'DE', 'FR', 'IT', 'ES', 'AU'],
    basePayout: 140.0,
    network: 'mylead',
  });

  assert(scaffoldResult.success === true, 'Scaffolding completed with success: true');
  assert(scaffoldResult.scaffoldedCampaigns.length === 6, 'Scaffolded 6 target GEO campaigns');
  assert(scaffoldResult.totalGeneratedVariants === 12, 'Generated 12 landing page variants');

  // Comprehensive audit across every single scaffolded HTML file
  for (const campaign of scaffoldResult.scaffoldedCampaigns) {
    const v1Path = path.join(campaign.path, 'v1/index.html');
    const v2Path = path.join(campaign.path, 'v2/index.html');
    const routerPath = path.join(campaign.path, 'index.html');

    assert(fs.existsSync(v1Path), `[${campaign.geo}] v1/index.html exists on disk`);
    assert(fs.existsSync(v2Path), `[${campaign.geo}] v2/index.html exists on disk`);
    assert(fs.existsSync(routerPath), `[${campaign.geo}] MAB router index.html exists on disk`);

    const v1Html = fs.readFileSync(v1Path, 'utf8');
    const v2Html = fs.readFileSync(v2Path, 'utf8');

    // 1. Audit tracking validation
    const valV1 = scaffolder.validateTracking(v1Html);
    const valV2 = scaffolder.validateTracking(v2Html);
    assert(valV1.passed === true, `[${campaign.geo}] v1 passes tracking audit`);
    assert(valV2.passed === true, `[${campaign.geo}] v2 passes tracking audit`);

    // 2. Audit macro placeholders integrity
    const ctaMatchesV1 = v1Html.match(/href="([^"]+)"/g) || [];
    assert(ctaMatchesV1.length > 0, `[${campaign.geo}] v1 contains href CTA links`);

    for (const linkMatch of ctaMatchesV1) {
      if (linkMatch.includes('postback-engine') || linkMatch.includes('mylead') || linkMatch.includes('lospollos')) {
        assert(linkMatch.includes('click_id={click_id}'), `[${campaign.geo}] Link preserves {click_id}`);
        assert(linkMatch.includes('sub1={sub1}'), `[${campaign.geo}] Link preserves {sub1}`);
        assert(linkMatch.includes('sub2=qa_finance_suite'), `[${campaign.geo}] Link preserves sub2 offer ID`);
      }
    }

    // 3. Audit Umami analytics tag integrity
    assert(v1Html.includes('/api/analytics/script.js'), `[${campaign.geo}] v1 contains Umami analytics endpoint`);
    assert(v1Html.includes(`data-website-id="${campaign.campaignId}"`), `[${campaign.geo}] v1 contains matching campaign website-id`);

    // 4. Audit HTML structure validity
    assert(v1Html.startsWith('<!DOCTYPE html>') && v1Html.includes('</html>'), `[${campaign.geo}] v1 has valid standalone HTML envelope`);
    assert(v2Html.startsWith('<!DOCTYPE html>') && v2Html.includes('</html>'), `[${campaign.geo}] v2 has valid standalone HTML envelope`);
  }

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 TELEGRAM & SCAFFOLDER QA RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTelegramScaffolderTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
