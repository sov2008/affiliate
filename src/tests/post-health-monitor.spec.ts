import fs from 'fs';
import path from 'path';
import { PostHealthMonitor } from '../automation/post-health-monitor.js';
import { ContentQueueRepository, ContentQueueItem } from '../../core/src/db/queueRepository.js';

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

async function runPostHealthMonitorTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Post Health & Shadowban Audit Worker Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_health_' + Date.now());
  const profileHealthPath = path.join(testDir, 'profile_health.json');
  const negativePatternsPath = path.join(testDir, 'negative_patterns.json');
  fs.mkdirSync(testDir, { recursive: true });

  PostHealthMonitor.resetInstance();
  const monitor = PostHealthMonitor.getInstance({
    profileHealthPath,
    negativePatternsPath,
    auditIntervalMs: 5000,
  });

  // --- [TEST 1] Public Visibility & Status Evaluator ---
  console.log('--- [TEST 1] Public Visibility & Status Evaluator ---');
  const activeHtml = `
    <html><body>
      <div data-score="42">
        <h1>Stop relying on manual trade execution in 2026</h1>
        <p>Quantitative arbitrage with 94.8% risk-reversal</p>
      </div>
    </body></html>
  `;
  const evalActive = monitor.evaluatePublicContent(activeHtml, 200, 'Stop relying on manual trade execution');
  assert(evalActive.status === 'POST_ACTIVE', 'Identifies active post with status POST_ACTIVE');
  assert(evalActive.upvotes === 42, 'Correctly extracts upvote count (42)');

  const removedHtml = `
    <html><body>
      <p>[removed]</p>
      <span>This post has been removed by the moderators of r/investing.</span>
    </body></html>
  `;
  const evalRemoved = monitor.evaluatePublicContent(removedHtml, 200, 'Stop relying on manual trade execution');
  assert(evalRemoved.status === 'SHADOWBANNED_OR_REMOVED', 'Identifies removed/shadowbanned post');

  const lockedHtml = `
    <html><body>
      <h1>Some discussion</h1>
      <div class="lock-banner">This submission is locked. You cannot comment on this post.</div>
    </body></html>
  `;
  const evalLocked = monitor.evaluatePublicContent(lockedHtml, 200, 'Some discussion');
  assert(evalLocked.status === 'THREAD_LOCKED', 'Identifies thread locked post');

  const notFoundEval = monitor.evaluatePublicContent('', 404);
  assert(notFoundEval.status === 'SHADOWBANNED_OR_REMOVED', 'HTTP 404 treated as SHADOWBANNED_OR_REMOVED');

  // --- [TEST 2] Negative Pattern Recording on Removal ---
  console.log('\n--- [TEST 2] Negative Pattern Recording on Removal ---');
  const dummyRemovedItem: ContentQueueItem = {
    id: 'item_rem_01',
    campaign_id: 'cmp_trading_de',
    network: 'mylead',
    target_platform: 'reddit',
    hook: 'Guaranteed instant free profit with automated bot',
    body: 'Trade with 100% guarantee no risk',
    stealth_cta: 'Claim access',
    tracking_url: 'https://trk.com/click',
    image_path: '',
    risk_score: 8,
    status: 'DISPATCHED',
    published_url: 'https://reddit.com/r/investing/comments/removed_01',
    created_at: Date.now() - 3600000,
    updated_at: Date.now() - 3600000,
  };

  monitor.recordNegativePattern(dummyRemovedItem, 'Mod removed due to aggressive guarantee claims');
  assert(fs.existsSync(negativePatternsPath), 'negative_patterns.json file created on disk');

  const savedPatterns = JSON.parse(fs.readFileSync(negativePatternsPath, 'utf8'));
  assert(savedPatterns.length >= 1, 'Negative pattern list contains recorded entry');
  assert(savedPatterns[0].hook.includes('Guaranteed instant'), 'Recorded offending hook in negative patterns');
  assert(savedPatterns[0].bannedKeywords.length > 0, 'Extracted aggressive candidate keywords');

  // --- [TEST 3] Profile Penalty & 2 Consecutive Removals Cooldown ---
  console.log('\n--- [TEST 3] Profile Penalty & 2 Consecutive Removals Cooldown ---');
  const testProfileId = 'prof_reddit_alpha';

  // 1st removal
  const cooldown1 = await monitor.handleProfilePenalty(testProfileId, 'reddit', dummyRemovedItem);
  assert(cooldown1 === false, '1st removal does not trigger 24h cooldown immediately');
  const rec1 = monitor.getProfileRecord(testProfileId);
  assert(rec1?.consecutiveRemovals === 1, 'Consecutive removals count is 1');
  assert(rec1?.status === 'HEALTHY', 'Status is still HEALTHY after 1st penalty');

  // 2nd removal
  const cooldown2 = await monitor.handleProfilePenalty(testProfileId, 'reddit', dummyRemovedItem);
  assert(cooldown2 === true, '2nd consecutive removal triggers COOLDOWN_24H');
  const rec2 = monitor.getProfileRecord(testProfileId);
  assert(rec2?.consecutiveRemovals === 2, 'Consecutive removals count is 2');
  assert(rec2?.status === 'COOLDOWN_24H', 'Status transitioned to COOLDOWN_24H');
  assert(rec2?.cooldownUntil !== undefined && rec2.cooldownUntil > Date.now(), 'cooldownUntil timestamp is set 24h in future');

  // Verify persistence on disk
  assert(fs.existsSync(profileHealthPath), 'profile_health.json persisted to disk');

  // --- [TEST 4] Full Audit Cycle with SQLite Queue State Updates ---
  console.log('\n--- [TEST 4] Full Audit Cycle with SQLite Queue State Updates ---');
  const queueRepo = ContentQueueRepository.getInstance();

  const item1: ContentQueueItem = {
    id: 'health_test_item_1',
    campaign_id: 'cmp_trading_au',
    network: 'mylead',
    target_platform: 'reddit',
    hook: 'Trading crypto algorithm 2026',
    body: 'Body text',
    stealth_cta: 'CTA',
    tracking_url: 'https://trk.com',
    image_path: '',
    risk_score: 3,
    status: 'DISPATCHED',
    published_url: 'simulation://reddit.com/r/crypto/active_post',
    created_at: Date.now() - 2 * 3600 * 1000,
    updated_at: Date.now() - 2 * 3600 * 1000,
  };

  const item2: ContentQueueItem = {
    id: 'health_test_item_2',
    campaign_id: 'cmp_vpn_us',
    network: 'mylead',
    target_platform: 'quora',
    hook: 'Best VPN protocol 2026',
    body: 'Body text',
    stealth_cta: 'CTA',
    tracking_url: 'https://trk.com',
    image_path: '',
    risk_score: 4,
    status: 'DISPATCHED',
    published_url: 'simulation://quora.com/removed_post',
    created_at: Date.now() - 5 * 3600 * 1000,
    updated_at: Date.now() - 5 * 3600 * 1000,
  };

  queueRepo.enqueue(item1);
  queueRepo.enqueue(item2);
  queueRepo.markDispatched(item1.id, item1.published_url!);
  queueRepo.markDispatched(item2.id, item2.published_url!);

  const auditCycleSummary = await monitor.runAuditCycle({ windowHours: 72 });
  assert(auditCycleSummary.auditedCount >= 2, 'Audited at least 2 dispatched posts');
  assert(auditCycleSummary.activeCount >= 1, 'Detected active posts');
  assert(auditCycleSummary.removedCount >= 1, 'Detected removed/shadowbanned posts');

  // Verify SQLite queue item was updated
  const updatedItem1 = queueRepo.fetchById(item1.id);
  assert(updatedItem1?.health_status === 'POST_ACTIVE', 'item1 health_status updated to POST_ACTIVE');
  assert(updatedItem1?.live_upvotes !== undefined && updatedItem1.live_upvotes > 0, 'item1 live_upvotes updated');

  const updatedItem2 = queueRepo.fetchById(item2.id);
  assert(updatedItem2?.health_status === 'SHADOWBANNED_OR_REMOVED', 'item2 health_status updated to SHADOWBANNED_OR_REMOVED');

  // Cleanup test sandbox
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 POST HEALTH MONITOR SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPostHealthMonitorTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
