import http from 'http';
import { ProxyRotator, ProxyConfig } from '../skills/proxy-rotator-skill.js';

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

async function runProxyRotatorSpec() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Proxy Rotator Geo-Matching & Live Health Probe Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  // Start local mock HTTP server and mock proxy servers for deterministic testing
  let normalServerPort = 0;
  let slowServerPort = 0;

  const normalServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', clientIp: '127.0.0.1' }));
  });

  const slowServer = http.createServer((req, res) => {
    // Delay response past 3000ms threshold
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'delayed' }));
    }, 3200);
  });

  await new Promise<void>((resolve) => {
    normalServer.listen(0, '127.0.0.1', () => {
      normalServerPort = (normalServer.address() as any).port;
      resolve();
    });
  });

  await new Promise<void>((resolve) => {
    slowServer.listen(0, '127.0.0.1', () => {
      slowServerPort = (slowServer.address() as any).port;
      resolve();
    });
  });

  // --------------------------------------------------------------------------
  // Test 1: Geo Tag Parsing & Proxy Configuration
  // --------------------------------------------------------------------------
  console.log('--- [TEST 1] Geo Tag Extraction & Parsing ---');
  const rotator = new ProxyRotator('');

  const p1 = rotator.parseProxyUrl('http://user-country-US:pass123@us-east.proxypool.net:8080');
  assert(p1 !== null && p1.geo === 'US', 'Extracted geo "US" from username format');

  const p2 = rotator.parseProxyUrl('http://admin:secret@au.residential-nodes.org:9000');
  assert(p2 !== null && p2.geo === 'AU', 'Extracted geo "AU" from subdomain format');

  const p3 = rotator.parseProxyUrl('http://node1.proxies.de:8000?country=DE');
  assert(p3 !== null && p3.geo === 'DE', 'Extracted geo "DE" from query param ?country=DE');

  const p4 = rotator.parseProxyUrl('http://192.168.1.50:3128#UK');
  assert(p4 !== null && p4.geo === 'UK', 'Extracted geo "UK" from hash tag #UK');

  const p5 = rotator.parseProxyUrl('http://general-proxy.net:8080');
  assert(p5 !== null && p5.geo === undefined, 'General proxy correctly has undefined geo');

  // --------------------------------------------------------------------------
  // Test 2: Geo-Targeted Proxy Selection
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 2] Geo-Targeted Proxy Selection (US, AU, DE, UK) ---');
  const samplePool = [
    'http://user-country-US:pass@us.proxy.io:8080',
    'http://user-country-AU:pass@au.proxy.io:8080',
    'http://user-country-DE:pass@de.proxy.io:8080',
    'http://user-country-UK:pass@uk.proxy.io:8080',
    'http://general.proxy.io:8080',
  ].join(',');

  rotator.reloadProxies(samplePool);
  assert(rotator.getProxyCount() === 5, 'Configured 5 proxies in test pool');

  const usProxy = rotator.getProxyForGeo('US');
  assert(usProxy !== undefined && usProxy.geo === 'US', 'getProxyForGeo("US") selected US node');

  const auProxy = rotator.getProxyForGeo('AU');
  assert(auProxy !== undefined && auProxy.geo === 'AU', 'getProxyForGeo("AU") selected AU node');

  const deProxy = rotator.getProxyForGeo('DE');
  assert(deProxy !== undefined && deProxy.geo === 'DE', 'getProxyForGeo("DE") selected DE node');

  const ukProxy = rotator.getProxyForGeo('UK');
  assert(ukProxy !== undefined && ukProxy.geo === 'UK', 'getProxyForGeo("UK") selected UK node');

  // Test fallback on non-existent geo
  const fallbackProxy = rotator.getProxyForGeo('FR', true);
  assert(fallbackProxy !== undefined, 'getProxyForGeo("FR", true) falls back to general pool');

  const strictProxy = rotator.getProxyForGeo('FR', false);
  assert(strictProxy === undefined, 'getProxyForGeo("FR", false) returns undefined in strict mode');

  // --------------------------------------------------------------------------
  // Test 3: Live Health Check & Probe Validation
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 3] Proxy Health & Latency Probe ---');
  const healthyProxy: ProxyConfig = {
    server: `http://127.0.0.1:${normalServerPort}`,
    geo: 'US',
  };

  const deadProxy: ProxyConfig = {
    server: 'http://127.0.0.1:59999', // Closed port
    geo: 'DE',
  };

  const slowProxy: ProxyConfig = {
    server: `http://127.0.0.1:${slowServerPort}`,
    geo: 'AU',
  };

  const testTargetUrl = `http://127.0.0.1:${normalServerPort}/ping`;

  // 1. Healthy proxy validation
  const isHealthy = await rotator.validateProxy(healthyProxy, testTargetUrl, 2000);
  assert(isHealthy === true, 'Healthy proxy validated successfully');
  assert(!rotator.isBlacklisted(healthyProxy), 'Healthy proxy is NOT blacklisted');

  const healthyMetrics = rotator.getProxyMetrics(healthyProxy);
  assert(Boolean(healthyMetrics && healthyMetrics.isHealthy), 'Metrics reflect healthy status');
  assert(Boolean(healthyMetrics && healthyMetrics.latencyMs < 500), `Recorded healthy latency (${healthyMetrics?.latencyMs}ms)`);

  // 2. Dead proxy validation & auto-blacklist
  const isDeadValid = await rotator.validateProxy(deadProxy, testTargetUrl, 1000);
  assert(isDeadValid === false, 'Dead proxy failed validation');
  assert(rotator.isBlacklisted(deadProxy), 'Dead proxy was automatically blacklisted for 30 minutes');

  const deadMetrics = rotator.getProxyMetrics(deadProxy);
  assert(Boolean(deadMetrics && !deadMetrics.isHealthy), 'Metrics reflect unhealthy status for dead proxy');
  assert(Boolean(deadMetrics && deadMetrics.blacklistedUntil), 'Metrics record blacklistedUntil timestamp');

  // 3. Slow proxy latency threshold (> 3000ms)
  const isSlowValid = await rotator.validateProxy(slowProxy, `http://127.0.0.1:${slowServerPort}/slow`, 1000);
  assert(isSlowValid === false, 'Slow proxy (> timeout) failed validation');
  assert(rotator.isBlacklisted(slowProxy), 'Slow proxy was automatically blacklisted');

  // --------------------------------------------------------------------------
  // Test 4: Exclusion of Blacklisted Proxies from Rotation
  // --------------------------------------------------------------------------
  console.log('\n--- [TEST 4] Blacklist Exclusion in getNextProxy & getProxyForGeo ---');
  rotator.reloadProxies([
    `http://127.0.0.1:${normalServerPort}#US`,
    'http://127.0.0.1:59998#US', // dead US node
    `http://127.0.0.1:${normalServerPort}#AU`,
  ].join(','));

  const deadUsProxy: ProxyConfig = { server: 'http://127.0.0.1:59998', geo: 'US' };
  rotator.blacklistProxy(deadUsProxy, 30 * 60 * 1000, 'Test blacklist');

  assert(rotator.isBlacklisted(deadUsProxy), 'Dead US node is blacklisted');

  const selectedUs = rotator.getProxyForGeo('US');
  assert(selectedUs !== undefined && selectedUs.server === `http://127.0.0.1:${normalServerPort}`, 'Selected active healthy US proxy instead of blacklisted one');

  // Unblacklist recovery test
  rotator.unblacklistProxy(deadUsProxy);
  assert(!rotator.isBlacklisted(deadUsProxy), 'Proxy successfully un-blacklisted');

  // Cleanup servers
  normalServer.close();
  slowServer.close();

  console.log('\n================================================================');
  console.log(`📊 PROXY ROTATOR SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runProxyRotatorSpec().catch((err) => {
  console.error('Fatal Proxy Rotator Spec Error:', err);
  process.exit(1);
});
