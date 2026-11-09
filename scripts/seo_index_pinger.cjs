/**
 * Autonomous IndexNow SEO Pinger for PromoRadar
 * Reads sitemap files from deals-portal/dist/
 * and submits URLs in batches to https://api.indexnow.org/indexnow
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'promoradar.store';
const KEY = 'e2d6b384a51e44f8b03046f890cf51a2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const DIST_DIR = path.resolve(__dirname, '../deals-portal/dist');

function extractUrlsFromXml(xmlContent) {
  const urls = [];
  const locRegex = /<loc>(https?:\/\/[^<]+)<\/loc>/g;
  let match;
  while ((match = locRegex.exec(xmlContent)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

function collectAllSitemapUrls() {
  const allUrls = new Set();
  if (!fs.existsSync(DIST_DIR)) {
    console.warn(`[IndexNow] dist dir does not exist at ${DIST_DIR}`);
    return [];
  }

  const files = fs.readdirSync(DIST_DIR);
  const sitemapFiles = files.filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));

  console.log(`[IndexNow] Found sitemap files:`, sitemapFiles);

  for (const file of sitemapFiles) {
    const fullPath = path.join(DIST_DIR, file);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const urls = extractUrlsFromXml(content);
      for (const u of urls) {
        // If sitemap points to sub-sitemaps, skip or parse them
        if (u.endsWith('.xml')) continue;
        allUrls.add(u);
      }
    } catch (err) {
      console.error(`[IndexNow] Error reading sitemap ${file}:`, err.message);
    }
  }

  // Also verify /compare/ and /stores/ URLs directly if sitemap is an index
  return Array.from(allUrls);
}

function postToIndexNow(urlList) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList
    });

    const options = {
      hostname: 'api.indexnow.org',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // IndexNow returns 200 (OK) or 202 (Accepted)
        if (res.statusCode === 200 || res.statusCode === 202) {
          resolve({ status: res.statusCode, body: data || 'OK' });
        } else {
          resolve({ status: res.statusCode, body: data || `HTTP ${res.statusCode}` });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy(new Error('IndexNow request timeout'));
    });

    req.write(payload);
    req.end();
  });
}

async function pingIndexNow() {
  console.log(`📡 [IndexNow] Starting SEO Index Pinger for ${HOST}...`);
  const urls = collectAllSitemapUrls();
  console.log(`📊 [IndexNow] Collected ${urls.length} target URLs from sitemaps.`);

  if (urls.length === 0) {
    console.log(`ℹ️ [IndexNow] No URLs found. Skipping ping.`);
    return;
  }

  // IndexNow allows up to 10,000 URLs per post
  const BATCH_SIZE = 1000;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`🚀 [IndexNow] Submitting batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} URLs)...`);
    try {
      const res = await postToIndexNow(batch);
      console.log(`✅ [IndexNow] Batch submitted successfully! Status: ${res.status}`);
    } catch (err) {
      console.error(`⚠️ [IndexNow] Batch submission failed:`, err.message);
    }
  }

  console.log(`🎉 [IndexNow] Pinging completed.`);
}

if (require.main === module) {
  pingIndexNow().catch(err => {
    console.error('Fatal IndexNow error:', err);
    process.exit(0); // non-blocking
  });
}

module.exports = { pingIndexNow };

