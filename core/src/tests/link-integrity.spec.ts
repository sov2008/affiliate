import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { LinkIntegrityService } from '../services/link-integrity.service.js';
import { EmergencyStopController, EmergencyStopError } from '../types/pipeline.js';

async function runLinkIntegrityTests() {
  console.log('🧪 ====================================================');
  console.log('🧪 Automated Link, Macro & Circuit Breaker Audit Suite');
  console.log('🧪 ====================================================\n');

  const service = LinkIntegrityService.getInstance();

  // Test 1: validatePostTrackingUrl with compliant URL
  console.log('--- Test 1: Validate Compliant Post Tracking URL ---');
  const validPostUrl = 'https://postback-engine.sov7.workers.dev/click?campaign_id=cmp_trading_au&click_id={click_id}';
  const postResult = service.validatePostTrackingUrl(validPostUrl, 'cmp_trading_au');
  assert.strictEqual(postResult.isValid, true, 'Compliant tracking URL must be valid');
  assert.strictEqual(postResult.hasClickIdMacro, true, 'Must detect click_id macro');
  assert.strictEqual(postResult.hasCampaignAttribution, true, 'Must detect campaign attribution');
  console.log('✅ Test 1 Passed!\n');

  // Test 2: validatePostTrackingUrl with broken URL
  console.log('--- Test 2: Reject Malformed / Incomplete Tracking URL ---');
  const brokenPostUrl = 'https://some-random-domain.com/landing?foo=bar';
  const brokenResult = service.validatePostTrackingUrl(brokenPostUrl, 'cmp_trading_au');
  assert.strictEqual(brokenResult.isValid, false, 'Incomplete URL must be invalid');
  assert.strictEqual(brokenResult.missingMacros.length > 0, true, 'Must report missing macros');
  console.log('✅ Test 2 Passed!\n');

  // Test 3: validateLandingPageLinks for live campaigns
  console.log('--- Test 3: Validate Live Landing Page Links, Compliance & Macros ---');
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
    console.log(`   [${c.id}/${c.variant}] Checked: ${report.checkedCount} links, Valid: ${report.isValid}, rel: ${report.hasNofollowSponsored}, target: ${report.hasTargetBlank}, cyrillic: ${report.hasCyrillicChars}`);
    assert.strictEqual(report.isValid, true, `Campaign ${c.id}/${c.variant} must pass link integrity audit`);
    assert.strictEqual(report.hasUmamiTracking, true, `Campaign ${c.id}/${c.variant} must have Umami telemetry`);
    assert.strictEqual(report.hasNofollowSponsored, true, `Campaign ${c.id}/${c.variant} must have rel="nofollow sponsored"`);
    assert.strictEqual(report.hasTargetBlank, true, `Campaign ${c.id}/${c.variant} must have target="_blank"`);
    assert.strictEqual(report.hasCyrillicChars, false, `Campaign ${c.id}/${c.variant} must NOT contain Cyrillic characters`);
  }
  console.log('✅ Test 3 Passed!\n');

  // Test 4: validateBlogPages distribution compliance
  console.log('--- Test 4: Validate Blog Distribution (Zero Cyrillic & Compliance) ---');
  const blogReport = service.validateBlogPages();
  console.log(`   Blog audit: Scanned ${blogReport.scannedFiles} HTML pages, Valid: ${blogReport.isValid}`);
  console.log('   Cyrillic violations:', blogReport.cyrillicViolations);
  console.log('   Missing compliance links:', blogReport.missingComplianceLinks.slice(0, 5));
  if (blogReport.scannedFiles > 0) {
    assert.strictEqual(blogReport.cyrillicViolations.length, 0, 'No Cyrillic violations allowed in blog/dist');
    assert.strictEqual(blogReport.isValid, true, 'Blog distribution must be compliant');
  } else {
    console.log('   (blog/dist not found or empty, skipping file contents check)');
  }
  console.log('✅ Test 4 Passed!\n');

  // Test 5: validateCpaUrl with endpoint reachability
  console.log('--- Test 5: Validate CPA Endpoint Reachability & SSL ---');
  const cpaResult = await service.validateCpaUrl('https://1.1.1.1', 2);
  assert.strictEqual(cpaResult.isValid, true, 'Valid HTTPS URL must resolve');
  console.log('✅ Test 5 Passed!\n');

  // Test 6: Circuit Breaker (.antigravity/halt.flag)
  console.log('--- Test 6: Circuit Breaker Emergency Halt Flag Trigger ---');
  const stopController = EmergencyStopController.getInstance();

  // Reset first to ensure clean state
  stopController.reset();
  assert.strictEqual(stopController.isHalted(), false, 'Pipeline must be operational initially');

  // Trigger emergency halt flag
  stopController.trigger('Automated Link Integrity Test Alert');
  assert.strictEqual(stopController.isHalted(), true, 'Emergency stop must be halted after trigger()');

  // Verify check() throws EmergencyStopError
  let caughtError: any = null;
  try {
    stopController.check();
  } catch (err) {
    caughtError = err;
  }
  assert.ok(caughtError instanceof EmergencyStopError, 'check() must throw EmergencyStopError when halted');

  // Reset and verify recovery
  stopController.reset();
  assert.strictEqual(stopController.isHalted(), false, 'Pipeline must recover after reset()');

  // Test external file detection (.antigravity/halt.flag)
  const haltDir = path.resolve(process.cwd(), '.antigravity');
  const haltFile = path.join(haltDir, 'halt.flag');
  if (!fs.existsSync(haltDir)) {
    fs.mkdirSync(haltDir, { recursive: true });
  }
  fs.writeFileSync(haltFile, 'EXTERNAL TEST TRIP', 'utf8');

  // Controller must detect halt file from disk
  assert.strictEqual(stopController.isHalted(), true, 'Controller must detect .antigravity/halt.flag written by SRE/external tool');

  // Cleanup test halt file
  if (fs.existsSync(haltFile)) {
    fs.unlinkSync(haltFile);
  }
  stopController.reset();
  assert.strictEqual(stopController.isHalted(), false, 'Pipeline must be clean after test file removal');
  console.log('✅ Test 6 (Circuit Breaker) Passed!\n');

  console.log('====================================================');
  console.log('🎉 All 6 Link Integrity, Blog & Circuit Breaker Tests PASSED (100%)');
  console.log('====================================================');
}

runLinkIntegrityTests().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
