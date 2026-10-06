const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const linksFile = path.resolve(__dirname, '../artifacts_admitad/active_links.json');
const rawData = JSON.parse(fs.readFileSync(linksFile, 'utf8'));

// Extract unique offers
const offers = [];
for (const [key, val] of Object.entries(rawData)) {
  if (typeof val === 'object' && val && val.gotolink) {
    offers.push(val);
  }
}

console.log(`Found ${offers.length} Admitad offers to test.\n`);

function checkUrl(url, maxRedirects = 5) {
  return new Promise((resolve) => {
    let currentUrl = url;
    let hops = 0;
    const history = [];

    function makeRequest(targetUrl) {
      if (hops >= maxRedirects) {
        return resolve({ success: true, hops, finalUrl: targetUrl, history, note: 'Max redirects reached' });
      }

      hops++;
      const isHttps = targetUrl.startsWith('https://');
      const client = isHttps ? https : http;

      try {
        const req = client.get(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9'
          },
          timeout: 10000
        }, (res) => {
          const status = res.statusCode;
          const location = res.headers['location'];
          history.push({ hop: hops, url: targetUrl, status, location });

          if (status >= 300 && status < 400 && location) {
            const nextUrl = location.startsWith('http') ? location : new URL(location, targetUrl).href;
            return makeRequest(nextUrl);
          }

          let bodySnippet = '';
          res.on('data', chunk => {
            if (bodySnippet.length < 500) bodySnippet += chunk.toString();
          });
          res.on('end', () => {
            const isDummy = targetUrl.includes('/dummy/') || bodySnippet.includes('not valid') || bodySnippet.includes('broken_link');
            resolve({
              success: !isDummy && status >= 200 && status < 400,
              isDummy,
              finalStatus: status,
              finalUrl: targetUrl,
              hops,
              history
            });
          });
        });

        req.on('error', (err) => {
          resolve({ success: false, error: err.message, hops, finalUrl: targetUrl, history });
        });

        req.on('timeout', () => {
          req.destroy();
          resolve({ success: false, error: 'Timeout', hops, finalUrl: targetUrl, history });
        });
      } catch (e) {
        resolve({ success: false, error: e.message, hops, finalUrl: targetUrl, history });
      }
    }

    makeRequest(url);
  });
}

async function run() {
  const results = [];
  for (const offer of offers) {
    process.stdout.write(`Testing [${offer.id}] ${offer.name} (${offer.gotolink})... `);
    const res = await checkUrl(offer.gotolink);
    if (res.isDummy) {
      console.log(`❌ BROKEN (Redirected to Admitad dummy/invalid link: ${res.finalUrl})`);
    } else if (res.success) {
      console.log(`✅ OK (${res.hops} hops -> ${res.finalUrl.slice(0, 70)})`);
    } else {
      console.log(`⚠️ Status ${res.finalStatus || res.error} (${res.finalUrl?.slice(0, 70) || ''})`);
    }
    results.push({ offer, result: res });
  }

  console.log('\n==========================================');
  console.log('SUMMARY:');
  for (const r of results) {
    const status = r.result.isDummy ? '❌ BROKEN / DUMMY' : (r.result.success ? '✅ WORKING' : `⚠️ ${r.result.finalStatus || r.result.error}`);
    console.log(`- [${r.offer.id}] ${r.offer.name}: ${status}`);
    if (r.result.isDummy) {
      console.log(`  Gotolink: ${r.offer.gotolink}`);
      console.log(`  Destination: ${r.result.finalUrl}`);
    }
  }
}

run();
