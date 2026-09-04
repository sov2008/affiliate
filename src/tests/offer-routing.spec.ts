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
  console.log('🧪 Multi-Vertical TDS Routing Matrix & MAB Router Test Suite (SPEC)');
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
  assert(statsInitial.lospollos_dating !== undefined, 'Offer pool contains LosPollos Dating Smartlink');
  assert(statsInitial.lospollos_casual !== undefined, 'Offer pool contains LosPollos Casual Smartlink');
  assert(statsInitial.lospollos_cams !== undefined, 'Offer pool contains LosPollos Cams Smartlink');
  assert(statsInitial.lospollos_games !== undefined, 'Offer pool contains LosPollos Games Smartlink');
  assert(statsInitial.lospollos_tiktok !== undefined, 'Offer pool contains LosPollos TikTok Smartlink');
  assert(statsInitial.mylead !== undefined, 'Offer pool contains MyLead Smartlink');
  assert(statsInitial.lospollos_dating.impressions === 0, 'Zero Demo Rule: Initial impressions are 0');
  assert(statsInitial.lospollos_dating.conversions === 0, 'Zero Demo Rule: Initial conversions are 0');
  assert(statsInitial.lospollos_dating.revenue === 0, 'Zero Demo Rule: Initial revenue is $0.00');
  assert(statsInitial.lospollos_dating.epc === 0, 'Zero Demo Rule: Initial EPC is $0.00');

  // --- [TEST 2] NanoID Click Attribution & Zero PII Leak ---
  console.log('\n--- [TEST 2] NanoID Click Attribution & Zero PII Leak ---');
  const selection1 = service.selectBestOffer('888111');
  assert(typeof selection1.clickId === 'string' && selection1.clickId.length >= 10, 'Generated secure 12-char clickId');
  assert(selection1.url.includes(selection1.clickId), 'Generated URL contains clickId tracking parameter');
  assert(!selection1.url.includes('tg_888111'), 'Zero-PII: Raw Telegram chatId is not leaked in tracking URL');
  assert(selection1.url.includes(`cid=${selection1.clickId}`), 'Outbound URL uses cid=clickId mapping');

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
  exploitService.recordConversion('lospollos_dating', 100.0);
  exploitService.recordConversion('lospollos', 100.0);
  const newWinnerSelection = exploitService.selectBestOffer('999333');
  assert(newWinnerSelection.offerId.startsWith('lospollos'), 'Router shifts winner to LosPollos as its EPC overtakes MyLead');

  // --- [TEST 5] Multi-Vertical TDS Routing Matrix Rules ---
  console.log('\n--- [TEST 5] Multi-Vertical TDS Routing Matrix Rules ---');

  // Rule 1: TikTok traffic tag (startParam starts with 'tt_') -> resolve LOSPOLLOS_TIKTOK_URL
  const ttResult = service.resolveOfferUrl({
    chatId: '1001',
    startParam: 'tt_viral_01',
    connType: 'Serious Connection',
  });
  assert(ttResult.offerId === 'lospollos_tiktok', 'startParam starting with tt_ routes to lospollos_tiktok');
  assert(ttResult.url.includes('honestpairing.org/rpvpd3t'), 'TikTok URL matches verified domain');

  // Rule 2: Preference matches "cams" or "virtual" -> resolve LOSPOLLOS_CAMS_URL
  const camsResult = service.resolveOfferUrl({
    chatId: '1002',
    connType: 'Virtual / Cams',
    ageRange: '26-35',
  });
  assert(camsResult.offerId === 'lospollos_cams', 'Virtual / Cams intent routes to lospollos_cams');
  assert(camsResult.url.includes('yearningcompanion.org/rpvpd31'), 'Cams URL matches verified domain');

  // Rule 3: Preference matches "gaming" or age is 18-25 with casual intent -> resolve LOSPOLLOS_GAMES_URL
  const gamesResult1 = service.resolveOfferUrl({
    chatId: '1003',
    connType: 'Interactive Fun',
    ageRange: '26-35',
  });
  assert(gamesResult1.offerId === 'lospollos_games', 'Interactive Fun intent routes to lospollos_games');
  assert(gamesResult1.url.includes('realmessaging.org/rpqpd3w'), 'Games URL matches verified domain');

  const gamesResult2 = service.resolveOfferUrl({
    chatId: '1004',
    connType: 'Casual Flirt',
    ageRange: '18-25',
  });
  assert(gamesResult2.offerId === 'lospollos_games', 'Age 18-25 with Casual Flirt routes to lospollos_games');

  // Rule 4: Preference matches "casual" or "flirt" (age 26-35) -> resolve LOSPOLLOS_CASUAL_URL
  const casualResult = service.resolveOfferUrl({
    chatId: '1005',
    connType: 'Casual Flirt',
    ageRange: '26-35',
  });
  assert(casualResult.offerId === 'lospollos_casual', 'Casual Flirt (age >25) routes to lospollos_casual');
  assert(casualResult.url.includes('engagingdating.org/rpupd31'), 'Casual URL matches verified domain');

  // Rule 5: Default / "serious" dating -> resolve LOSPOLLOS_DATING_URL
  const datingResult = service.resolveOfferUrl({
    chatId: '1006',
    connType: 'Serious Connection',
    ageRange: '26-35',
  });
  assert(datingResult.offerId === 'lospollos_dating', 'Serious Connection routes to lospollos_dating');
  assert(datingResult.url.includes('chemistrydrivensmile.org/rp1pd38'), 'Dating URL matches verified domain');

  // --- [TEST 6] Uniform SubID Query String Structure ---
  console.log('\n--- [TEST 6] Uniform SubID Query String Structure ---');
  assert(!datingResult.url.includes('//rp1pd38/'), 'No double slashes in URL path');
  assert(datingResult.url.includes('sub1=reddit_dating'), 'sub1 contains traffic source');
  assert(datingResult.url.includes('sub2=1006'), 'sub2 contains tg user id');
  assert(datingResult.url.includes(`cid=${datingResult.clickId}`), 'cid contains clickId');
  assert(datingResult.url.startsWith('https://yex2brk.chemistrydrivensmile.org/rp1pd38?sub1='), 'URL structure is strictly formatted');

  // --- [TEST 7] Telegram Bot Flow Integration ---
  console.log('\n--- [TEST 7] Telegram Bot Flow Integration ---');
  TelegramControlBot.resetInstance();
  const bot = TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_MAB_SQLITE',
    defaultChatId: '999888777',
    adminChatId: '999888777',
  });

  // User starts bot with TikTok tag: /start tt_campaign_alpha
  await bot.handleCommand({
    message_id: 1,
    chat: { id: 888777, type: 'private' },
    from: { id: 888777, first_name: 'TikTokLead' },
    text: '/start tt_campaign_alpha',
  });

  // User answers Question 1: Age 18-25
  await bot.handleCallbackQuery({
    id: 'cb_q1',
    from: { id: 888777, first_name: 'TikTokLead' },
    message: { chat: { id: 888777 }, message_id: 10 },
    data: 'quiz_age:18-25',
  });

  // User answers Question 2: Interactive Fun
  await bot.handleCallbackQuery({
    id: 'cb_q2',
    from: { id: 888777, first_name: 'TikTokLead' },
    message: { chat: { id: 888777 }, message_id: 11 },
    data: 'quiz_type:Interactive Fun:18-25',
  });

  const savedLead = leadRepo.getLead(888777);
  assert(savedLead !== null, 'Lead successfully saved in SQLite');
  assert(savedLead?.status === 'QUIZ_COMPLETED', 'Lead status is QUIZ_COMPLETED');
  assert(savedLead?.source === 'tt_campaign_alpha', 'Traffic source tt_campaign_alpha preserved on lead');
  assert(savedLead?.selected_offer === 'lospollos_tiktok', 'tt_ source routed lead to lospollos_tiktok');
  assert(savedLead?.tracking_url?.includes('sub1=tt_campaign_alpha'), 'Tracking URL sub1 contains preserved source tag');
  assert(savedLead?.tracking_url?.includes('sub2=888777'), 'Tracking URL sub2 contains chatId');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 MULTI-VERTICAL ROUTER SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOfferRoutingTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
