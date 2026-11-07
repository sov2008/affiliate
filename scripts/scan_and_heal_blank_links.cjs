const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');

function checkAdmitadLive(url, timeoutMs = 6000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const mod = parsed.protocol === 'https:' ? https : http;
      mod.get(parsed, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: timeoutMs
      }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          const status = res.statusCode;
          const loc = res.headers.location;
          const len = body.length;

          // CRITICAL: An HTTP 200 with 0 bytes from Admitad tracking domains means an EXPIRED or DELETED affiliate link!
          const isEmptyZero200 = (status === 200 && len === 0);
          const isErrorStatus = (status >= 400);

          if (isEmptyZero200 || isErrorStatus) {
            resolve({ isDead: true, status, len, loc });
          } else {
            resolve({ isDead: false, status, len, loc });
          }
        });
      }).on('error', (err) => resolve({ isDead: true, error: err.message }));
    } catch (e) {
      resolve({ isDead: true, error: e.message });
    }
  });
}

async function scanAndFix() {
  console.log('🛡️ SCANNING ALL 692 COUPONS AND 268 STORES FOR BLANK / EXPIRED ZERO-BYTE AFFILIATE LINKS...');

  const content = fs.readFileSync(DATA_FILE, 'utf8');

  const storesMatch = content.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\n\];)/);
  const evalStores = new Function('return ' + storesMatch[1].replace(/;$/, ''));
  const stores = evalStores();
  const storeMap = new Map(stores.map(s => [s.slug, s]));

  const couponsMatch = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\n\];)/);
  const evalCoupons = new Function('return ' + couponsMatch[1].replace(/;$/, ''));
  let coupons = evalCoupons();

  // Find unique URLs across coupons
  const urlMap = new Map();
  coupons.forEach(c => {
    if (c.affiliateUrl) {
      if (!urlMap.has(c.affiliateUrl)) urlMap.set(c.affiliateUrl, []);
      urlMap.get(c.affiliateUrl).push(c);
    }
  });

  console.log(`Found ${urlMap.size} unique affiliate URLs to test.`);

  const uniqueUrls = Array.from(urlMap.keys());
  const concurrency = 12;
  const deadUrls = new Set();

  for (let i = 0; i < uniqueUrls.length; i += concurrency) {
    const chunk = uniqueUrls.slice(i, i + concurrency);
    const results = await Promise.all(chunk.map(async (u) => {
      const res = await checkAdmitadLive(u);
      return { url: u, res };
    }));

    for (const r of results) {
      if (r.res.isDead) {
        deadUrls.add(r.url);
        console.log(`❌ FOUND DEAD / BLANK ZERO-BYTE LINK: ${r.url} (Status: ${r.res.status}, Len: ${r.res.len})`);
      }
    }
    process.stdout.write(`\rProgress: ${Math.min(i + concurrency, uniqueUrls.length)} / ${uniqueUrls.length}`);
  }

  console.log(`\nScan complete! Found ${deadUrls.size} dead/blank affiliate URLs.`);

  // Auto-heal dead links: Replace with store's healthy primaryAffiliateUrl or official websiteUrl
  let healedCount = 0;
  coupons.forEach(c => {
    if (deadUrls.has(c.affiliateUrl)) {
      const store = storeMap.get(c.storeSlug);
      const storePrimary = store?.primaryAffiliateUrl;
      const isStorePrimaryDead = deadUrls.has(storePrimary);

      if (storePrimary && !isStorePrimaryDead) {
        c.affiliateUrl = storePrimary;
        console.log(`🩹 Healed coupon ${c.id} (${c.storeName}) -> Replaced with verified store primaryAffiliateUrl: ${storePrimary}`);
      } else if (store?.websiteUrl) {
        const sep = store.websiteUrl.includes('?') ? '&' : '?';
        c.affiliateUrl = `${store.websiteUrl}${sep}utm_source=promoradar&utm_medium=affiliate&utm_campaign=deal_card`;
        console.log(`🩹 Healed coupon ${c.id} (${c.storeName}) -> Fallback to official merchant websiteUrl with PromoRadar UTM tags: ${c.affiliateUrl}`);
      }
      healedCount++;
    }
  });

  // Also heal stores if primaryAffiliateUrl was dead
  stores.forEach(s => {
    if (s.primaryAffiliateUrl && deadUrls.has(s.primaryAffiliateUrl)) {
      const sep = (s.websiteUrl || '').includes('?') ? '&' : '?';
      s.primaryAffiliateUrl = `${s.websiteUrl || 'https://promoradar.store'}${sep}utm_source=promoradar&utm_medium=affiliate&utm_campaign=store_header`;
      console.log(`🩹 Healed store profile: ${s.name} (${s.slug}) -> Replaced primaryAffiliateUrl with official websiteUrl!`);
    }
  });

  // Write healed data back
  const updatedContent = content
    .replace(storesMatch[0], `export const STORES_DATA: StoreProfile[] = ${JSON.stringify(stores, null, 2)};`)
    .replace(couponsMatch[0], `export const COUPONS_DATA: CouponDeal[] = ${JSON.stringify(coupons, null, 2)};`);

  fs.writeFileSync(DATA_FILE, updatedContent, 'utf8');
  console.log(`🎉 Successfully healed ${healedCount} coupons in couponsData.ts!`);

  // Also fix index.astro hero slider ExpressVPN deal
  const indexPath = path.resolve(__dirname, '../deals-portal/src/pages/index.astro');
  let indexCode = fs.readFileSync(indexPath, 'utf8');
  const deadExpressUrl = 'https://ziejy.com/g/4raik6r0sq367099d2cc309c6148a0/?i=3';
  const healthyExpressUrl = 'https://ziejy.com/g/4raik6r0sq367099d2cc954d043f6e/';

  if (indexCode.includes(deadExpressUrl)) {
    indexCode = indexCode.replace(new RegExp(deadExpressUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), healthyExpressUrl);
    fs.writeFileSync(indexPath, indexCode, 'utf8');
    console.log(`🎉 Successfully updated ExpressVPN link in index.astro hero slider!`);
  }
}

scanAndFix();

