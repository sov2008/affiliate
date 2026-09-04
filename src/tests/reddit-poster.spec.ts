import fs from 'fs';
import path from 'path';
import { RedditPosterService, BIO_HOOK_TEMPLATES } from '../../core/src/services/reddit-poster.service.js';

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

async function runRedditPosterTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Reddit Guarded Poster & Anti-Ban Evasion Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_reddit_poster_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  const testStateFile = path.join(testDir, 'test_state.json');

  RedditPosterService.resetInstance();
  const poster = RedditPosterService.getInstance(testStateFile);

  // --- [TEST 1] Session Identity Validation ---
  console.log('--- [TEST 1] Session Identity Validation ---');
  const validation = await poster.validateSession();
  assert(validation.valid === true, `Session is valid (Error: ${validation.error || 'none'})`);
  assert(validation.username === 'sov2008', `Verified username is sov2008 (Actual: ${validation.username})`);
  assert(Boolean(validation.modhash), `Modhash extracted: ${validation.modhash?.slice(0, 10)}...`);

  // --- [TEST 2] Dynamic CTA & Stealth Ratio (1:3) ---
  console.log('\n--- [TEST 2] Dynamic CTA & Stealth Ratio (1:3) ---');
  poster.clearHistory();

  // Post 1: First post is eligible for Bio-Hook
  const eligible1 = poster.canPost();
  assert(eligible1.isBioHook === true, 'First post is assigned Bio-Hook');
  const rawAdvice = 'Ghosting happens because the app algorithms monetize friction. Switch to direct activity matching.';
  const sanitized1 = poster.sanitizeCopy(rawAdvice, true);
  assert(sanitized1.includes('profile bio'), 'Post 1 includes dynamic bio hook');
  const matchedTemplate = BIO_HOOK_TEMPLATES.some((t) => sanitized1.includes(t));
  assert(matchedTemplate, 'Post 1 used template from randomized BIO_HOOK_TEMPLATES pool');

  // Simulate Post 1 completion
  await poster.postComment('t3_post1', sanitized1, { skipJitter: true, simulate: true, forceBioHook: true });

  // Post 2: Next post MUST be strictly Neutral (1:3 ratio)
  poster.clearHistory();
  // Manually insert post 1 with isBioHook: true (4 hours ago to bypass pacing)
  const ONE_HOUR = 3600 * 1000;
  const h1 = [{ timestamp: Date.now() - 5 * ONE_HOUR, thingId: 't3_p1', sanitizedCopy: 'c1', isBioHook: true }];
  fs.writeFileSync(testStateFile, JSON.stringify({ history: h1, emergencyCooldownUntil: 0 }, null, 2), 'utf8');
  RedditPosterService.resetInstance();
  const posterStep2 = RedditPosterService.getInstance(testStateFile);

  const eligible2 = posterStep2.canPost();
  assert(eligible2.isBioHook === false, 'Post 2 is assigned NEUTRAL (Stealth ratio: 1/2 neutral needed)');
  const dirtyPost2 = 'Here is good advice. Documented the local routing filter logic in my profile bio.';
  const sanitized2 = posterStep2.sanitizeCopy(dirtyPost2, false);
  assert(!sanitized2.includes('profile bio'), 'Post 2 stripped bio reference for purely neutral informative tone');

  // Post 3: Second neutral post in a row
  const h2 = [
    { timestamp: Date.now() - 10 * ONE_HOUR, thingId: 't3_p1', sanitizedCopy: 'c1', isBioHook: true },
    { timestamp: Date.now() - 5 * ONE_HOUR, thingId: 't3_p2', sanitizedCopy: 'c2', isBioHook: false },
  ];
  fs.writeFileSync(testStateFile, JSON.stringify({ history: h2, emergencyCooldownUntil: 0 }, null, 2), 'utf8');
  RedditPosterService.resetInstance();
  const posterStep3 = RedditPosterService.getInstance(testStateFile);

  const eligible3 = posterStep3.canPost();
  assert(eligible3.isBioHook === false, 'Post 3 is assigned NEUTRAL (Stealth ratio: 2/2 neutral needed)');

  // Post 4: After 2 neutral posts, Bio-Hook is allowed again!
  const h3 = [
    { timestamp: Date.now() - 15 * ONE_HOUR, thingId: 't3_p1', sanitizedCopy: 'c1', isBioHook: true },
    { timestamp: Date.now() - 10 * ONE_HOUR, thingId: 't3_p2', sanitizedCopy: 'c2', isBioHook: false },
    { timestamp: Date.now() - 5 * ONE_HOUR, thingId: 't3_p3', sanitizedCopy: 'c3', isBioHook: false },
  ];
  fs.writeFileSync(testStateFile, JSON.stringify({ history: h3, emergencyCooldownUntil: 0 }, null, 2), 'utf8');
  RedditPosterService.resetInstance();
  const posterStep4 = RedditPosterService.getInstance(testStateFile);

  const eligible4 = posterStep4.canPost();
  assert(eligible4.isBioHook === true, 'Post 4 is eligible for Bio-Hook (1:3 ratio satisfied)');

  // --- [TEST 3] Subreddit Karma & Age Filtering ---
  console.log('\n--- [TEST 3] Subreddit Karma & Age Filtering ---');
  const allowedSub1 = poster.isSubredditAllowed('dating');
  assert(allowedSub1.allowed === true, 'r/dating is allowed (low restriction)');
  const allowedSub2 = poster.isSubredditAllowed('r/Tinder');
  assert(allowedSub2.allowed === true, 'r/Tinder is allowed (low restriction)');

  const restrictedSub = poster.isSubredditAllowed('news');
  assert(restrictedSub.allowed === false, 'r/news is blocked (strict karma requirement)');
  assert(restrictedSub.reason?.includes('karma requirements') === true, 'Reason identifies karma requirements');

  // --- [TEST 4] Shadowban Canary & Emergency 24h Cooldown ---
  console.log('\n--- [TEST 4] Shadowban Canary & Emergency 24h Cooldown ---');
  poster.clearHistory();

  // Trigger emergency cooldown simulating an AutoMod removal
  const emergencyUntil = Date.now() + 24 * ONE_HOUR;
  poster.setEmergencyCooldown(emergencyUntil);

  const blockedEmergency = poster.canPost();
  assert(blockedEmergency.allowed === false, 'Blocked by emergency AutoMod shadowban cooldown');
  assert(blockedEmergency.reason?.includes('Emergency AutoModerator 24h Cooldown') === true, 'Identifies AutoMod emergency reason');

  // Reset emergency cooldown
  poster.setEmergencyCooldown(0);
  const clearedEmergency = poster.canPost();
  assert(clearedEmergency.allowed === true, 'Emergency cooldown cleared: posting allowed');

  // --- [TEST 5] Operational Guardrails: Pacing & Rate Limits ---
  console.log('\n--- [TEST 5] Operational Guardrails: Pacing & Rate Limits ---');
  poster.clearHistory();

  // Test 4-hour cooldown
  await poster.postComment('t3_p_cool', 'Test reply', { skipJitter: true, simulate: true });
  const cooldownCheck = poster.canPost();
  assert(cooldownCheck.allowed === false, 'Blocked by 4-hour cooldown immediately after post');

  // Cleanup test environment
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 ANTI-BAN & EVASION SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runRedditPosterTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
