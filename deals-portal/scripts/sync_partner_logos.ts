import { STORES_DATA, COUPONS_DATA } from '../src/data/couponsData';
import { getUniqueCleanStores } from '../src/utils/dealNormalizer';
import { STORE_DOMAINS_MAP, getStoreDomain } from '../src/data/storeDomains';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOGOS_DIR = path.join(__dirname, '../public/logos');
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

function fetchBuffer(url: string, timeout = 7000): Promise<Buffer | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const getter = parsed.protocol === 'https:' ? https : http;
      const req = getter.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        },
        timeout
      }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          let redir = res.headers.location;
          if (redir.startsWith('/')) {
            redir = `${parsed.protocol}//${parsed.host}${redir}`;
          }
          fetchBuffer(redir, timeout).then(resolve);
          return;
        }

        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          // Check that buffer is non-trivial (> 200 bytes)
          if (buf.length > 200) {
            resolve(buf);
          } else {
            resolve(null);
          }
        });
        res.on('error', () => resolve(null));
      });

      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

async function fetchLogoForDomain(domain: string, slug: string): Promise<boolean> {
  const destPath = path.join(LOGOS_DIR, `${slug}.png`);
  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.size > 200) {
      return true; // Already downloaded
    }
  }

  // Tier 1: Google HD Favicon 128px
  const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  let buf = await fetchBuffer(googleFaviconUrl);

  // Tier 2: DuckDuckGo favicon fallback if Google fails
  if (!buf) {
    const ddgUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    buf = await fetchBuffer(ddgUrl);
  }

  if (buf && buf.length > 200) {
    fs.writeFileSync(destPath, buf);
    return true;
  }

  return false;
}

async function run() {
  console.log('🚀 Starting forced partner logos search, processing & installation...');
  const cleanStores = getUniqueCleanStores(STORES_DATA, COUPONS_DATA);
  console.log(`📋 Total clean canonical stores to process: ${cleanStores.length}`);

  let successCount = 0;
  let fallbackCount = 0;

  // Process in concurrency batches of 10
  const concurrency = 10;
  for (let i = 0; i < cleanStores.length; i += concurrency) {
    const batch = cleanStores.slice(i, i + concurrency);
    await Promise.all(batch.map(async (store) => {
      const brand = store.canonicalBrand;
      const slug = store.slug;
      const domain = getStoreDomain(brand) || getStoreDomain(slug) || store.domain || '';
      
      if (!domain) {
        console.warn(`⚠️ [No Domain] ${brand} (${slug})`);
        fallbackCount++;
        return;
      }

      const ok = await fetchLogoForDomain(domain, slug);
      if (ok) {
        successCount++;
      } else {
        console.warn(`❌ [Failed to fetch logo] ${brand} -> ${domain}`);
        fallbackCount++;
      }
    }));
    process.stdout.write(`⏳ Processed ${Math.min(i + concurrency, cleanStores.length)} / ${cleanStores.length} stores...\r`);
  }

  console.log('\n=============================================');
  console.log(`✅ Finished logos synchronization!`);
  console.log(`🖼️ Local logos installed successfully: ${successCount}`);
  console.log(`⚠️ Fallback/monogram stores: ${fallbackCount}`);
  console.log(`📁 Target directory: ${LOGOS_DIR}`);
  console.log('=============================================');
}

run();
