import fs from 'fs';
import path from 'path';
import { ScoutQuoraWorker, QuoraQuestion } from '../../core/src/workers/scout-quora.worker.js';
import { TelegramControlBot } from '../../core/src/services/telegram-control-bot.service.js';
import { KnowledgeService } from '../../core/src/services/knowledge.service.js';

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

async function runScoutQuoraTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Quora Question Scout & Structured Answer Generator (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_scout_quora_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  const testSeenPath = path.join(testDir, 'test_seen_quora_questions.json');

  TelegramControlBot.resetInstance();
  TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_QUORA',
    defaultChatId: '999888777',
    adminChatId: '999888777',
  });

  ScoutQuoraWorker.resetInstance();
  const worker = ScoutQuoraWorker.getInstance({
    keywords: ['tinder scam', 'dating app alternatives'],
    seenStoragePath: testSeenPath,
  });

  // --- [TEST 1] Keyword Resolution & Question Fetching ---
  console.log('--- [TEST 1] Keyword Resolution & Question Fetching ---');
  const questionsTinder = await worker.fetchQuestionsForKeyword('tinder scam');
  assert(questionsTinder.length >= 2, 'Fetched >= 2 questions for "tinder scam"');
  assert(questionsTinder[0].url.includes('quora.com'), 'Question URL belongs to quora.com');
  assert(questionsTinder[0].title.toLowerCase().includes('tinder'), 'Question title matches keyword');

  const questionsAlt = await worker.fetchQuestionsForKeyword('dating app alternatives');
  assert(questionsAlt.length >= 2, 'Fetched >= 2 questions for "dating app alternatives"');

  // --- [TEST 2] Seen Deduplication ---
  console.log('\n--- [TEST 2] Seen Deduplication ---');
  const qTest: QuoraQuestion = questionsTinder[0];
  assert(worker.isQuestionSeen(qTest.id) === false, 'Question is initially not seen');
  worker.markQuestionSeen(qTest.id);
  assert(worker.isQuestionSeen(qTest.id) === true, 'Question is marked as seen');
  assert(fs.existsSync(testSeenPath), 'Seen questions file exists on disk');
  const diskData = JSON.parse(fs.readFileSync(testSeenPath, 'utf8'));
  assert(diskData.includes(qTest.id), 'Question ID persisted to disk storage');

  // --- [TEST 3] Structured Answer Generation & Validation ---
  console.log('\n--- [TEST 3] Structured Answer Generation & Validation ---');
  const answer = await worker.generateStructuredAnswer(qTest);
  assert(typeof answer === 'string' && answer.length > 200, 'Answer generated with substantial body');
  assert(!answer.includes('http://') && !answer.includes('https://'), 'Zero-URL Rule: Answer contains 0 external URLs');
  assert(answer.includes('•') || answer.includes('-'), 'Answer contains structured comparison bullet points');
  assert(
    answer.toLowerCase().includes('bio') || answer.toLowerCase().includes('author'),
    'Answer includes native Quora author bio bridge'
  );

  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  assert(wordCount >= 120 && wordCount <= 240, `Word count within 120-240 range (Actual: ${wordCount} words)`);

  const guardCheck = KnowledgeService.getInstance().validateCopyAgainstGuard(answer, 'quora');
  assert(guardCheck.isValid === true, 'Answer passes KnowledgeService Lexicon Guard for Quora');

  console.log('\n📝 Sample Generated Quora Answer:');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(answer);
  console.log('────────────────────────────────────────────────────────────────\n');

  // --- [TEST 4] Admin HITL Notification ---
  console.log('--- [TEST 4] Admin HITL Notification ---');
  const alertSent = await worker.sendAdminAlert(qTest, answer);
  assert(alertSent === true, 'Telegram HITL alert successfully dispatched to Admin Chat');

  // --- [TEST 5] Full Scout Cycle Execution ---
  console.log('\n--- [TEST 5] Full Scout Cycle Execution ---');
  const cycleResult = await worker.runCycle();
  assert(cycleResult.scanned >= 4, 'Cycle scanned multiple keyword queries');
  // Since qTest was already marked seen, matched count is less than scanned
  assert(cycleResult.matched >= 1, 'Cycle found unseen questions to process');
  assert(cycleResult.alerted >= 1, 'Cycle dispatched alerts for newly discovered questions');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 SCOUT QUORA SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runScoutQuoraTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
