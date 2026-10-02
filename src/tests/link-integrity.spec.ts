import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { LinkIntegrityService } from '../services/link-integrity.service.js';
import { EmergencyStopController, EmergencyStopError } from '../../core/src/types/pipeline.js';

async function runLinkIntegrityTests() {
  console.log('🧪 ====================================================');
  console.log('🧪 Root Link & Macro Integrity Test Suite');
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
  console.log('--- Test 3: Validate Live Landing Page Links & Compliance ---');
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
    console.log(`   [${c.id}/${c.variant}] Checked: ${report.checkedCount} links, Valid: ${report.isValid}, rel: ${report.hasNofollowSponsored}, target: ${report.hasTargetBlank}`);
    assert.strictEqual(report.isValid, true, `Campaign ${c.id}/${c.variant} must pass macro audit`);
    assert.strictEqual(report.hasUmamiTracking, true, `Campaign ${c.id}/${c.variant} must have Umami telemetry`);
    assert.strictEqual(report.hasNofollowSponsored, true, `Campaign ${c.id}/${c.variant} must have rel="nofollow sponsored"`);
    assert.strictEqual(report.hasTargetBlank, true, `Campaign ${c.id}/${c.variant} must have target="_blank"`);
    assert.strictEqual(report.hasCyrillicChars, false, `Campaign ${c.id}/${c.variant} must NOT contain Cyrillic characters`);
  }
  console.log('✅ Test 3 Passed!\n');

  // Test 4: validateCpaUrl with live endpoint
  console.log('--- Test 4: Validate CPA Endpoint Reachability & SSL ---');
  const cpaResult = await service.validateCpaUrl('https://1.1.1.1', 2);
  assert.strictEqual(cpaResult.isValid, true, 'Valid HTTPS URL must resolve');
  console.log('✅ Test 4 Passed!\n');

  // Test 5: Circuit Breaker Verification
  console.log('--- Test 5: Circuit Breaker Emergency Halt Flag Trigger ---');
  const stopController = EmergencyStopController.getInstance();
  stopController.reset();
  assert.strictEqual(stopController.isHalted(), false, 'Pipeline must be operational initially');

  const haltDir = path.resolve(process.cwd(), '.antigravity');
  const haltFile = path.join(haltDir, 'halt.flag');
  if (!fs.existsSync(haltDir)) {
    fs.mkdirSync(haltDir, { recursive: true });
  }
  fs.writeFileSync(haltFile, 'ROOT AUDIT HALT TEST', 'utf8');
  assert.strictEqual(stopController.isHalted(), true, 'Controller must detect .antigravity/halt.flag');

  fs.unlinkSync(haltFile);
  stopController.reset();
  assert.strictEqual(stopController.isHalted(), false, 'Pipeline must recover cleanly');
  console.log('✅ Test 5 (Circuit Breaker) Passed!\n');

  console.log('====================================================');
  console.log('🎉 All Root Link Integrity Tests PASSED (100%)');
  console.log('====================================================');
}

runLinkIntegrityTests().catch((err) => {
  console.error('❌ Test Suite Failed:', err);
  process.exit(1);
});
