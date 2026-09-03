import fs from 'fs';
import path from 'path';
import { TelegramLeadRepository } from '../../core/src/db/tg-leads.repository.js';
import { generateBridgeHtml, handleBridgeRequest } from '../../core/src/server/routes/bridge.router.js';

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

async function runBridgeGatewayTestSuite() {
  console.log('\n🧪 ================================================================');
  console.log('🧪 Deep-Link Bridge Gateway (/join/:source) Test Suite (SPEC)');
  console.log('🧪 ================================================================\n');

  const testDir = path.resolve(process.cwd(), 'scratch/test_bridge_gw_' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });

  TelegramLeadRepository.resetInstance();
  const leadRepo = TelegramLeadRepository.getInstance(testDir);

  // --- [TEST 1] Micro-Landing HTML Generation & Size Constraints ---
  console.log('--- [TEST 1] Micro-Landing HTML Generation & Size Constraints ---');
  const startBenchmark = performance.now();
  const html = generateBridgeHtml({
    botUsername: 'TestMatchBot',
    source: 'reddit',
    subSource: 'bio_link',
  });
  const renderDurationMs = performance.now() - startBenchmark;

  const htmlSizeBytes = Buffer.byteLength(html, 'utf8');
  assert(htmlSizeBytes < 2048, `HTML size is ultralight <2KB (Actual: ${htmlSizeBytes} bytes)`);
  assert(renderDurationMs < 10, `HTML render is ultra-fast <10ms (Actual: ${renderDurationMs.toFixed(2)}ms)`);
  assert(html.includes('tg://resolve?domain=TestMatchBot&start=reddit_bio_link'), 'Generates valid tg:// deep-link scheme');
  assert(html.includes('https://t.me/TestMatchBot?start=reddit_bio_link'), 'Generates valid https://t.me web fallback');
  assert(html.includes('Secure Match Filter'), 'Contains Secure Match Filter header');
  assert(html.includes('Routing to active verified pool...'), 'Contains verification routing body');
  assert(html.includes('[ Open Telegram Client ]'), 'Contains high-contrast CTA button');
  assert(html.includes('setTimeout'), 'Includes auto-redirect fallback script');
  assert(!html.includes('http://') && !html.includes('https://cdn.'), 'Zero external CDN scripts or fonts');

  // --- [TEST 2] SQLite Click Attribution Logging ---
  console.log('\n--- [TEST 2] SQLite Click Attribution Logging ---');
  leadRepo.recordBridgeClick('reddit', 'r_dating_t1', '192.168.1.50', 'Mozilla/5.0 (iPhone)', 'https://reddit.com/r/dating');
  leadRepo.recordBridgeClick('quora', 'burnout_q1', '10.0.0.12', 'Mozilla/5.0 (Android)', 'https://quora.com/q/123');

  const redditClicks = leadRepo.getBridgeClicks('reddit');
  assert(redditClicks.length >= 1, 'Reddit click successfully stored in SQLite');
  assert(redditClicks[0].sub_source === 'r_dating_t1', 'Sub-source correctly recorded');
  assert(redditClicks[0].ip === '192.168.1.50', 'Client IP recorded');
  assert(redditClicks[0].referer === 'https://reddit.com/r/dating', 'Referer header recorded');

  const quoraClicks = leadRepo.getBridgeClicks('quora');
  assert(quoraClicks.length >= 1, 'Quora click successfully stored in SQLite');
  assert(quoraClicks[0].sub_source === 'burnout_q1', 'Quora sub-source recorded');

  // --- [TEST 3] HTTP Handler End-to-End Simulation ---
  console.log('\n--- [TEST 3] HTTP Handler End-to-End Simulation ---');
  let responseStatusCode = 0;
  let responseHeaders: Record<string, string> = {};
  let responseBody = '';

  const mockReq: any = {
    params: { source: 'reddit' },
    query: { sub: 'profile_bio', angle: 'app_exhaustion' },
    headers: {
      'x-forwarded-for': '203.0.113.195, 172.16.0.1',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      referer: 'https://www.reddit.com/user/my_profile/',
    },
    socket: { remoteAddress: '127.0.0.1' },
  };

  const mockRes: any = {
    setHeader: (k: string, v: string) => {
      responseHeaders[k.toLowerCase()] = v;
    },
    status: (code: number) => {
      responseStatusCode = code;
      return {
        send: (body: string) => {
          responseBody = body;
        },
      };
    },
  };

  handleBridgeRequest(mockReq, mockRes);

  assert(responseStatusCode === 200, 'HTTP status code is 200 OK');
  assert(responseHeaders['content-type'].includes('text/html'), 'Content-Type header is text/html');
  assert(responseBody.includes('tg://resolve?domain='), 'Response body contains deep-link resolve scheme');
  assert(responseBody.includes('reddit_profile_bio'), 'Start parameter properly formatted as reddit_profile_bio');

  const latestLoggedClicks = leadRepo.getBridgeClicks('reddit');
  assert(latestLoggedClicks[0].ip === '203.0.113.195', 'Client IP stripped from multi-hop x-forwarded-for header');
  assert(latestLoggedClicks[0].user_agent?.includes('Windows NT'), 'User agent captured accurately');

  // Cleanup test environment
  try {
    fs.rmSync(testDir, { recursive: true, force: true });
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 BRIDGE GATEWAY SPEC RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBridgeGatewayTestSuite().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
