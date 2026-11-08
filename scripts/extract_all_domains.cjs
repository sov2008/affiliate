const fs = require('fs');

const code = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

// Match stores
const stores = [];
const storeRegex = /"slug":\s*"([^"]+)"[\s\S]*?"name":\s*"([^"]+)"[\s\S]*?"websiteUrl":\s*"([^"]+)"/g;
let m;
while ((m = storeRegex.exec(code)) !== null) {
  try {
    const u = new URL(m[3]);
    const host = u.hostname.replace(/^www\./, '');
    stores.push({ slug: m[1], name: m[2], websiteUrl: m[3], domain: host });
  } catch {}
}

console.log('Total extracted store domains:', stores.length);
console.log('Sample:', stores.slice(0, 5));

