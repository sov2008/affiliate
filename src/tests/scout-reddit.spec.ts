import fs from 'fs';
import path from 'path';
import { ScoutRedditWorker, RedditPost } from '../../core/src/workers/scout-reddit.worker.js';
import { TelegramControlBot } from '../../core/src/services/telegram-control-bot.service.js';
import { CoreScheduler } from '../../core/src/scheduler.js';

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

async function runScoutRedditTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Scout Reddit Watcher & HITL Alert Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_scout_reddit_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  const testSeenPath = path.join(testDir, 'test_seen_posts.json');

  TelegramControlBot.resetInstance();
  TelegramControlBot.getInstance({
    botToken: 'TEST_BOT_TOKEN_SCOUT',
    defaultChatId: '999888777',
    adminChatId: '999888777',
  });

  ScoutRedditWorker.resetInstance();
  const worker = ScoutRedditWorker.getInstance({
    subreddits: ['dating', 'Tinder'],
    keywords: ['tinder', 'bumble', 'algorithm', 'ghosting', 'paywall', 'boost', 'apps'],
    maxAgeHours: 4,
    seenStoragePath: testSeenPath,
  });

  // --- [TEST 1] Post Filtering Logic ---
  console.log('--- [TEST 1] Post Filtering Logic ---');
  const nowSec = Math.floor(Date.now() / 1000);

  const matchingPost: RedditPost = {
    id: 'post_hit_1',
    subreddit: 'dating',
    title: 'Why is the Tinder algorithm so brutal with ghosting lately?',
    selftext: 'I feel like unless you pay for a gold subscription or paywall boost, your profile is hidden.',
    author: 'dating_user_99',
    permalink: '/r/dating/comments/post_hit_1/why_is_the_tinder_algorithm_so_brutal/',
    url: 'https://www.reddit.com/r/dating/comments/post_hit_1/why_is_the_tinder_algorithm_so_brutal/',
    created_utc: nowSec - 1800, // 30 mins ago (< 4h)
  };

  const oldPost: RedditPost = {
    ...matchingPost,
    id: 'post_old_2',
    created_utc: nowSec - 5 * 3600, // 5 hours ago (> 4h)
  };

  const irrelevantPost: RedditPost = {
    id: 'post_irrelevant_3',
    subreddit: 'dating',
    title: 'Took a walk in the park today',
    selftext: 'The weather was really nice and peaceful.',
    author: 'nature_lover',
    permalink: '/r/dating/comments/post_irrelevant_3/walk_in_the_park/',
    url: 'https://www.reddit.com/r/dating/comments/post_irrelevant_3/walk_in_the_park/',
    created_utc: nowSec - 1200,
  };

  assert(worker.filterPost(matchingPost) === true, 'Matching recent post with keywords passes filter');
  assert(worker.filterPost(oldPost) === false, 'Old post (> 4 hours) is rejected');
  assert(worker.filterPost(irrelevantPost) === false, 'Irrelevant post without target keywords is rejected');

  // --- [TEST 2] Seen Posts Deduplication ---
  console.log('\n--- [TEST 2] Seen Posts Deduplication ---');
  assert(worker.isPostSeen('post_hit_1') === false, 'Post is initially not seen');
  worker.markPostSeen('post_hit_1');
  assert(worker.isPostSeen('post_hit_1') === true, 'Post marked as seen');
  assert(worker.filterPost(matchingPost) === false, 'Seen post is rejected from re-processing');

  // Verify persistence on disk
  assert(fs.existsSync(testSeenPath), 'Seen posts storage file persisted to disk');
  const diskSeen = JSON.parse(fs.readFileSync(testSeenPath, 'utf8'));
  assert(diskSeen.includes('post_hit_1'), 'Post ID saved in disk storage');

  // --- [TEST 3] Native Copy Generation (Zero URLs + Bio Bridge) ---
  console.log('\n--- [TEST 3] Native Copy Generation ---');
  const copy = await worker.generateNativeResponse(matchingPost);
  assert(typeof copy === 'string' && copy.length > 50, 'Generated copy has substantial length');
  assert(!copy.includes('http://') && !copy.includes('https://'), 'Zero URLs compliance: Copy contains NO external links');
  assert(
    copy.toLowerCase().includes('bio') || copy.toLowerCase().includes('profile'),
    'Copy includes native profile bio bridge cue'
  );

  // --- [TEST 4] Admin Alert Formatting & Dispatch ---
  console.log('\n--- [TEST 4] Admin Alert Formatting & Dispatch ---');
  const alertSent = await worker.sendAdminAlert(matchingPost, copy);
  assert(alertSent === true, 'Telegram HITL alert successfully dispatched to Admin Chat');

  // --- [TEST 5] Core Scheduler Setup & Intervals ---
  console.log('\n--- [TEST 5] Core Scheduler Setup & Intervals ---');
  CoreScheduler.resetInstance();
  const scheduler = CoreScheduler.getInstance({ redditIntervalMs: 15 * 60 * 1000 });
  const status = scheduler.getStatus();
  assert(status.intervalMinutes === 15, 'Scheduler configured with 15-minute interval');
  assert(status.isRunning === false, 'Scheduler initially idle');

  // Cleanup sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 SCOUT REDDIT SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runScoutRedditTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
