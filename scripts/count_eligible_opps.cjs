const fs = require('fs');

const opps = JSON.parse(fs.readFileSync('artifacts_awin/awin_scored_opportunities.json', 'utf8'));
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const existingSlugs = new Set();
const slugRegex = /"slug":\s*"([^"]+)"/g;
let m;
while ((m = slugRegex.exec(content)) !== null) existingSlugs.add(m[1]);
const altSlugRegex = /slug:\s*'([^']+)'/g;
while ((m = altSlugRegex.exec(content)) !== null) existingSlugs.add(m[1]);

console.log('Total scored opps:', opps.length);
console.log('Already in couponsData.ts:', existingSlugs.size);

let eligibleCount = 0;
const seen = new Set();
for (const o of opps) {
  if (!o.displayUrl || !o.logoUrl) continue;
  if (o.name.includes('Test Account') || o.name.includes('Closed') || o.name.includes('suspended')) continue;
  const slug = o.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug || slug.length < 3 || existingSlugs.has(slug) || seen.has(slug)) continue;
  seen.add(slug);
  eligibleCount++;
}
console.log('Available unadded eligible candidates with verified logos:', eligibleCount);

