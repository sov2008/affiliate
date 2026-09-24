import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { RateLimiterService } from '../services/rateLimiter';

console.log('🧪 [Test Suite] FlirtCheck DeepTrace™ Sliding Window Rate Limiter & Abuse Guard');

// Isolated test SQLite DB
const testDbDir = path.resolve(process.cwd(), 'scratch/tests');
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}
const testDbPath = path.join(testDbDir, `test_ratelimit_${Date.now()}.sqlite`);

async function runRateLimiterTests() {
  console.log(`\n--- 1. Initializing RateLimiterService with DB: ${testDbPath} ---`);
  const rateLimiter = new RateLimiterService(testDbPath, 3, 86400); // 3 scans per 24 hours
  console.log('✅ SQLite Schema initialized for rate limits');

  const testIp1 = '203.0.113.19';
  const testIp2 = '198.51.100.42';

  // Test 1: Initial Quota
  console.log('\n--- 2. Checking Initial Quota for New IP ---');
  const initialStatus = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(initialStatus.allowed, true, 'Initial request must be allowed');
  assert.strictEqual(initialStatus.remaining, 3, 'Initial remaining quota must be 3');
  assert.strictEqual(initialStatus.currentUsage, 0, 'Initial usage must be 0');
  console.log('✅ Initial status verified: allowed=true, remaining=3/3');

  // Test 2: Sequential Usage (1, 2, 3 scans)
  console.log('\n--- 3. Simulating 3 Sequential Analyses from Target IP ---');
  
  // Scan 1
  rateLimiter.recordUsage(testIp1);
  const statusAfter1 = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(statusAfter1.allowed, true, 'Scan 1 must be allowed');
  assert.strictEqual(statusAfter1.remaining, 2, 'Remaining quota after scan 1 must be 2');
  assert.strictEqual(statusAfter1.currentUsage, 1, 'Current usage must be 1');
  console.log('   Scan 1 recorded: remaining=2/3');

  // Scan 2
  rateLimiter.recordUsage(testIp1);
  const statusAfter2 = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(statusAfter2.allowed, true, 'Scan 2 must be allowed');
  assert.strictEqual(statusAfter2.remaining, 1, 'Remaining quota after scan 2 must be 1');
  assert.strictEqual(statusAfter2.currentUsage, 2, 'Current usage must be 2');
  console.log('   Scan 2 recorded: remaining=1/3');

  // Scan 3
  rateLimiter.recordUsage(testIp1);
  const statusAfter3 = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(statusAfter3.allowed, false, 'Quota exhausted: 4th scan must be rejected');
  assert.strictEqual(statusAfter3.remaining, 0, 'Remaining quota must be 0');
  assert.strictEqual(statusAfter3.currentUsage, 3, 'Current usage must be 3');
  assert(statusAfter3.resetInSeconds > 0, 'resetInSeconds must be positive');
  assert(statusAfter3.resetInSeconds <= 86400, 'resetInSeconds must be <= 24 hours');
  console.log(`   Scan 3 recorded: quota exhausted (remaining=0/3, resetInSeconds=${statusAfter3.resetInSeconds}s)`);

  // Test 3: 4th Scan Rejection Guard
  console.log('\n--- 4. Enforcing HTTP 429 Pre-Flight Rejection on 4th Attempt ---');
  const rejectedStatus = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(rejectedStatus.allowed, false, '4th attempt must be rejected immediately');
  assert.strictEqual(rejectedStatus.remaining, 0);
  console.log('✅ Rejection guard successfully blocked 4th scan attempt');

  // Test 4: Independent IP Quota Isolation
  console.log('\n--- 5. Verifying Independent IP Quota Isolation ---');
  const ip2Status = rateLimiter.checkLimit(testIp2);
  assert.strictEqual(ip2Status.allowed, true, 'Independent IP must have full quota');
  assert.strictEqual(ip2Status.remaining, 3, 'Independent IP remaining must be 3');
  assert.strictEqual(ip2Status.currentUsage, 0, 'Independent IP usage must be 0');
  console.log('✅ Independent IP retains full 3/3 quota without cross-contamination');

  // Test 5: Sliding Window Housekeeping & Expired Window Purge
  console.log('\n--- 6. Testing Sliding Window Purge of Expired Windows ---');
  const now = Math.floor(Date.now() / 1000);
  const expiredTime = now - 100000; // Older than 86,400s
  const oldIp = '192.0.2.1';

  rateLimiter.recordUsage(oldIp, expiredTime);
  const cleanedCount = rateLimiter.cleanExpiredWindows();
  assert(cleanedCount >= 1, 'Cleaned count must purge at least 1 expired record');

  // Verify that testIp1 records are still intact (they are fresh)
  const ip1StatusAfterCleanup = rateLimiter.checkLimit(testIp1);
  assert.strictEqual(ip1StatusAfterCleanup.currentUsage, 3, 'Active IP usage records preserved after cleanup');
  console.log(`✅ Housekeeping purged ${cleanedCount} expired window while preserving active sessions`);

  rateLimiter.close();

  // Cleanup test DB file
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
  } catch {}

  console.log('\n🎉 ALL RATE LIMITING & GPU ABUSE GUARD TESTS PASSED (0 ERRORS)\n');
}

runRateLimiterTests().catch((err) => {
  console.error('❌ Rate limiter test failed:', err);
  process.exit(1);
});
