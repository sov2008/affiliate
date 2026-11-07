const fs = require('fs');
const path = 'deals-portal/src/data/couponsData.ts';
const content = fs.readFileSync(path, 'utf8');
const jsonMatch = content.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

console.log('Total coupons:', coupons.length);

const storeOfferCount = {};
coupons.forEach(c => {
  const store = c.storeSlug || c.storeName;
  storeOfferCount[store] = (storeOfferCount[store] || 0) + 1;
});

// Check DHGate, ALLPOWERS, TEMU, AliExpress
['dhgate', 'allpowers', 'temu', 'aliexpress', 'prohoster', 'corsair', 'harfington'].forEach(s => {
  console.log(`${s}: ${storeOfferCount[s] || 0} offers`);
});

