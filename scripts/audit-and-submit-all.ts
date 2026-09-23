import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UrlAuditResult {
  url: string;
  status: number;
  statusText: string;
  isIndexable: boolean;
  robotsMeta: string | null;
  hasCanonical: boolean;
  canonicalUrl: string | null;
  hasTitle: boolean;
  title: string | null;
  issues: string[];
}

async function auditUrl(url: string): Promise<UrlAuditResult> {
  const result: UrlAuditResult = {
    url,
    status: 0,
    statusText: '',
    isIndexable: false,
    robotsMeta: null,
    hasCanonical: false,
    canonicalUrl: null,
    hasTitle: false,
    title: null,
    issues: []
  };

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'manual'
    });

    result.status = res.status;
    result.statusText = res.statusText;

    // Check X-Robots-Tag header
    const xRobots = res.headers.get('x-robots-tag');
    if (xRobots && xRobots.includes('noindex')) {
      result.issues.push(`HTTP Header X-Robots-Tag contains noindex: "${xRobots}"`);
    }

    if (res.status !== 200) {
      result.issues.push(`HTTP Status is ${res.status} (expected 200)`);
      return result;
    }

    const html = await res.text();

    // Check robots meta tag
    const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']robots["']/i);
    if (robotsMatch) {
      result.robotsMeta = robotsMatch[1];
      if (result.robotsMeta.toLowerCase().includes('noindex')) {
        result.issues.push(`Meta robots tag contains noindex: "${result.robotsMeta}"`);
      }
    } else {
      result.issues.push('Missing meta robots tag');
    }

    // Check canonical link
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) ||
                           html.match(/<link[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i);
    if (canonicalMatch) {
      result.hasCanonical = true;
      result.canonicalUrl = canonicalMatch[1];
    } else {
      result.issues.push('Missing canonical link tag');
    }

    // Check title tag
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (titleMatch && titleMatch[1].trim()) {
      result.hasTitle = true;
      result.title = titleMatch[1].trim();
    } else {
      result.issues.push('Missing or empty <title> tag');
    }

    result.isIndexable = result.status === 200 &&
                         result.issues.filter(i => i.includes('noindex')).length === 0;

  } catch (err: any) {
    result.issues.push(`Fetch failed: ${err.message}`);
  }

  return result;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   FLIRTCHECK SEO & INDEXATION MASTER AUDIT // 2026 ENGINE            ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  // 1. Verify robots.txt
  console.log('--- 1. Auditing robots.txt ---');
  const robotsRes = await fetch('https://flirtcheck.site/robots.txt');
  const robotsTxt = await robotsRes.text();
  console.log(`HTTP Status: ${robotsRes.status}`);
  console.log('Content:\n' + robotsTxt.trim());

  if (robotsTxt.includes('Disallow: /go')) {
    console.error('❌ ERROR: robots.txt still disallows /go!');
  } else {
    console.log('✅ robots.txt cleanly allows crawling without blocking /go.');
  }

  // 2. Extract URLs from sitemap
  console.log('\n--- 2. Loading sitemap-0.xml ---');
  const sitemapPath = path.resolve(__dirname, '../blog/dist/sitemap-0.xml');
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const urlMatches = sitemapXml.match(/<loc>(https:\/\/[^<]+)<\/loc>/g) || [];
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));
  console.log(`Discovered ${urls.length} URLs in sitemap.`);

  // 3. Audit each URL
  console.log('\n--- 3. Auditing each URL for Indexability ---');
  let indexableCount = 0;
  let failedCount = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const audit = await auditUrl(url);

    if (audit.isIndexable && audit.issues.length === 0) {
      indexableCount++;
      console.log(`[${i + 1}/${urls.length}] ✅ 200 OK | Indexable | ${url}`);
    } else {
      failedCount++;
      console.log(`[${i + 1}/${urls.length}] ⚠️ ISSUES at ${url}:`);
      for (const issue of audit.issues) {
        console.log(`       - ${issue}`);
      }
    }
  }

  console.log(`\nAudit Summary: ${indexableCount} / ${urls.length} pages 100% indexable.`);

  // 4. Submit to IndexNow
  console.log('\n--- 4. Submitting all 53 URLs to IndexNow (Bing, Yandex, Seznam, Naver) ---');
  const indexNowKey = 'e2d6b384a51e44f8b03046f890cf51a2';
  const host = 'flirtcheck.site';
  const keyLocation = `https://${host}/${indexNowKey}.txt`;

  const payload = {
    host,
    key: indexNowKey,
    keyLocation,
    urlList: urls
  };

  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://yandex.com/indexnow'
  ];

  for (const ep of endpoints) {
    try {
      console.log(`Submitting batch to ${ep}...`);
      const postRes = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload)
      });
      console.log(`   Response: ${postRes.status} ${postRes.statusText}`);
      if (postRes.status === 200 || postRes.status === 202) {
        console.log(`   ✅ Success! All ${urls.length} URLs accepted by ${ep}`);
      } else {
        const body = await postRes.text();
        console.log(`   ⚠️ Notice (${postRes.status}): ${body}`);
      }
    } catch (err: any) {
      console.error(`   ❌ Failed to submit to ${ep}:`, err.message);
    }
  }

  // 5. Ping Sitemaps
  console.log('\n--- 5. Pinging Search Engine Sitemap Endpoints ---');
  const sitemapUrl = 'https://flirtcheck.site/sitemap-index.xml';
  const pingUrls = [
    { engine: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { engine: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` }
  ];

  for (const p of pingUrls) {
    try {
      console.log(`Pinging ${p.engine} with ${sitemapUrl}...`);
      const pRes = await fetch(p.url, { method: 'GET' });
      console.log(`   ${p.engine} Response: ${pRes.status} ${pRes.statusText}`);
    } catch (err: any) {
      console.log(`   ${p.engine} Ping notice: ${err.message}`);
    }
  }

  console.log('\n🏁 Complete SEO Audit & Indexation Dispatch Finished!');
}

main().catch(console.error);
