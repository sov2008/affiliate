const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const storeSlugs = new Set();
const re = /"slug":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(content)) !== null) {
  storeSlugs.add(m[1]);
}
console.log('Stores in STORES_DATA:', storeSlugs.size);
console.log('Sample slugs:', Array.from(storeSlugs).slice(0, 30));
