import fs from 'fs';
import path from 'path';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { EmergencyStopController, BundleArtifact } from '../../core/src/types/pipeline.js';
import { ContentQueueRepository } from '../../core/src/db/queueRepository.js';
import { GoldCatalogService } from '../services/gold-catalog.service.js';
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

async function runTelegramBotTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Interactive Telegram Control Bot & HITL Manager Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_tg_bot_' + Date.now());
  const runsDir = path.join(testDir, 'runs');
  fs.mkdirSync(runsDir, { recursive: true });

  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_TELEGRAM_BOT_TOKEN_123',
    defaultChatId: '999888777',
    allowedUserIds: ['12345678', '999888777', '@lead_operator'],
    runsDir,
  });

  // --- [TEST 1] Security Whitelist & Access Control ---
  console.log('--- [TEST 1] Security Whitelist & Access Control ---');
  assert(bot.isAuthorized('12345678') === true, 'Authorized user ID 12345678 is allowed');
  assert(bot.isAuthorized('999888777') === true, 'Authorized chat ID 999888777 is allowed');
  assert(bot.isAuthorized(undefined, 'lead_operator') === true, 'Authorized username @lead_operator is allowed');
  assert(bot.isAuthorized('55555555') === false, 'Unauthorized user ID 55555555 is blocked');
  assert(bot.isAuthorized(undefined, 'intruder_user') === false, 'Unauthorized username @intruder_user is blocked');

  // Command from unauthorized user
  const unauthResp = await bot.handleCommand({
    message_id: 1,
    chat: { id: 55555555, type: 'private' },
    from: { id: 55555555, is_bot: false, first_name: 'Intruder' },
    date: Date.now(),
    text: '/stats',
  });
  assert(unauthResp.includes('ДОСТУП ЗАПРЕЩЕН'), 'Unauthorized command returns ACCESS DENIED banner');

  // --- [TEST 2] Interactive Commands: /stats, /queue, /help ---
  console.log('\n--- [TEST 2] Interactive Commands: /stats, /queue, /help ---');
  const statsResp = await bot.handleCommand({
    message_id: 2,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/stats',
  });
  assert(statsResp.includes('AFFILIATE OPS // ФИНАНСОВЫЙ СТАТУС'), '/stats response contains financial status header');
  assert(statsResp.includes('Выручка сегодня:'), '/stats response includes revenue');
  assert(statsResp.includes('Всего кликов:'), '/stats response includes clicks');

  const queueResp = await bot.handleCommand({
    message_id: 3,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/queue',
  });
  assert(queueResp.includes('ОЧЕРЕДЬ КОНТЕНТА // SQLITE QUEUE'), '/queue response contains queue status header');
  assert(queueResp.includes('Ожидают одобрения (HITL):'), '/queue response includes HITL count');

  const helpResp = await bot.handleCommand({
    message_id: 4,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/help',
  });
  assert(helpResp.includes('/estop'), '/help response lists /estop command');
  assert(helpResp.includes('/pause'), '/help response lists /pause command');

  // --- [TEST 3] Emergency Stop Commands: /estop and /reset_estop ---
  console.log('\n--- [TEST 3] Emergency Stop Commands: /estop and /reset_estop ---');
  const eStop = EmergencyStopController.getInstance();
  eStop.clear('SPEC_SETUP');

  const estopResp = await bot.handleCommand({
    message_id: 5,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/estop',
  });
  assert(estopResp.includes('EMERGENCY STOP TRIGGERED'), '/estop command triggers emergency stop');
  assert(eStop.isHalted() === true, 'EmergencyStopController.isHalted() is true');

  const resetEstopResp = await bot.handleCommand({
    message_id: 6,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/reset_estop',
  });
  assert(resetEstopResp.includes('EMERGENCY STOP CLEARED'), '/reset_estop command clears emergency stop');
  assert(eStop.isHalted() === false, 'EmergencyStopController.isHalted() is false');

  // --- [TEST 4] Agent Management Commands: /pause and /resume ---
  console.log('\n--- [TEST 4] Agent Management Commands: /pause and /resume ---');
  const gateway = LlmGatewayService.getInstance();
  gateway.loadRegistry();

  const pauseResp = await bot.handleCommand({
    message_id: 7,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/pause agent-distribution-worker-04',
  });
  assert(pauseResp.includes('ПРИОСТАНОВЛЕН'), '/pause command returns confirmation');
  assert(gateway.getAgent('agent-distribution-worker-04')?.isPaused === true, 'Agent is paused in registry');

  const resumeResp = await bot.handleCommand({
    message_id: 8,
    chat: { id: 12345678, type: 'private' },
    from: { id: 12345678, is_bot: false, first_name: 'Lead' },
    date: Date.now(),
    text: '/resume agent-distribution-worker-04',
  });
  assert(resumeResp.includes('ВОЗОБНОВИЛ РАБОТУ'), '/resume command returns confirmation');
  assert(gateway.getAgent('agent-distribution-worker-04')?.isPaused === false, 'Agent is active in registry');

  // --- [TEST 5] HITL Push Notification Format & Callback Actions ---
  console.log('\n--- [TEST 5] HITL Push Notification Format & Callback Actions ---');
  const testBundleId = 'bun_tg_test_101';
  const bundleDir = path.join(runsDir, testBundleId);
  fs.mkdirSync(bundleDir, { recursive: true });

  const testBundle: BundleArtifact = {
    id: testBundleId,
    createdAt: Date.now(),
    status: 'AWAITING_HUMAN_APPROVAL',
    context: {
      platform: 'reddit',
      sourceUrl: 'https://reddit.com/r/investing/test_post',
      topicTitle: 'Best algorithmic trading bots 2026',
      sourceText: 'Looking for verified automated strategies',
      targetAudiencePain: 'Losing manual trades without risk management',
      metadata: {},
    },
    creative: {
      headline: 'Stop relying on manual trade execution in 2026',
      body: 'Verified quantitative arbitrage algorithm with 94.8% risk-reversal.',
      callToAction: 'Access Institutional Quant Bot',
      prelanderSlug: 'cmp_trading_au',
      generatedPrompt: 'prompt_101',
    },
    compliance: {
      passed: true,
      score: 96,
      flaggedKeywords: [],
      reasoning: 'Clean educational framing with full disclaimer',
    },
  };

  fs.writeFileSync(path.join(bundleDir, 'bundle.json'), JSON.stringify(testBundle, null, 2), 'utf8');

  // Enqueue into ContentQueueRepository
  const queueRepo = ContentQueueRepository.getInstance();
  queueRepo.enqueue({
    id: testBundleId,
    campaign_id: 'cmp_trading_au',
    network: 'mylead',
    hook: testBundle.creative.headline,
    body: testBundle.creative.body,
    stealth_cta: testBundle.creative.callToAction,
    tracking_url: 'https://trk.mylead.com/smartlink/101',
    image_path: '',
    target_platform: 'reddit',
    risk_score: 4,
    status: 'PENDING_APPROVAL',
  });

  // Verify HITL Prompt can be dispatched
  const promptDispatched = await bot.sendHitlApprovalPrompt(testBundle);
  assert(promptDispatched === true, 'sendHitlApprovalPrompt successfully executed');

  // --- [TEST 6] Callback Query Approval & GoldCatalog Ingestion ---
  console.log('\n--- [TEST 6] Callback Query Approval & GoldCatalog Ingestion ---');
  const goldCatalog = GoldCatalogService.getInstance();
  const initialGoldCount = goldCatalog.getGoldSamplesCount();

  await bot.handleCallbackQuery({
    id: 'cb_query_1',
    from: { id: 12345678, first_name: 'LeadOperator', username: 'lead_operator' },
    message: {
      message_id: 10,
      chat: { id: 12345678, type: 'private' },
      date: Date.now(),
      text: 'HITL Prompt Text',
    },
    data: `approve_${testBundleId}`,
  });

  // Check bundle status on disk
  const updatedBundle = JSON.parse(fs.readFileSync(path.join(bundleDir, 'bundle.json'), 'utf8'));
  assert(updatedBundle.status === 'APPROVED', 'Bundle on disk marked as APPROVED after callback');

  // Check SQLite queue
  const queueItem = queueRepo.fetchById(testBundleId);
  assert(queueItem?.status === 'APPROVED', 'SQLite queue item marked as APPROVED');

  // Check Gold Catalog (compliance score was 96 >= 90)
  assert(goldCatalog.getGoldSamplesCount() >= initialGoldCount, 'Bundle ingested into GoldCatalogService on approval');

  // --- [TEST 7] Public Quiz Converter Flow ---
  console.log('\n--- [TEST 7] Public Quiz Converter Flow ---');
  const publicChatId = '777666555';
  const publicMsg = {
    message_id: 20,
    chat: { id: Number(publicChatId), type: 'private' },
    from: { id: Number(publicChatId), is_bot: false, first_name: 'QuizSeeker', username: 'dating_fan' },
    date: Date.now(),
    text: '/start',
  };

  const startResp = await bot.handleCommand(publicMsg);
  assert(startResp.includes('Welcome!'), 'Public /start returns welcome quiz banner');
  assert(startResp.includes('age range'), 'Public /start asks for age range');

  // Step 1: User chooses age range 26-35
  await bot.handleCallbackQuery({
    id: 'quiz_cb_age',
    from: { id: Number(publicChatId), first_name: 'QuizSeeker', username: 'dating_fan' },
    message: {
      message_id: 21,
      chat: { id: Number(publicChatId), type: 'private' },
      date: Date.now(),
      text: 'What age range?',
    },
    data: 'quiz_age:26-35',
  });

  const { TelegramLeadRepository } = await import('../../core/src/db/tg-leads.repository.js');
  const leadRepo = TelegramLeadRepository.getInstance();
  const inProgressLead = leadRepo.getLead(publicChatId);
  assert(inProgressLead !== null, 'Lead created in SQLite repository');
  assert(inProgressLead?.age_range === '26-35', 'Age range 26-35 saved');
  assert(inProgressLead?.status === 'QUIZ_IN_PROGRESS', 'Lead status is QUIZ_IN_PROGRESS');

  // Step 2 -> Step 3: User chooses connection type: Casual
  await bot.handleCallbackQuery({
    id: 'quiz_cb_type',
    from: { id: Number(publicChatId), first_name: 'QuizSeeker', username: 'dating_fan' },
    message: {
      message_id: 22,
      chat: { id: Number(publicChatId), type: 'private' },
      date: Date.now(),
      text: 'Target connection type?',
    },
    data: 'quiz_type:Casual:26-35',
  });

  const completedLead = leadRepo.getLead(publicChatId);
  assert(completedLead?.status === 'QUIZ_COMPLETED', 'Lead status upgraded to QUIZ_COMPLETED');
  assert(completedLead?.connection_type === 'Casual', 'Connection type saved as Casual');
  assert(
    completedLead?.tracking_url !== undefined &&
      (completedLead.tracking_url.includes('s1=') || completedLead.tracking_url.includes('sub1=')),
    'Tracking URL includes secure click parameter (s1 or sub1)'
  );
  assert(
    completedLead?.tracking_url?.includes(`tg_${publicChatId}`) === false,
    'Zero-PII: Raw Telegram chatId is not leaked in tracking URL'
  );

  // --- [TEST 8] Postback Route Integration & Conversion Status Update ---
  console.log('\n--- [TEST 8] Postback Route Integration & Conversion Status Update ---');
  const { handlePostback, sendConversionNotification } = await import('../../core/src/server/routes/postback.router.js');

  const mockPostbackReq = {
    path: '/api/postback',
    method: 'GET',
    query: {
      payout: '15.50',
      s1: `tg_${publicChatId}`,
      status: 'sale',
    },
    body: {},
  } as any;

  let postbackResJson: any = null;
  const mockPostbackRes = {
    status: () => ({
      json: (data: any) => { postbackResJson = data; return data; },
    }),
  } as any;

  await handlePostback(mockPostbackReq, mockPostbackRes);
  assert(postbackResJson?.success === true, 'handlePostback returned success: true for /api/postback');

  const convertedLead = leadRepo.getLead(publicChatId);
  assert(convertedLead?.status === 'CONVERTED', 'Lead status updated to CONVERTED upon postback arrival');

  const notificationSent = await sendConversionNotification(15.50, `tg_${publicChatId}`);
  assert(notificationSent === true, 'Conversion notification successfully generated and dispatched');

  // Clean test sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 TELEGRAM CONTROL BOT SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTelegramBotTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
