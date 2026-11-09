const fs = require('fs');

const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const storesMarker = 'export const STORES_DATA: StoreProfile[] = [';
const couponsMarker = 'export const COUPONS_DATA: CouponDeal[] = [';

const storesSection = content.slice(content.indexOf(storesMarker), content.indexOf(couponsMarker));

const slugRegex = /"slug":\s*"([^"]+)"/g;
const slugs = [];
let m;
while ((m = slugRegex.exec(storesSection)) !== null) {
  slugs.push(m[1]);
}

const seen = new Set();
const dupes = new Set();
for (const s of slugs) {
  if (seen.has(s)) dupes.add(s);
  seen.add(s);
}

console.log('Stores count in STORES_DATA:', slugs.length);
console.log('Duplicate slugs in STORES_DATA:', Array.from(dupes));

