const fs = require('fs');

const code = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

// Match all store entries in STORES_DATA
// Pattern: { "slug": "...", "name": "...", ... "websiteUrl": "...", "primaryAffiliateUrl": "..." }
const stores = [];
const storeRegex = /\{\s*"slug":\s*"([^"]+)",\s*"name":\s*"([^"]+)"[\s\S]*?"websiteUrl":\s*"([^"]+)"[\s\S]*?"primaryAffiliateUrl":\s*"([^"]+)"\s*\}/g;
let m;
while ((m = storeRegex.exec(code)) !== null) {
  stores.push({
    slug: m[1],
    name: m[2],
    websiteUrl: m[3],
    primaryAffiliateUrl: m[4]
  });
}
console.log('Parsed stores:', stores.length);
const awinStores = stores.filter(s => s.primaryAffiliateUrl.includes('awin1.com'));
console.log('Awin stores:', awinStores.length);
if (awinStores.length > 0) {
  console.log('Sample Awin store:', awinStores[0]);
}

