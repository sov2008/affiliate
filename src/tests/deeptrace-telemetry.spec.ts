import assert from 'node:assert';
import {
  TELEMETRY_CAMPAIGN_ID,
  CLOUDFLARE_TELEMETRY_ENDPOINT,
  CLOUDFLARE_CLICK_ENDPOINT,
  formatTelemetryPayload,
  buildMonetizationClickUrl,
  getOrCreateClickId,
  trackEvent,
  trackScanStarted,
  trackScanCompleted,
  trackScanFailed,
  trackChallengeCopied,
  trackShareClicked,
  trackMonetizationClicked
} from '../services/telemetry';

console.log('🧪 [Test Suite] FlirtCheck DeepTrace™ Telemetry & Postback Engine');

async function runTests() {
  // Test 1: Constant validation
  console.log('\n--- 1. Testing Endpoints & Campaign Constants ---');
  assert.strictEqual(TELEMETRY_CAMPAIGN_ID, 'deeptrace_forensics', 'Campaign ID must match deeptrace_forensics');
  assert.strictEqual(CLOUDFLARE_TELEMETRY_ENDPOINT, 'https://postback-engine.sov7.workers.dev/telemetry');
  assert.strictEqual(CLOUDFLARE_CLICK_ENDPOINT, 'https://postback-engine.sov7.workers.dev/click');
  console.log('✅ Endpoints verified');

  // Test 2: Payload Formatting
  console.log('\n--- 2. Testing Payload Formatting & ISO Timestamps ---');
  const payload = formatTelemetryPayload('deeptrace_scan_completed', {
    case_ref: 'DT-2026-TEST42',
    platform: 'TINDER',
    risk_level: 'CRITICAL',
    trust_score: 18,
    latency_ms: 1250
  });

  assert.strictEqual(payload.campaign_id, 'deeptrace_forensics', 'Default campaign_id applied');
  assert.strictEqual(payload.event, 'deeptrace_scan_completed', 'Event name matches');
  assert.strictEqual(payload.case_ref, 'DT-2026-TEST42', 'Case ref preserved');
  assert.strictEqual(payload.platform, 'TINDER', 'Platform preserved');
  assert.strictEqual(payload.risk_level, 'CRITICAL', 'Risk level preserved');
  assert.strictEqual(payload.trust_score, 18, 'Trust score preserved');
  assert.strictEqual(payload.latency_ms, 1250, 'Latency preserved');
  assert(payload.timestamp && !isNaN(Date.parse(payload.timestamp)), 'Timestamp must be valid ISO string');
  console.log('✅ Payload formatting matches schema');

  // Test 3: Monetization Smartlink Click URL Builder
  console.log('\n--- 3. Testing Cloudflare Click URL Builder ---');
  const testClickId = 'fc_test_click_12345';
  const clickUrl = buildMonetizationClickUrl({
    clickId: testClickId,
    riskLevel: 'HIGH',
    platform: 'WHATSAPP',
    source: 'deeptrace'
  });

  const parsedUrl = new URL(clickUrl);
  assert.strictEqual(parsedUrl.origin, 'https://postback-engine.sov7.workers.dev');
  assert.strictEqual(parsedUrl.pathname, '/click');
  assert.strictEqual(parsedUrl.searchParams.get('click_id'), testClickId);
  assert.strictEqual(parsedUrl.searchParams.get('sub1'), 'deeptrace');
  assert.strictEqual(parsedUrl.searchParams.get('sub2'), 'HIGH');
  assert.strictEqual(parsedUrl.searchParams.get('sub3'), 'WHATSAPP');
  console.log('✅ Click URL generated correctly with all sub parameters:', clickUrl);

  // Test 4: SSR / Graceful Degraded Offline Handling
  console.log('\n--- 4. Testing SSR & Offline Execution without Window Globals ---');
  const serverClickId = getOrCreateClickId();
  assert(serverClickId.startsWith('fc_'), 'Server click id generates valid prefix');

  const ssrResult = await trackEvent('deeptrace_scan_started', {
    platform: 'TELEGRAM',
    location: 'Berlin'
  });
  assert.strictEqual(ssrResult.event, 'deeptrace_scan_started');
  assert.strictEqual(ssrResult.platform, 'TELEGRAM');
  assert.strictEqual(ssrResult.location, 'Berlin');
  console.log('✅ SSR trackEvent executes safely without throwing');

  // Test 5: Simulated Browser Dispatch (Umami + Cloudflare)
  console.log('\n--- 5. Testing Simulated Browser Tracking (Umami + Beacon) ---');
  let umamiTrackedEvent: string | null = null;
  let umamiTrackedData: any = null;
  let beaconCalled = false;
  let beaconEndpoint = '';

  const mockWindow: any = {
    location: {
      search: '?cid=fc_simulated_url_cid_99'
    },
    sessionStorage: {
      data: {} as Record<string, string>,
      getItem(k: string) { return this.data[k] || null; },
      setItem(k: string, v: string) { this.data[k] = v; }
    },
    umami: {
      track: (name: string, data?: any) => {
        umamiTrackedEvent = name;
        umamiTrackedData = data;
      }
    }
  };

  const mockNavigator: any = {
    sendBeacon: (url: string, data: any) => {
      beaconCalled = true;
      beaconEndpoint = url;
      return true;
    }
  };

  const originalNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'window', {
    value: mockWindow,
    configurable: true,
    writable: true
  });
  Object.defineProperty(globalThis, 'navigator', {
    value: mockNavigator,
    configurable: true,
    writable: true
  });

  // Verify getOrCreateClickId uses URL param if available
  const browserClickId = getOrCreateClickId();
  assert.strictEqual(browserClickId, 'fc_simulated_url_cid_99', 'Retrieved click_id from simulated search params');

  // Test high-level helpers
  await trackScanStarted({ platform: 'INSTAGRAM', location: 'London' });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_scan_started');
  assert.strictEqual(umamiTrackedData.platform, 'INSTAGRAM');
  assert.strictEqual(beaconCalled, true);
  assert.strictEqual(beaconEndpoint, CLOUDFLARE_TELEMETRY_ENDPOINT);

  await trackScanCompleted({
    caseRef: 'DT-2026-COMPLETE',
    riskLevel: 'LOW',
    trustScore: 88,
    latencyMs: 950
  });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_scan_completed');
  assert.strictEqual(umamiTrackedData.trust_score, 88);

  await trackScanFailed({
    errorCode: 'TIMEOUT',
    errorMessage: 'Model inference exceeded threshold',
    platform: 'TELEGRAM'
  });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_scan_failed');
  assert.strictEqual(umamiTrackedData.error_code, 'TIMEOUT');

  await trackChallengeCopied({
    challengeType: 'GEO_LOCAL_ANCHOR',
    priority: 'URGENT',
    questionId: '550e8400-e29b-41d4-a716-446655440000',
    caseRef: 'DT-2026-COMPLETE'
  });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_challenge_copied');
  assert.strictEqual(umamiTrackedData.challenge_type, 'GEO_LOCAL_ANCHOR');

  await trackShareClicked({
    shareType: 'clipboard_link',
    caseRef: 'DT-2026-COMPLETE',
    riskLevel: 'LOW',
    trustScore: 88
  });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_share_clicked');
  assert.strictEqual(umamiTrackedData.share_type, 'clipboard_link');

  await trackMonetizationClicked({
    destination: 'partner_smartlink',
    riskLevel: 'HIGH',
    platform: 'TINDER',
    caseRef: 'DT-2026-COMPLETE'
  });
  assert.strictEqual(umamiTrackedEvent, 'deeptrace_monetization_clicked');
  assert.strictEqual(umamiTrackedData.click_id, 'fc_simulated_url_cid_99');

  // Cleanup globals
  delete (globalThis as any).window;
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
  }

  console.log('✅ Browser dispatch and all 6 convenience helpers successfully validated');
  console.log('\n🎉 ALL 5 TEST SUITES PASSED (0 ERRORS)\n');
}

runTests().catch((err) => {
  console.error('❌ Telemetry spec failed:', err);
  process.exit(1);
});
