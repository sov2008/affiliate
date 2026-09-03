/**
 * Bot Shield Cloudflare Worker
 * Edge middleware for traffic filtering and bot detection
 * Deploys on Cloudflare Workers to intercept and route traffic
 */

// Configuration injected at deployment time
const BOT_SHIELD_CONFIG = {
  datacenter_asn_blocklist: ['AMAZON', 'GOOGLE_CLOUD', 'DIGITALOCEAN', 'MICROSOFT_AZURE', 'HETZNER'],
  crawler_user_agents: ['facebookexternalhit', 'Facebot', 'RedditBot', 'Twitterbot', 'Googlebot'],
  action_on_crawler: 'SERVE_WHITE_PAGE',
};

const CRITICAL_BROWSER_HEADERS = [
  'accept-language',
  'sec-ch-ua',
  'sec-ch-ua-mobile',
  'sec-fetch-site',
  'sec-fetch-mode',
  'sec-fetch-dest',
];

/**
 * Check if User-Agent matches known crawlers
 */
function checkCrawlerUserAgent(userAgent) {
  if (!userAgent) return { isBot: true, agent: 'empty' };

  const ua = userAgent.toLowerCase();
  for (const crawler of BOT_SHIELD_CONFIG.crawler_user_agents) {
    if (ua.includes(crawler.toLowerCase())) {
      return { isBot: true, agent: crawler };
    }
  }

  return { isBot: false };
}

/**
 * Detect datacenter IPs
 */
function checkDatacenterIP(ip, asn) {
  const checkString = `${ip} ${asn || ''}`.toUpperCase();

  for (const provider of BOT_SHIELD_CONFIG.datacenter_asn_blocklist) {
    if (checkString.includes(provider)) {
      return { isDatacenter: true, provider };
    }
  }

  return { isDatacenter: false };
}

/**
 * Verify critical browser headers are present
 */
function checkBrowserHeaders(headers) {
  let missing = [];

  for (const header of CRITICAL_BROWSER_HEADERS) {
    if (!headers.get(header)) {
      missing.push(header);
    }
  }

  return {
    isLegitimate: missing.length <= 2,
    missing,
    missingCount: missing.length,
  };
}

/**
 * Analyze request for bot/crawler signatures
 */
function analyzeTraffic(userAgent, ip, headers, asn) {
  let confidence = 0;
  const reasons = [];

  // Check 1: User-Agent Analysis
  const crawlerCheck = checkCrawlerUserAgent(userAgent);
  if (crawlerCheck.isBot) {
    confidence += 50;
    reasons.push(`Crawler detected: ${crawlerCheck.agent}`);
  }

  // Check 2: Datacenter IP Detection
  const dcCheck = checkDatacenterIP(ip, asn);
  if (dcCheck.isDatacenter) {
    confidence += 30;
    reasons.push(`Datacenter IP: ${dcCheck.provider}`);
  }

  // Check 3: Browser Header Analysis
  const headerCheck = checkBrowserHeaders(headers);
  if (!headerCheck.isLegitimate) {
    confidence += headerCheck.missingCount * 10;
    reasons.push(`Missing headers: ${headerCheck.missing.join(', ')}`);
  }

  // Check 4: Headless markers
  if (userAgent && (userAgent.includes('HeadlessChrome') || userAgent.includes('jsdom'))) {
    confidence += 40;
    reasons.push('Headless browser detected');
  }

  return {
    isBot: confidence >= 50,
    isCrawler: crawlerCheck.isBot,
    isDatacenterIP: dcCheck.isDatacenter,
    confidence,
    reasons,
  };
}

/**
 * Generate white page (educational content)
 */
