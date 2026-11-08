const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEALS_DIR = path.resolve(ROOT_DIR, 'deals-portal');
const DATA_FILE = path.resolve(DEALS_DIR, 'src/data/couponsData.ts');
const STORE_DOMAINS_FILE = path.resolve(DEALS_DIR, 'src/data/storeDomains.ts');
const LOGOS_DIR = path.resolve(DEALS_DIR, 'public/logos');
const OPPS_FILE = path.resolve(ROOT_DIR, 'artifacts_awin/awin_scored_opportunities.json');

if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

// 1. Load Awin scored opportunities map
let oppsMap = new Map();
if (fs.existsSync(OPPS_FILE)) {
  const opps = JSON.parse(fs.readFileSync(OPPS_FILE, 'utf8'));
  for (const o of opps) {
    if (o.id && o.logoUrl) oppsMap.set(String(o.id), o);
  }
}
console.log(`Loaded ${oppsMap.size} Awin opportunities with logoUrl.`);

// 2. Read couponsData.ts
let couponsCode = fs.readFileSync(DATA_FILE, 'utf8');

// Helper to extract clean domain from URL
function extractDomain(urlStr) {
  if (!urlStr) return '';
  try {
    const u = new URL(urlStr);
    let host = u.hostname.replace(/^www\./, '').toLowerCase();
    // Exclude affiliate network domains
    if (/awin1\.com|admitad|impact\.com|rcpsj\.com|naiawork\.com|kpwfp\.com|rzekl\.com|sjv\.io/i.test(host)) {
      return '';
    }
    return host;
  } catch {
    return '';
  }
}

// 3. Scan STORES_DATA in couponsData.ts and ensure cleanDomain is explicitly populated
const storeRegex = /\{(\s*"slug":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"websiteUrl":\s*"([^"]+)"[\s\S]*?)\}/g;
let updatedCouponsCode = couponsCode;
let patchedStoresCount = 0;
const domainMappings = new Map();

// Helper to download image
function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 500) {
      return resolve(true);
    }
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, destPath).then(resolve);
      }
      if (res.statusCode !== 200) {
        return resolve(false);
      }
      const bufs = [];
      res.on('data', c => bufs.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(bufs);
        // Exclude empty or corrupt images
        if (buf.length < 300) return resolve(false);
        fs.writeFileSync(destPath, buf);
        resolve(true);
      });
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 4. Extract all store blocks
const storeBlockRegex = /\{\s*"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"websiteUrl":\s*"([^"]+)"[\s\S]*?"primaryAffiliateUrl":\s*"([^"]+)"\s*\}/g;
let m;
const storesToProcess = [];

while ((m = storeBlockRegex.exec(couponsCode)) !== null) {
  const fullBlock = m[0];
  const slug = m[1];
  const name = m[2];
  const websiteUrl = m[3];
  const primaryAffiliateUrl = m[4];
  
  const domain = extractDomain(websiteUrl);
  if (domain) {
    domainMappings.set(name, domain);
    domainMappings.set(slug, domain);
    domainMappings.set(name.toLowerCase(), domain);
    domainMappings.set(slug.toLowerCase(), domain);
  }

  // Check if Awin merchant ID is in affiliateUrl
  let awinMid = null;
  const midMatch = primaryAffiliateUrl.match(/mid=(\d+)/);
  if (midMatch) awinMid = midMatch[1];

  storesToProcess.push({
    fullBlock,
    slug,
    name,
    websiteUrl,
    domain,
    awinMid
  });
}

console.log(`Found ${storesToProcess.length} stores to check for logos and domain resolution.`);

async function main() {
  let downloadedLogosCount = 0;

  for (const st of storesToProcess) {
    const logoDest = path.join(LOGOS_DIR, `${st.slug}.png`);
    let downloaded = false;

    // Strategy 1: If it's an Awin merchant with a known profile logo
    if (st.awinMid && oppsMap.has(st.awinMid)) {
      const opp = oppsMap.get(st.awinMid);
      if (opp.logoUrl) {
        downloaded = await downloadImage(opp.logoUrl, logoDest);
        if (downloaded) downloadedLogosCount++;
      }
    }

    // Strategy 2: If no logo yet, try high-res Clearbit/Google favicon via domain
    if (!downloaded && st.domain) {
      // Try DuckDuckGo / Google S2 128px icon download to static logos
      const googleLogoUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${st.domain}&size=128`;
      downloaded = await downloadImage(googleLogoUrl, logoDest);
      if (downloaded) downloadedLogosCount++;
    }
  }

  console.log(`Downloaded and verified ${downloadedLogosCount} official merchant logos to public/logos/.`);

  // 5. Update storeDomains.ts with clean domains
  let storeDomainsContent = fs.readFileSync(STORE_DOMAINS_FILE, 'utf8');
  let addedDomainsCount = 0;

  for (const [key, dom] of domainMappings.entries()) {
    const escapedKey = JSON.stringify(key);
    if (!storeDomainsContent.includes(`${escapedKey}:`)) {
      // Insert into STORE_DOMAINS_MAP
      const insertMarker = 'export const STORE_DOMAINS_MAP: Record<string, string> = {';
      const idx = storeDomainsContent.indexOf(insertMarker);
      if (idx !== -1) {
        storeDomainsContent = 
          storeDomainsContent.slice(0, idx + insertMarker.length) + 
          `\n  ${escapedKey}: "${dom}",` + 
          storeDomainsContent.slice(idx + insertMarker.length);
        addedDomainsCount++;
      }
    }
  }

  fs.writeFileSync(STORE_DOMAINS_FILE, storeDomainsContent, 'utf8');
  console.log(`Registered ${addedDomainsCount} new merchant domains in storeDomains.ts.`);
}

main().catch(console.error);

