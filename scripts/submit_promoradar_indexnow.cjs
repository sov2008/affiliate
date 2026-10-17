const https = require('https');

async function fetchSitemapUrls() {
  return new Promise((resolve, reject) => {
    https.get('https://promoradar.store/sitemap-0.xml', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const matches = [...data.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
        resolve(matches);
      });
    }).on('error', reject);
  });
}

async function sendIndexNow(endpoint, payload) {
  return new Promise((resolve) => {
    const url = new URL(endpoint);
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let respBody = '';
      res.on('data', c => respBody += c);
      res.on('end', () => {
        resolve({ endpoint, status: res.statusCode, body: respBody });
      });
    });

    req.on('error', (err) => {
      resolve({ endpoint, status: 'ERROR', error: err.message });
    });

    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('📡 Fetching sitemap from https://promoradar.store/sitemap-0.xml ...');
  const urls = await fetchSitemapUrls();
  console.log(`✅ Found ${urls.length} total PromoRadar URLs to index.`);

  const key = 'dcaf1a95-f2a7-42c8-b67f-4a463294ee43';
  const payload = {
    host: 'promoradar.store',
    key: key,
    keyLocation: `https://promoradar.store/${key}.txt`,
    urlList: urls
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ];

  for (const ep of endpoints) {
    console.log(`🚀 Submitting ${urls.length} URLs to ${ep}...`);
    const res = await sendIndexNow(ep, payload);
    console.log(`Status [${res.status}]: ${res.body || 'OK'}`);
  }

  console.log('🎉 IndexNow instant submission complete!');
}

main().catch(console.error);