function getWhitePageContent() {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>5 Fundamentals of Financial Literacy</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; line-height: 1.6; color: #333; }
        h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .fundamental { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #0066cc; }
        .fundamental h3 { color: #0066cc; margin-top: 0; }
        .footer { margin-top: 40px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
      </style>
    </head>
    <body>
      <h1>5 Fundamentals of Financial Literacy</h1>
      <p>Understanding basic financial principles is essential for building a secure future.</p>
      
      <div class="fundamental">
        <h3>1. Budgeting & Expense Tracking</h3>
        <p>Create a monthly budget to track income and expenses. This helps identify spending patterns and opportunities to save.</p>
      </div>
      
      <div class="fundamental">
        <h3>2. Emergency Fund Management</h3>
        <p>Build an emergency fund covering 3-6 months of expenses. This safety net protects against unexpected financial shocks.</p>
      </div>
      
      <div class="fundamental">
        <h3>3. Debt Management Strategy</h3>
        <p>Understand different types of debt and develop a repayment strategy. Prioritize high-interest debt elimination.</p>
      </div>
      
      <div class="fundamental">
        <h3>4. Investment Basics</h3>
        <p>Learn about diversification, risk tolerance, and long-term wealth building through various investment vehicles.</p>
      </div>
      
      <div class="fundamental">
        <h3>5. Credit Score Optimization</h3>
        <p>Monitor your credit score, understand factors that affect it, and work to maintain a healthy credit profile.</p>
      </div>
      
      <div class="footer">
        <p>Educational content provided for informational purposes.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Main Cloudflare Worker request handler
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  // Extract request context
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '';
  const asn = request.headers.get('cf-asn') || '';

  // Perform bot analysis
  const analysis = analyzeTraffic(userAgent, ip, request.headers, asn);

  // Add analysis headers to response
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'X-Bot-Shield-Analysis': JSON.stringify({
      isBot: analysis.isBot,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
    }),
  });

  // Route based on analysis
  if (analysis.isBot || analysis.confidence >= 50) {
    // Serve white page to bots
    headers.set('X-Bot-Shield-Action', 'serve-white-page');
    headers.set('Cache-Control', 'public, max-age=3600');
    return new Response(getWhitePageContent(), {
      status: 200,
      headers,
    });
  }

  // Route genuine traffic to origin
  headers.set('X-Bot-Shield-Action', 'forward-to-origin');
  headers.set('X-Bot-Shield-Genuine', 'true');

  // Forward to origin with tracking headers
  const newRequest = new Request(request, {
    headers: {
      ...request.headers,
      'X-Bot-Shield': 'verified',
      'X-Traffic-Analysis': JSON.stringify(analysis),
    },
  });

  return fetch(newRequest);
}

/**
 * Test endpoint for bot shield simulation
 */
async function handleTestEndpoint(request) {
  const url = new URL(request.url);
  const testUA = url.searchParams.get('ua') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  const testIP = url.searchParams.get('ip') || '203.0.113.1';
  const testASN = url.searchParams.get('asn') || '';

  // Create mock headers for testing
  const testHeaders = new Map([
    ['user-agent', testUA],
    ['accept-language', 'en-US,en;q=0.9'],
    ['sec-ch-ua', '"Chromium";v="118"'],
    ['sec-ch-ua-mobile', '?0'],
  ]);

  const analysis = analyzeTraffic(testUA, testIP, testHeaders, testASN);

  const responseBody = {
    test_parameters: {
      user_agent: testUA,
      ip: testIP,
      asn: testASN,
    },
    analysis_result: {
      isBot: analysis.isBot,
      isCrawler: analysis.isCrawler,
      isDatacenterIP: analysis.isDatacenterIP,
      confidence: analysis.confidence,
      reasons: analysis.reasons,
      routing_decision: analysis.isBot ? 'SERVE_WHITE_PAGE' : 'SERVE_BLACK_PAGE',
    },
  };

  return new Response(JSON.stringify(responseBody, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * Cloudflare Worker event handler
 */
addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Route test endpoint
  if (url.pathname === '/api/test/bot-shield') {
    event.respondWith(handleTestEndpoint(request));
  } else {
    event.respondWith(handleRequest(request));
  }
});

// Export for Node.js/local testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleRequest,
    handleTestEndpoint,
    analyzeTraffic,
    checkCrawlerUserAgent,
    checkDatacenterIP,
    checkBrowserHeaders,
    getWhitePageContent,
  };
}
