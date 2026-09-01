import assert from 'assert';
import { LinkIntegrityService } from '../services/link-integrity.service.js';

async function runLinkIntegrityTests() {
  console.log('🧪 ====================================================');
  console.log('🧪 Link & Tracking Macro Integrity Test Suite');
  console.log('🧪 ====================================================\n');

  const service = LinkIntegrityService.getInstance();

  // Test 1: validatePostTrackingUrl with compliant URL
  console.log('--- Test 1: Validate Compliant Post Tracking URL ---');
  const validPostUrl = 'https://postback-engine.sov7.workers.dev/click?campaign_id=cmp_trading_au&click_id={click_id}';
  const postResult = service.validatePostTrackingUrl(validPostUrl, 'cmp_trading_au');
  console.log('   Result:', postResult);
  assert.strictEqual(postResult.isValid, true, 'Compliant tracking URL must be valid');
  assert.strictEqual(postResult.hasClickIdMacro, true, 'Must detect click_id macro');
  assert.strictEqual(postResult.hasCampaignAttribution, true, 'Must detect campaign attribution');
  console.log('✅ Test 1 Passed!\n');

  // Test 2: validatePostTrackingUrl with broken URL
  console.log('--- Test 2: Reject Malformed / Incomplete Tracking URL ---');
  const brokenPostUrl = 'https://some-random-domain.com/landing?foo=bar';
  const brokenResult = service.validatePostTrackingUrl(brokenPostUrl, 'cmp_trading_au');
  console.log('   Result:', brokenResult);
  assert.strictEqual(brokenResult.isValid, false, 'Incomplete URL must be invalid');
  assert.strictEqual(brokenResult.missingMacros.length > 0, true, 'Must report missing macros');
  console.log('✅ Test 2 Passed!\n');

  // Test 3: validateLandingPageLinks for live campaigns
  console.log('--- Test 3: Validate Live Landing Page Links & Macros ---');
  const campaignsToTest = [
    { id: 'cmp_trading_au', variant: 'v1' },
    { id: 'cmp_trading_au', variant: 'v2' },
    { id: 'cmp_elite_de', variant: 'v1' },
    { id: 'cmp_elite_de', variant: 'v2' },
    { id: 'cmp_vpn_us', variant: 'v1' },
    { id: 'cmp_vpn_us', variant: 'v2' },
    { id: 'cmp_lospollos_dating', variant: 'v1' },
    { id: 'cmp_lospollos_dating', variant: 'v2' },
  ];

  for (const c of campaignsToTest) {
    const report = service.validateLandingPageLinks(c.id, c.variant);
    console.log(`   [${c.id}/${c.variant}] Checked: ${report.checkedCount} links, Valid: ${report.isValid}, Umami: ${report.hasUmamiTracking}`);
    assert.strictEqual(report.isValid, true, `Campaign ${c.id}/${c.variant} must pass macro audit`);
    assert.strictEqual(report.hasUmamiTracking, true, `Campaign ${c.id}/${c.variant} must have Umami telemetry`);
  }
  console.log('✅ Test 3 Passed!\n');

  // Test 4: validateCpaUrl with mock / live endpoint
  console.log('--- Test 4: Validate CPA Endpoint Reachability & SSL ---');
  const cpaResult = await service.validateCpaUrl('https://1.1.1.1', 2);
  console.log('   Status Code:', cpaResult.statusCode);
  console.log('   Latency:', cpaResult.latencyMs, 'ms');
  console.log('   Hops:', cpaResult.hops);
  assert.strictEqual(cpaResult.isValid, true, 'Valid HTTPS URL must resolve');
  console.log('✅ Test 4 Passed!\n');

  // Test 5: validateCpaUrl with invalid domain
  console.log('--- Test 5: Detect Invalid Domain / DNS Failure ---');
  const deadDnsResult = await service.validateCpaUrl('https://this-domain-definitely-does-not-exist-9999.invalid');
  console.log('   Result:', deadDnsResult);
  assert.strictEqual(deadDnsResult.isValid, false, 'Dead DNS must return invalid');
  assert.strictEqual(deadDnsResult.errors.length > 0, true, 'Must record DNS error');
  console.log('✅ Test 5 Passed!\n');

  console.log('====================================================');
  console.log('🎉 All 5 Link Integrity & Macro Tests PASSED (100%)');
  console.log('====================================================');
}

runLinkIntegrityTests().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
