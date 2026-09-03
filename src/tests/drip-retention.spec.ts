import fs from 'fs';
import path from 'path';
import { TelegramLeadRepository, TgLeadItem } from '../../core/src/db/tg-leads.repository.js';
import { DripRetentionWorker } from '../../core/src/workers/drip-retention.worker.js';
import { TelegramControlBot } from '../../core/src/services/telegram-control-bot.service.js';

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

async function runDripRetentionTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Drip Retention Engine for Telegram Quiz Leads (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_drip_retention_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });

  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_DRIP',
    defaultChatId: '999888777',
    adminChatId: '999888777',
  });

  TelegramLeadRepository.resetInstance();
  const leadRepo = TelegramLeadRepository.getInstance(testDir);

  DripRetentionWorker.resetInstance();
  const worker = DripRetentionWorker.getInstance();

  const now = Date.now();
  const H = 3600 * 1000;

  // --- [TEST 1] Seeding Test Leads ---
  console.log('--- [TEST 1] Seeding Test Leads ---');
  // Lead 1: Step 1 candidate (completed 3 hours ago, drip_step = 0)
  const lead1 = leadRepo.saveLead({
    chat_id: '100001',
    username: 'user_step1',
    age_range: '18-25',
    connection_type: 'Casual',
    status: 'QUIZ_COMPLETED',
    tracking_url: 'https://glstrck.com/aff_c?offer_id=123&aff_id=456&s1=tg_100001',
    drip_step: 0,
    created_at: now - 3 * H,
    updated_at: now - 3 * H,
  });

  // Lead 2: Step 2 candidate (completed 26 hours ago, drip_step = 1)
  const lead2 = leadRepo.saveLead({
    chat_id: '100002',
    username: 'user_step2',
    age_range: '26-35',
    connection_type: 'Serious',
    status: 'QUIZ_COMPLETED',
    tracking_url: 'https://glstrck.com/aff_c?offer_id=123&aff_id=456&s1=tg_100002',
    drip_step: 1,
    created_at: now - 26 * H,
    updated_at: now - 26 * H,
  });

  // Lead 3: Step 3 candidate (completed 75 hours ago, drip_step = 2)
  const lead3 = leadRepo.saveLead({
    chat_id: '100003',
    username: 'user_step3',
    age_range: '36+',
    connection_type: 'Any',
    status: 'QUIZ_COMPLETED',
    tracking_url: 'https://glstrck.com/aff_c?offer_id=123&aff_id=456&s1=tg_100003',
    drip_step: 2,
    created_at: now - 75 * H,
    updated_at: now - 75 * H,
  });

  // Lead 4: Converted user (completed 3 hours ago, drip_step = 0, but CONVERTED)
  const lead4 = leadRepo.saveLead({
    chat_id: '100004',
    username: 'user_converted',
    age_range: '18-25',
    connection_type: 'Casual',
    status: 'CONVERTED',
    tracking_url: 'https://glstrck.com/aff_c?offer_id=123&aff_id=456&s1=tg_100004',
    drip_step: 0,
    created_at: now - 3 * H,
    updated_at: now - 3 * H,
  });

  // Lead 5: Unfinished quiz (QUIZ_IN_PROGRESS)
  const lead5 = leadRepo.saveLead({
    chat_id: '100005',
    username: 'user_in_progress',
    status: 'QUIZ_IN_PROGRESS',
    drip_step: 0,
    created_at: now - 3 * H,
    updated_at: now - 3 * H,
  });

  assert(leadRepo.getAllLeads().length === 5, 'All 5 test leads created in SQLite/JSON');

  // --- [TEST 2] Eligibility Query Filtering ---
  console.log('\n--- [TEST 2] Eligibility Query Filtering ---');
  // Step 1: 2h - 24h, drip_step = 0
  const s1Candidates = leadRepo.getLeadsForDrip(1, 2 * H, 24 * H);
  assert(s1Candidates.length === 1, 'Step 1 query returns exactly 1 candidate');
  assert(s1Candidates[0].chat_id === '100001', 'Candidate is lead1 (chat_id: 100001)');
  assert(!s1Candidates.some((l) => l.chat_id === '100004'), 'Strict Zero-Spam: CONVERTED lead is excluded from Step 1');
  assert(!s1Candidates.some((l) => l.chat_id === '100005'), 'Incomplete quiz lead is excluded from Step 1');

  // Step 2: 24h - 72h, drip_step = 1
  const s2Candidates = leadRepo.getLeadsForDrip(2, 24 * H, 72 * H);
  assert(s2Candidates.length === 1, 'Step 2 query returns exactly 1 candidate');
  assert(s2Candidates[0].chat_id === '100002', 'Candidate is lead2 (chat_id: 100002)');

  // Step 3: 72h - 336h, drip_step = 2
  const s3Candidates = leadRepo.getLeadsForDrip(3, 72 * H, 14 * 24 * H);
  assert(s3Candidates.length === 1, 'Step 3 query returns exactly 1 candidate');
  assert(s3Candidates[0].chat_id === '100003', 'Candidate is lead3 (chat_id: 100003)');

  // --- [TEST 3] Push Delivery & Step Increment ---
  console.log('\n--- [TEST 3] Push Delivery & Step Increment ---');
  const resStep1 = await worker.sendStep1Push(lead1);
  assert(resStep1 === true, 'Step 1 push successfully dispatched');
  const updatedLead1 = leadRepo.getLead('100001');
  assert(updatedLead1?.drip_step === 1, 'Lead1 drip_step incremented to 1');
  assert(Number(updatedLead1?.last_drip_at) > 0, 'Lead1 last_drip_at timestamp recorded');

  const resStep2 = await worker.sendStep2Push(lead2);
  assert(resStep2 === true, 'Step 2 push successfully dispatched');
  const updatedLead2 = leadRepo.getLead('100002');
  assert(updatedLead2?.drip_step === 2, 'Lead2 drip_step incremented to 2');

  const resStep3 = await worker.sendStep3Push(lead3);
  assert(resStep3 === true, 'Step 3 push successfully dispatched');
  const updatedLead3 = leadRepo.getLead('100003');
  assert(updatedLead3?.drip_step === 3, 'Lead3 drip_step incremented to 3');

  // --- [TEST 4] Converted User Guard ---
  console.log('\n--- [TEST 4] Converted User Guard ---');
  const resConverted = await worker.sendStep1Push(lead4);
  assert(resConverted === false, 'Dispatch to CONVERTED user is blocked');
  const checkLead4 = leadRepo.getLead('100004');
  assert(checkLead4?.drip_step === 0, 'Converted lead drip_step unchanged');

  // --- [TEST 5] Graceful 403 / Blocked Handling ---
  console.log('\n--- [TEST 5] Graceful 403 / Blocked Handling ---');
  // Mock bot throwing 403 Forbidden for a blocked user
  const originalSend = bot.sendMessage.bind(bot);
  (bot as any).sendMessage = async (chatId: string) => {
    if (chatId === '100001') {
      throw new Error('403: Forbidden: bot was blocked by the user');
    }
    return true;
  };

  // Lead1 now receives next push, encounters simulated block
  const blockedLead = leadRepo.getLead('100001')!;
  const resBlocked = await worker.sendStep2Push(blockedLead);
  assert(resBlocked === false, 'Blocked user delivery returns false without crashing');
  const archivedLead = leadRepo.getLead('100001');
  assert(archivedLead?.drip_step === 99, 'Blocked user archived with drip_step = 99');

  // Restore bot.sendMessage
  (bot as any).sendMessage = originalSend;

  // --- [TEST 6] Quiet Hours Guard (22:00 - 09:00) ---
  console.log('\n--- [TEST 6] Quiet Hours Guard (22:00 - 09:00) ---');
  // 1. Midnight 23:30 should be quiet hours
  const nightDate = new Date('2026-09-03T23:30:00');
  assert(DripRetentionWorker.isQuietHours(nightDate.getTime()) === true, '23:30 is identified as Quiet Hours');

  // 2. Early morning 04:15 should be quiet hours
  const dawnDate = new Date('2026-09-03T04:15:00');
  assert(DripRetentionWorker.isQuietHours(dawnDate.getTime()) === true, '04:15 is identified as Quiet Hours');

  // 3. Afternoon 14:00 should NOT be quiet hours
  const dayDate = new Date('2026-09-03T14:00:00');
  assert(DripRetentionWorker.isQuietHours(dayDate.getTime()) === false, '14:00 is NOT Quiet Hours');

  // 4. Check next active dispatch time
  const nextTime = DripRetentionWorker.getNextActiveDispatchTime(nightDate.getTime());
  const nextDate = new Date(nextTime);
  assert(nextDate.getHours() === 9 && nextDate.getMinutes() === 15, 'Next active dispatch time is scheduled for 09:15 AM');

  // 5. runCycle during quiet hours stops delivery
  const cycleQuiet = await worker.runCycle({ nowTimestamp: nightDate.getTime() });
  assert(cycleQuiet.isQuietHours === true, 'runCycle flags quiet hours as active');
  assert(cycleQuiet.step1Sent === 0 && cycleQuiet.totalProcessed === 0, 'No pushes dispatched during quiet hours');

  // Cleanup test environment
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 DRIP RETENTION SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runDripRetentionTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
