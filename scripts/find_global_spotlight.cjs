const fs = require('fs');
const path = 'deals-portal/src/data/couponsData.ts';
const content = fs.readFileSync(path, 'utf8');
const jsonMatch = content.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

// Let's find top Worldwide / Global deals with coupon codes
const globalDeals = coupons.filter(d => {
  // check if global or multi-region
  return d.code && d.code.length > 0;
});

console.log('Total deals with code:', globalDeals.length);
console.log('Sample worldwide stores with codes:');
const seen = new Set();
globalDeals.forEach(d => {
  if (!seen.has(d.storeSlug)) {
    seen.add(d.storeSlug);
    console.log(`  ${d.storeSlug} (${d.storeName}): ${d.discountBadge} - ${d.code}`);
  }
});

