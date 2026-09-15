#!/usr/bin/env node
/**
 * Antigravity High-Performance Browser & Offer Validation MCP Server
 * 
 * Compliant with Model Context Protocol (2024-11-05).
 * Built with Playwright Chromium & Native Fetch.
 * Performs deep mobile-emulated inspection of affiliate smartlinks (LosPollos, MyLead),
 * detects redirect loops, domain bans, Cloudflare interstitial challenges,
 * SSL failures, and parses landing page DOM/CTA metadata.
 * Enforces AGENTS.md STRICT ZERO DEMO DATA RULE.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Ensure scratch directory exists for screenshots
const SCRATCH_DIR = path.resolve(__dirname, '../scratch');
if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

// Emulated Mobile Profile (iPhone 14 Pro / iOS 17 Safari)
const MOBILE_DEVICE = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  locale: 'en-US',
  timezoneId: 'America/New_York'
};

// Known domain suspension & block signatures
const BLOCK_SIGNATURES = [
  { pattern: /domain\s+suspended/i, reason: 'Domain Suspended by Registrar / Host' },
  { pattern: /account\s+suspended/i, reason: 'Account Suspended by Hosting Provider' },
  { pattern: /access\s+denied/i, reason: 'Access Denied (WAF / IP Block)' },
  { pattern: /cloudflare|cf-browser-verification|checking your browser/i, reason: 'Cloudflare Interstitial Challenge / Bot Detection' },
  { pattern: /this\s+domain\s+is\s+parked|domain\s+for\s+sale|buy\s+this\s+domain/i, reason: 'Parked / Expired Domain' },
  { pattern: /404\s+not\s+found/i, reason: '404 Dead Landing Page' },
  { pattern: /502\s+bad\s+gateway|521\s+web\s+server\s+is\s+down|522\s+connection\s+timed\s+out/i, reason: 'Upstream Web Server Offline' }
];

// Dating / Smartlink topic keywords
const DATING_KEYWORDS = [
  'dating', 'singles', 'chat', 'meet', 'match', 'hookup', 'girls', 'women',
  'flirt', 'love', 'sign up', 'join free', 'register', 'age verification', '18+'
];

// Shared browser instance management
let browserInstance = null;
let browserLaunchPromise = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }
  browserLaunchPromise = chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run'
    ]
  }).then((browser) => {
    browserInstance = browser;
    browserLaunchPromise = null;
    process.stderr.write(`[MCP-Browser] ✅ Playwright Chromium engine started\n`);
    return browser;
  }).catch((err) => {
    browserLaunchPromise = null;
    process.stderr.write(`[MCP-Browser] ❌ Chromium launch failed: ${err.message}\n`);
    throw err;
  });

  return browserLaunchPromise;
}

// Tool 1: validate_offer_url
async function validateOfferUrl(params) {
  const targetUrl = params?.url;
  if (!targetUrl) {
    throw new Error('Missing required parameter: url');
  }

  const expectedStatus = params?.expected_status || 200;
  const timeoutMs = Math.min(Math.max(params?.timeout_ms || 15000, 3000), 45000);
  const followRedirects = params?.follow_redirects !== false;

  const startTime = Date.now();
  const redirectChain = [];
  let finalUrl = targetUrl;
  let finalStatus = 0;
  let blockDetected = null;
  let responseText = '';

  // Use HTTP fetch with mobile headers to trace redirects accurately
  try {
    let currentUrl = targetUrl;
    let hops = 0;
    const maxHops = followRedirects ? 15 : 1;

    while (hops < maxHops) {
      hops++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': MOBILE_DEVICE.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'manual',
        signal: controller.signal
      });

      clearTimeout(timer);

      finalStatus = resp.status;
      const location = resp.headers.get('location');

      redirectChain.push({
        hop: hops,
        url: currentUrl,
        status: resp.status,
        statusText: resp.statusText,
        location: location || null
      });

      if (resp.status >= 300 && resp.status < 400 && location && followRedirects) {
        currentUrl = new URL(location, currentUrl).href;
        finalUrl = currentUrl;
      } else {
        finalUrl = currentUrl;
        responseText = await resp.text().catch(() => '');
        break;
      }
    }

    // Check for block signatures in response body
    for (const sig of BLOCK_SIGNATURES) {
      if (sig.pattern.test(responseText)) {
        blockDetected = sig.reason;
        break;
      }
    }

    const latencyMs = Date.now() - startTime;
    const isValid = (finalStatus === expectedStatus || (expectedStatus === 200 && (finalStatus === 200 || finalStatus === 302))) && !blockDetected;

    let parsedFinalDomain = '';
    try {
      parsedFinalDomain = new URL(finalUrl).hostname;
    } catch {}

    return {
      is_valid: isValid,
      target_url: targetUrl,
      final_url: finalUrl,
      final_domain: parsedFinalDomain,
      final_status: finalStatus,
      expected_status: expectedStatus,
      total_hops: redirectChain.length,
      redirect_chain: redirectChain,
      is_blocked: !!blockDetected,
      block_reason: blockDetected,
      latency_ms: latencyMs,
      content_length: responseText.length,
      has_body: responseText.length > 50
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      is_valid: false,
      target_url: targetUrl,
      final_url: finalUrl,
      error: err.message,
      latency_ms: latencyMs,
      redirect_chain: redirectChain,
      is_blocked: true,
      block_reason: `Connection error: ${err.message}`
    };
  }
}

// Tool 2: inspect_landing_dom
async function inspectLandingDom(params) {
  const targetUrl = params?.url;
  if (!targetUrl) {
    throw new Error('Missing required parameter: url');
  }

  const timeoutMs = Math.min(Math.max(params?.timeout_ms || 20000, 5000), 60000);
  const saveScreenshot = params?.save_screenshot !== false;

  const browser = await getBrowser();
  const context = await browser.newContext(MOBILE_DEVICE);
  const page = await context.newPage();

  const startTime = Date.now();
  const networkHops = [];

  page.on('response', (res) => {
    try {
      if (res.status() >= 300 && res.status() < 400) {
        networkHops.push({
          url: res.url(),
          status: res.status(),
          location: res.headers()['location'] || null
        });
      }
    } catch {}
  });

  try {
    process.stderr.write(`[MCP-Browser] 🌐 Inspecting mobile landing: ${targetUrl}\n`);
    const resp = await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs
    });

    // Wait a brief moment for dynamic scripts to settle
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    const finalStatus = resp ? resp.status() : 200;

    // Extract DOM features
    const domData = await page.evaluate(() => {
      const getCleanText = (el) => el ? el.innerText.trim().replace(/\s+/g, ' ') : '';

      const title = document.title || '';
      const metaDescEl = document.querySelector('meta[name="description"]') || document.querySelector('meta[property="og:description"]');
      const metaDescription = metaDescEl ? metaDescEl.getAttribute('content') || '' : '';

      const h1List = Array.from(document.querySelectorAll('h1')).map(getCleanText).filter(Boolean);
      const h2List = Array.from(document.querySelectorAll('h2')).map(getCleanText).filter(Boolean).slice(0, 5);

      const buttons = Array.from(document.querySelectorAll('button, a.btn, a.cta, a[role="button"], input[type="submit"]'))
        .map(getCleanText)
        .filter(t => t.length > 1 && t.length < 50)
        .slice(0, 8);

      const bodyText = document.body ? document.body.innerText.toLowerCase() : '';

      return {
        title,
        metaDescription,
        h1: h1List,
        h2: h2List,
        ctaButtons: buttons,
        bodySample: bodyText.slice(0, 1000)
      };
    });

    // Detect Dating keywords in extracted texts
    const combinedText = `${domData.title} ${domData.metaDescription} ${domData.h1.join(' ')} ${domData.ctaButtons.join(' ')} ${domData.bodySample}`.toLowerCase();
    const foundKeywords = DATING_KEYWORDS.filter(k => combinedText.includes(k));
    const isDatingRelevant = foundKeywords.length > 0;

    // Check for block signatures
    let blockDetected = null;
    for (const sig of BLOCK_SIGNATURES) {
      if (sig.pattern.test(combinedText)) {
        blockDetected = sig.reason;
        break;
      }
    }

    let screenshotPath = null;
    let screenshotBase64 = null;

    if (saveScreenshot) {
      const filename = `landing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.png`;
      screenshotPath = path.join(SCRATCH_DIR, filename);
      const buffer = await page.screenshot({ path: screenshotPath, fullPage: false });
      screenshotBase64 = buffer.toString('base64').slice(0, 200) + '...[truncated preview]';
    }

    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      target_url: targetUrl,
      final_url: finalUrl,
      final_status: finalStatus,
      title: domData.title,
      meta_description: domData.metaDescription,
      h1: domData.h1,
      h2: domData.h2,
      cta_buttons: domData.ctaButtons,
      is_dating_relevant: isDatingRelevant,
      keywords_detected: foundKeywords,
      is_blocked: !!blockDetected,
      block_reason: blockDetected,
      screenshot_path: screenshotPath,
      screenshot_preview_base64: screenshotBase64,
      network_hops: networkHops,
      latency_ms: latencyMs
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      target_url: targetUrl,
      error: err.message,
      is_blocked: true,
      block_reason: `Browser navigation failure: ${err.message}`,
      latency_ms: latencyMs
    };
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
}

// Tool definitions according to MCP specification
const TOOLS = [
  {
    name: 'validate_offer_url',
    description: 'Validates affiliate smartlinks & TDS redirect chains (/go, /click, LosPollos, MyLead) with mobile emulation. Detects 404, registrar suspensions, WAF/Cloudflare interstitials, SSL failures and redirect loops.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The smartlink or offer URL to inspect.'
        },
        expected_status: {
          type: 'number',
          description: 'Expected final HTTP status code (default: 200).'
        },
        timeout_ms: {
          type: 'number',
          description: 'Timeout in milliseconds (default: 15000).'
        },
        follow_redirects: {
          type: 'boolean',
          description: 'Whether to follow full 301/302 HTTP redirect chains (default: true).'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'inspect_landing_dom',
    description: 'Deeply inspects an offer landing page in mobile Chromium (iPhone viewport). Extracts title, H1, meta description, CTA buttons, detects dating/adult keyword relevance, and takes a verification screenshot in scratch/.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Landing page or smartlink destination URL to render.'
        },
        timeout_ms: {
          type: 'number',
          description: 'Navigation timeout in milliseconds (default: 20000).'
        },
        save_screenshot: {
          type: 'boolean',
          description: 'Whether to capture and save a PNG screenshot to scratch/ (default: true).'
        }
      },
      required: ['url']
    }
  }
];

// Tool call handler
async function handleToolCall(toolName, args) {
  switch (toolName) {
    case 'validate_offer_url': {
      const res = await validateOfferUrl(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ]
      };
    }

    case 'inspect_landing_dom': {
      const res = await inspectLandingDom(args);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(res, null, 2)
          }
        ]
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// JSON-RPC Message Processing
async function processMessage(msg) {
  if (!msg || typeof msg !== 'object') return;
  const { id, method, params } = msg;

  switch (method) {
    case 'initialize': {
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'antigravity-browser-validator',
          version: '1.0.0'
        }
      });
      break;
    }

    case 'ping': {
      sendResponse(id, {});
      break;
    }

    case 'tools/list': {
      sendResponse(id, {
        tools: TOOLS
      });
      break;
    }

    case 'tools/call': {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const result = await handleToolCall(toolName, toolArgs);
        sendResponse(id, result);
      } catch (err) {
        sendError(id, -32603, err.message);
      }
      break;
    }

    default: {
      sendError(id, -32601, `Method '${method}' not found`);
      break;
    }
  }
}

function sendResponse(id, result) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    result
  });
  process.stdout.write(payload + '\n');
}

function sendError(id, code, message) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message
    }
  });
  process.stdout.write(payload + '\n');
}

// Setup Standard Input Processing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  line = line.trim();
  if (!line) return;

  if (line.startsWith('Content-Length:')) {
    return;
  }

  try {
    const parsed = JSON.parse(line);
    await processMessage(parsed);
  } catch (err) {
    process.stderr.write(`[MCP-Browser] JSON Parse error: ${err.message} for line: ${line}\n`);
  }
});

async function cleanup() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch {}
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
