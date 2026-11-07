const fs = require('fs');
const path = 'deals-portal/src/data/couponsData.ts';
const content = fs.readFileSync(path, 'utf8');
const jsonMatch = content.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

const seenFingerprints = new Set();
let duplicates = 0;

coupons.forEach(deal => {
  const fp = `${deal.storeSlug}::${deal.discountBadge}::${(deal.code || '').toLowerCase()}::${deal.title.toLowerCase().slice(0, 30)}`;
  if (seenFingerprints.has(fp)) {
    duplicates++;
    console.log(`Duplicate found: ${deal.storeName} (${deal.storeSlug}): ${deal.title}`);
  } else {
    seenFingerprints.add(fp);
  }
});

console.log(`Total duplicates by fingerprint: ${duplicates} out of ${coupons.length}`);

