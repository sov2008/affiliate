/**
 * IndexNow Instant SEO Submitter
 * Submits all pages or new publications to IndexNow (Bing, Yandex, Seznam, Naver)
 * and pings Google & Bing sitemaps.
 *
 * Usage:
 *   npx tsx scripts/submit-indexnow.ts
 *   npx tsx scripts/submit-indexnow.ts --url https://flirtcheck.site/my-article/
 */

import { IndexNowService } from '../core/src/services/indexnow.service.js';

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   INDEXNOW INSTANT SUBMITTER // FLIRTCHECK SEO ACCELERATOR          ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  const service = IndexNowService.getInstance();
  const args = process.argv.slice(2);

  const urlFlagIdx = args.indexOf('--url');
  if (urlFlagIdx !== -1 && args[urlFlagIdx + 1]) {
    const singleUrl = args[urlFlagIdx + 1];
    console.log(`🎯 Submitting single URL: ${singleUrl}`);
    const report = await service.submitUrls([singleUrl]);
    console.log('\n📊 Submission Report:', JSON.stringify(report, null, 2));
    return;
  }

  console.log('📦 Extracting all URLs from production sitemap-0.xml...');
  const report = await service.submitAllFromSitemap();

  console.log(`\n📊 Batch Result: ${report.urlCount} URLs processed`);
  for (const r of report.results) {
    console.log(`   • ${r.endpoint}: ${r.success ? '✅ SUCCESS' : '❌ FAILED'} (${r.message})`);
  }

  if (report.pingResults) {
    console.log('\n📡 Sitemap Ping Results:');
    for (const p of report.pingResults) {
      console.log(`   • ${p.engine}: ${p.success ? '✅ SUCCESS' : '⚠️ NOTICE'} (Status: ${p.status || p.error})`);
    }
  }

  console.log('\n🏁 IndexNow submission cycle finished.');
}

main().catch(err => {
  console.error('❌ Fatal error during IndexNow submission:', err);
  process.exit(1);
});
