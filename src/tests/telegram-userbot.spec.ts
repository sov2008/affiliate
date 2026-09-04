import fs from 'fs';
import path from 'path';
import { TelegramUserbotService } from '../../core/src/services/telegram-userbot.service.js';
import { TelegramLeadRepository } from '../../core/src/db/tg-leads.repository.js';
import { EmergencyStopController } from '../../core/src/types/pipeline.js';
import { OfferRoutingService } from '../../core/src/services/offer-routing.service.js';

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

async function runTelegramUserbotTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Autonomous Telegram MTProto Userbot Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_userbot_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });

  TelegramLeadRepository.resetInstance();
  const leadRepo = TelegramLeadRepository.getInstance(testDir);

  OfferRoutingService.resetInstance();
  OfferRoutingService.getInstance({
    customDbDir: testDir,
  });

  const userbot = new TelegramUserbotService(leadRepo);

  // --- [TEST 1] Trigger Keyword Matching ---
  console.log('--- [TEST 1] Trigger Keyword Matching ---');
  assert(userbot.matchTrigger('Hey, do you have a dating link?') === 'dating', 'Matches English "dating" keyword');
  assert(userbot.matchTrigger('Привет, скинь ссылку на знакомства') === 'знакомства', 'Matches Russian "знакомства" keyword');
  assert(userbot.matchTrigger('Где анкеты девушек?') === 'анкеты', 'Matches Russian "анкеты" keyword');
  assert(userbot.matchTrigger('Just saying hello, how are you?') === null, 'Ignores non-matching conversation');

  // --- [TEST 2] Defensive Message Filters (Self, Bots, Channels) ---
  console.log('\n--- [TEST 2] Defensive Message Filters ---');
  // Self / Outgoing
  const selfRes = await userbot.evaluateMessage({
    peerId: '12345',
    text: 'Check this dating link',
    isOut: true,
  });
  assert(selfRes.ignored === true && selfRes.reason === 'OUTGOING', 'Defensive Filter: Outgoing messages from self ignored');

  // Channel / Group
  const channelRes = await userbot.evaluateMessage({
    peerId: '99999',
    text: 'Any dating site recommendation?',
    isChannel: true,
  });
  assert(channelRes.ignored === true && channelRes.reason === 'CHANNEL_OR_GROUP', 'Defensive Filter: Channel messages ignored');

  // Bot sender
  const botRes = await userbot.evaluateMessage({
    peerId: '88888',
    text: 'dating query from automated bot',
    isBot: true,
  });
  assert(botRes.ignored === true && botRes.reason === 'BOT', 'Defensive Filter: Automated bot messages ignored');

  // --- [TEST 3] Rate Limiting & 120s Cooldown Enforcement ---
  console.log('\n--- [TEST 3] Rate Limiting & 120s Cooldown ---');
  const peer1 = '5551234';
  assert(userbot.isRateLimited(peer1) === false, 'Initial query is not rate limited');

  // First qualified DM
  const firstRes = await userbot.evaluateMessage({
    peerId: peer1,
    username: 'test_user_01',
    text: 'Hi, where can I meet girls?',
    isOut: false,
  });
  assert(firstRes.ignored === false, 'First qualified DM is processed');
  assert(userbot.isRateLimited(peer1) === true, 'Peer is now rate limited');

  // Immediate second message from same peer -> Cooldown active
  const secondRes = await userbot.evaluateMessage({
    peerId: peer1,
    username: 'test_user_01',
    text: 'another dating question right away',
    isOut: false,
  });
  assert(secondRes.ignored === true && secondRes.reason === 'COOLDOWN', 'Immediate follow-up within 120s is dropped (flood protection)');

  // Different peer -> Not affected by other peer cooldown
  const peer2 = '7779999';
  const otherPeerRes = await userbot.evaluateMessage({
    peerId: peer2,
    username: 'test_user_02',
    text: 'can you send me the dating link?',
    isOut: false,
  });
  assert(otherPeerRes.ignored === false, 'Different peer is not blocked by peer1 cooldown');

  // --- [TEST 4] Routing Link Generation & SubID Mapping ---
  console.log('\n--- [TEST 4] Routing Link Generation & SubID Mapping ---');
  const generated = otherPeerRes;
  assert(generated.trackingUrl !== undefined, 'Tracking URL generated');
  assert(generated.trackingUrl?.includes('sub1=tg_userbot'), 'sub1 parameter set to tg_userbot');
  assert(generated.trackingUrl?.includes(`sub2=${peer2}`), 'sub2 parameter contains peerId');
  assert(generated.trackingUrl?.includes(`cid=${generated.clickId}`), 'cid parameter contains clickId');
  assert(!generated.trackingUrl?.includes('//rp1pd38/'), 'URL has no double slashes');

  // Verify SQLite attribution record
  const attribution = leadRepo.resolveClickAttribution(generated.clickId!);
  assert(attribution !== null, 'Click attribution bridge recorded in SQLite');
  assert(attribution?.chat_id === peer2, 'Attribution resolves to peerId in SQLite');
  assert(attribution?.offer_id === 'lospollos_dating', 'Attribution resolves to lospollos_dating');

  // --- [TEST 5] Conversational Native Response Delivery ---
  console.log('\n--- [TEST 5] Conversational Native Response Delivery ---');
  assert(typeof generated.responseText === 'string', 'Generated conversational response');
  assert(generated.responseText!.includes(generated.trackingUrl!), 'Response text embeds tracking URL');
  assert(generated.responseText!.startsWith('Hey!') || generated.responseText!.startsWith('Here you go!') || generated.responseText!.startsWith('Hi!'), 'Response uses conversational tone');

  // --- [TEST 6] Emergency Stop Integration ---
  console.log('\n--- [TEST 6] Emergency Stop Integration ---');
  const eStop = EmergencyStopController.getInstance();
  eStop.trigger('Userbot test e-stop', 'TEST_SUITE');

  const stoppedRes = await userbot.evaluateMessage({
    peerId: '999111',
    text: 'dating query during emergency stop',
  });
  assert(stoppedRes.ignored === true && stoppedRes.reason === 'EMERGENCY_STOP', 'E-Stop halts userbot message evaluation');

  eStop.clear('Userbot test cleared');
  assert(eStop.isHalted() === false, 'E-Stop successfully cleared');

  // --- [TEST 7] Admin Telemetry Payload Verification ---
  console.log('\n--- [TEST 7] Admin Telemetry Payload Verification ---');
  let notified = false;
  try {
    notified = await userbot.notifyAdmin({
      peerId: '555777',
      username: 'match_seeker',
      text: 'Looking for a dating match in NYC',
      trigger: 'dating',
    });
  } catch {}
  assert(notified === true, 'Admin telemetry notification payload dispatched');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 TELEGRAM USERBOT SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTelegramUserbotTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
