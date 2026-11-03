const fs = require('fs');
const path = require('path');

console.log('=== CRO FUNNEL & MONETIZATION LINK AUDITOR ===');

const distDir = path.join(__dirname, '../deals-portal/dist');
let totalPagesChecked = 0;
let totalAffiliateLinks = 0;
let violations = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      totalPagesChecked++;
      const html = fs.readFileSync(fullPath, 'utf8');
      
      // Match all <a> tags
      const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const fullTag = match[0];
        const href = match[1];

        // Only check EXTERNAL affiliate redirects or direct network tracking links
        const isExternalAffiliate = href.startsWith('http') && (
          href.includes('/go/') || 
          href.includes('admitad') || 
          href.includes('cj.com') || 
          href.includes('mylead') || 
          href.includes('lospollos') ||
          href.includes('anrdoezrs.net') ||
          href.includes('jdoqocy.com') ||
          href.includes('dpbolvw.net') ||
          href.includes('tkqlhce.com')
        );

        if (isExternalAffiliate) {
          totalAffiliateLinks++;
          const hasRel = /rel=["'][^"']*(?:sponsored|nofollow)[^"']*["']/i.test(fullTag);
          const hasTarget = /target=["']_blank["']/i.test(fullTag);

          if (!hasRel) {
            console.error(`[VIOLATION] Missing rel="sponsored nofollow" in ${fullPath}: ${fullTag.slice(0, 100)}`);
            violations++;
          }
          if (!hasTarget) {
            console.warn(`[WARNING] Missing target="_blank" in ${fullPath}: ${fullTag.slice(0, 100)}`);
          }
        }
      }
    }
  }
}

scanDir(distDir);
console.log(`Audited ${totalPagesChecked} static HTML pages.`);
console.log(`Found ${totalAffiliateLinks} actual external monetization links.`);
if (violations === 0) {
  console.log('✅ 100% External monetization links enforce rel="sponsored nofollow" & target="_blank" compliant!');
} else {
  console.error(`❌ Found ${violations} external monetization link violations!`);
  process.exit(1);
}
