import fs from 'fs';
import path from 'path';
import { OfferRoutingService } from '../../core/src/services/offer-routing.service.js';
import { TelegramControlBot } from '../../core/src/services/telegram-control-bot.service.js';
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

async function runOfferRoutingTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Multi-Armed Bandit (MAB) Offer Router Test Suite (SQLite SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_offer_routing_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });

  TelegramLeadRepository.resetInstance();
  const leadRepo = TelegramLeadRepository.getInstance(testDir);

  OfferRoutingService.resetInstance();
  const service = OfferRoutingService.getInstance({
    customDbDir: testDir,
    explorationRate: 0.2, // 20% explore / 80% exploit
  });

  // --- [TEST 1] Pool Initialization & Zero Demo State ---
  console.log('--- [TEST 1] Pool Initialization & Zero Demo State ---');
  const statsInitial = service.getStats();
  assert(statsInitial.lospollos !== undefined, 'Offer pool contains LosPollos Smartlink');
  assert(statsInitial.mylead !== undefined, 'Offer pool contains MyLead Smartlink');
  assert(statsInitial.lospollos.impressions === 0, 'Zero Demo Rule: Initial impressions are 0');
  assert(statsInitial.lospollos.conversions === 0, 'Zero Demo Rule: Initial conversions are 0');
  assert(statsInitial.lospollos.revenue === 0, 'Zero Demo Rule: Initial revenue is $0.00');
  assert(statsInitial.lospollos.epc === 0, 'Zero Demo Rule: Initial EPC is $0.00');

  // --- [TEST 2] NanoID Click Attribution & Zero PII Leak ---
  console.log('\n--- [TEST 2] NanoID Click Attribution & Zero PII Leak ---');
  const selection1 = service.selectBestOffer('888111');
  assert(typeof selection1.clickId === 'string' && selection1.clickId.length >= 10, 'Generated secure 12-char clickId');
  assert(selection1.url.includes(selection1.clickId), 'Generated URL contains clickId tracking parameter');
  assert(!selection1.url.includes('tg_888111'), 'Zero-PII: Raw Telegram chatId is not leaked in tracking URL');

  if (selection1.offerId === 'lospollos') {
    assert(selection1.url.includes(`s1=${selection1.clickId}`), 'LosPollos uses s1=clickId mapping');
  } else {
    assert(selection1.url.includes(`sub1=${selection1.clickId}`), 'MyLead uses sub1=clickId mapping');
  }

  // Verify attribution bridge in SQLite
  const resolved = leadRepo.resolveClickAttribution(selection1.clickId);
  assert(resolved !== null, 'Click attribution bridge found in SQLite');
  assert(resolved?.chat_id === '888111', 'Attribution correctly resolves back to chat_id 888111');
  assert(resolved?.offer_id === selection1.offerId, 'Attribution correctly maps to selected offerId');

  // Verify SQLite mab_arms impression count
  const statsAfterSelect = service.getStats();
  const selectedCount = statsAfterSelect[selection1.offerId].impressions;
  assert(selectedCount >= 1, 'Impression recorded atomically in SQLite mab_arms');

  // --- [TEST 3] Postback Attribution & EPC Reward Recalculation ---
  console.log('\n--- [TEST 3] Postback Attribution & EPC Reward Recalculation ---');
  // Record conversion for mylead ($25.00)
  const converted = service.recordConversion('mylead', 25.0);
  assert(converted === true, 'Conversion successfully recorded for mylead in SQLite');
  const statsAfterConv = service.getStats();
  assert(statsAfterConv.mylead.conversions === 1, 'MyLead conversion count incremented');
  assert(statsAfterConv.mylead.revenue === 25.0, 'MyLead revenue reflects $25.00 payout');
  assert(statsAfterConv.mylead.epc > 0, 'MyLead EPC recalculated based on payout');

  // --- [TEST 4] Exploitation Shift to Higher EPC Winner ---
  console.log('\n--- [TEST 4] Exploitation Shift to Higher EPC Winner ---');
  OfferRoutingService.resetInstance();
  const exploitService = OfferRoutingService.getInstance({
    customDbDir: testDir,
    explorationRate: 0.0, // 100% exploitation mode
  });

  const exploitSelection = exploitService.selectBestOffer('999222');
  assert(exploitSelection.offerId === 'mylead', 'Exploitation routes directly to highest EPC offer (MyLead)');
  assert(exploitSelection.strategy === 'EXPLOITATION', 'Strategy flagged as EXPLOITATION');

  // Now award LosPollos a massive payout ($100.00) so its EPC beats MyLead
  exploitService.recordConversion('lospollos', 100.0);
  const newWinnerSelection = exploitService.selectBestOffer('999333');
  assert(newWinnerSelection.offerId === 'lospollos', 'Router shifts winner to LosPollos as its EPC overtakes MyLead');

  // --- [TEST 5] Telegram Quiz Flow Integration ---
  console.log('\n--- [TEST 5] Telegram Quiz Flow Integration ---');
  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_MAB_SQLITE',
    defaultChatId: '999888777',
    adminChatId: '999888777',
  });

  // Simulate user answering Step 2 -> Step 3
  await bot.handleCallbackQuery({
    id: 'cb_mab_quiz_sqlite',
    from: { id: 777999, first_name: 'LeadTester' },
    message: { chat: { id: 777999 }, message_id: 555 },
    data: 'quiz_type:Casual:26-35',
  });

  const savedLead = leadRepo.getLead(777999);
  assert(savedLead !== null, 'Lead saved in SQLite upon quiz completion');
  assert(savedLead?.status === 'QUIZ_COMPLETED', 'Lead status is QUIZ_COMPLETED');
  assert(savedLead?.selected_offer !== undefined, 'MAB selected_offer persisted on lead');
  assert(savedLead?.tracking_url !== undefined, 'Lead tracking_url generated');
  assert(!savedLead?.tracking_url?.includes('tg_777999'), 'Tracking URL does not leak raw chat_id');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 OFFER ROUTING SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOfferRoutingTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
