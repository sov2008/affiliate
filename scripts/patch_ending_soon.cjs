const fs = require('fs');
const p = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(p, 'utf8');
const sExp = content.indexOf('const TARGET_EXPIRING_SLUGS =');
const eExp = content.indexOf('const validCouponsData =');
if (sExp !== -1 && eExp !== -1) {
  const newExp = `const TARGET_EXPIRING_SLUGS = [
  'vogacloset', 'keepersecurity', 'allpowers', 'alibaba',
  'hostinger', 'expressvpn', 'qustodio', 'touch', 'polis',
  'onlinesim', 'airalo', 'dabdoob', 'honor-uae', 'answear',
  'casetify', 'redmagic', 'harfington', 'corsair'
];
const endingSoonDeals: typeof COUPONS_DATA = [];
const pickedStoreSlugs = new Set<string>();

for (const slug of TARGET_EXPIRING_SLUGS) {
  const match = COUPONS_DATA.find(d => d.storeSlug === slug && d.code && d.code.length > 0 && !pickedStoreSlugs.has(d.storeSlug));
  if (match) {
    endingSoonDeals.push(match);
    pickedStoreSlugs.add(match.storeSlug);
  }
}

for (const d of COUPONS_DATA) {
  if (endingSoonDeals.length >= 16) break;
  if (d.code && d.code.length > 0 && !pickedStoreSlugs.has(d.storeSlug) && !isJunkTestOffer(d.storeName, d.title)) {
    pickedStoreSlugs.add(d.storeSlug);
    endingSoonDeals.push(d);
  }
}

`;
  content = content.slice(0, sExp) + newExp + content.slice(eExp);
  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated endingSoonDeals pool successfully!');
}
