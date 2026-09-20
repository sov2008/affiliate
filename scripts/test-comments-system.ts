import { AutoModerationService } from '../core/src/services/automod.service.js';
import { CommentsRepository } from '../core/src/db/comments.repository.js';

async function runTests() {
  console.log('🧪 RUNNING COMMENTS & AUTOMOD INTEGRATION TEST SUITE\n');

  const automod = AutoModerationService.getInstance();
  const repo = CommentsRepository.getInstance();

  // Test 1: Clean Valid Submission
  const validTest = automod.evaluate({
    callsign: 'Observer_Alpha',
    incidentType: 'Profile Duplication',
    evidenceText: 'Observed identical photo set used on two different accounts across Cheltenham and London within 2 hours.',
    ip: '192.168.1.100',
  });
  console.log(`Test 1 [Clean Text]: Expected VERIFIED -> Actual: ${validTest.status}, Score: ${validTest.riskScore}`);
  if (validTest.status !== 'VERIFIED') throw new Error('Test 1 failed');

  // Test 2: External Link Spam
  const linkSpamTest = automod.evaluate({
    callsign: 'SpamBot',
    incidentType: 'Other',
    evidenceText: 'Check out my hot pictures at https://t.me/invest_crypto now for big profits!',
    ip: '192.168.1.101',
  });
  console.log(`Test 2 [External Link Spam]: Expected REJECTED -> Actual: ${linkSpamTest.status}, Score: ${linkSpamTest.riskScore}, Flags: ${linkSpamTest.flags.join(', ')}`);
  if (linkSpamTest.status !== 'REJECTED') throw new Error('Test 2 failed');

  // Test 3: Honeypot Trap
  const honeypotTest = automod.evaluate({
    callsign: 'Robot_User',
    incidentType: 'Scripted Telemetry',
    evidenceText: 'This is a genuine sounding message with enough length to pass length check.',
    honeypot: 'bot_filled_token_123',
    ip: '192.168.1.102',
  });
  console.log(`Test 3 [Honeypot Trap]: Expected REJECTED -> Actual: ${honeypotTest.status}, Score: ${honeypotTest.riskScore}, Flags: ${honeypotTest.flags.join(', ')}`);
  if (honeypotTest.status !== 'REJECTED') throw new Error('Test 3 failed');

  // Test 4: Too Short
  const shortTest = automod.evaluate({
    callsign: 'Obs',
    incidentType: 'Other',
    evidenceText: 'Short text',
    ip: '192.168.1.103',
  });
  console.log(`Test 4 [Short Text]: Status: ${shortTest.status}, Score: ${shortTest.riskScore}, Flags: ${shortTest.flags.join(', ')}`);
  if (shortTest.status === 'VERIFIED') throw new Error('Test 4 failed (should not be verified)');

  // Test 5: Repository insertion & retrieval
  const testSlug = 'test-slug-' + Date.now();
  const inserted = repo.insertSubmission({
    post_slug: testSlug,
    author_callsign: 'Observer_9999',
    incident_type: 'WhatsApp Move Attempt',
    evidence_text: 'The suspect requested moving to an off-platform encrypted line within 10 minutes of initial match.',
    status: 'VERIFIED',
    risk_score: 0,
    moderation_flags: 'CLEAN',
    ip_hash: 'hash_test_ip',
  });
  console.log(`\nTest 5 [DB Insert]: ID = ${inserted.id}, Created = ${inserted.created_at}`);

  const fetched = repo.getVerifiedBySlug(testSlug);
  console.log(`Test 5 [DB Query]: Found ${fetched.length} verified submissions for slug ${testSlug}`);
  if (fetched.length !== 1 || fetched[0].id !== inserted.id) {
    throw new Error('Test 5 DB query failed');
  }

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED!');
}

runTests().catch((e) => {
  console.error('❌ Test suite failed:', e);
  process.exit(1);
});
