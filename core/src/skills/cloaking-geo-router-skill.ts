export interface TrafficEvaluation {
  isAllowed: boolean;
  action: 'money_page' | 'white_page';
  reason: string;
  clientIp?: string;
  country?: string;
  userAgent?: string;
}

const KNOWN_BOT_USER_AGENTS = [
  /googlebot/i,
  /adsbot-google/i,
  /mediapartners-google/i,
  /facebookexternalhit/i,
  /facebot/i,
  /facebookbot/i,
  /twitterbot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
  /yandexbot/i,
  /headlesschrome/i,
  /phantomjs/i,
  /playwright/i,
  /puppeteer/i,
  /python-requests/i,
  /aiohttp/i,
  /curl/i,
  /wget/i,
  /postman/i
];

const KNOWN_DATACENTER_ORGS = [
  /amazon/i,
  /aws/i,
  /google cloud/i,
  /digitalocean/i,
  /hetzner/i,
  /ovh/i,
  /linode/i,
  /microsoft/i,
  /azure/i,
  /alibaba/i,
  /oracle/i,
  /m247/i,
  /leaseweb/i
];

export function evaluateTraffic(
  headers: Record<string, string>,
  allowedGeos: string[] = ['US', 'AU', 'UK', 'DE', 'FR', 'CA', 'NZ']
): TrafficEvaluation {
  const ua = headers['user-agent'] || headers['User-Agent'] || '';
  const country = (headers['cf-ipcountry'] || headers['CF-IPCountry'] || headers['x-country'] || 'US').toUpperCase();
  const org = headers['cf-iporg'] || headers['x-asn-org'] || '';
  const ip = headers['cf-connecting-ip'] || headers['x-forwarded-for'] || '127.0.0.1';

  // 1. User-Agent Bot Check
  for (const botRegex of KNOWN_BOT_USER_AGENTS) {
    if (botRegex.test(ua)) {
      return {
        isAllowed: false,
        action: 'white_page',
        reason: `Bot / Crawler UA detected (${botRegex.source})`,
        clientIp: ip,
        country,
        userAgent: ua
      };
    }
  }

  // 2. Datacenter / ASN Check
  for (const dcRegex of KNOWN_DATACENTER_ORGS) {
    if (dcRegex.test(org)) {
      return {
        isAllowed: false,
        action: 'white_page',
        reason: `Datacenter / Hosting ASN detected (${dcRegex.source})`,
        clientIp: ip,
        country,
        userAgent: ua
      };
    }
  }

  // 3. Geo Targeting Filter
  if (allowedGeos.length > 0 && !allowedGeos.includes(country) && country !== 'XX') {
    return {
      isAllowed: false,
      action: 'white_page',
      reason: `Country ${country} is not in allowed target GEO list [${allowedGeos.join(', ')}]`,
      clientIp: ip,
      country,
      userAgent: ua
    };
  }

  return {
    isAllowed: true,
    action: 'money_page',
    reason: 'Clean residential Tier-1 visitor passed all security filters.',
    clientIp: ip,
    country,
    userAgent: ua
  };
}

export function generateWhitePage(title: string = 'Tech News & Reviews 2026'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 text-gray-800 font-sans p-6">
  <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
    <header class="border-b pb-4 mb-6">
      <h1 class="text-2xl font-bold text-gray-900">${title}</h1>
      <p class="text-sm text-gray-500">Editorial Tech & Consumer Reports • Updated Daily</p>
    </header>
    <article class="space-y-4 leading-relaxed text-gray-700">
      <h2 class="text-xl font-semibold text-gray-800">Understanding Digital Trends in 2026</h2>
      <p>Modern software solutions have evolved rapidly, providing consumers with better privacy, security, and algorithmic automation tools. Our team independently reviews online digital platforms to assess performance and safety.</p>
      <p>All evaluations conform strictly to advertising standards and global digital privacy guidelines.</p>
    </article>
    <footer class="border-t pt-4 mt-8 text-xs text-gray-400 text-center">
      © 2026 Consumer Review Portal. All rights reserved.
    </footer>
  </div>
</body>
</html>`;
}

if (require.main === module) {
  console.log('🛡️ [Cloaking & Geo Router Skill] Self-Test:');
  const botTest = evaluateTraffic({ 'user-agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)' }, ['US', 'AU']);
  console.log('   Bot Test Result:', botTest);

  const humanTest = evaluateTraffic({ 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)', 'cf-ipcountry': 'AU' }, ['US', 'AU']);
  console.log('   Human Test Result:', humanTest);
}
