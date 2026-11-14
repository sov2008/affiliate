const fs = require('fs');

const couponsData = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const storesMatch = couponsData.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);\s*export const COUPONS_DATA/);
const storesData = eval(storesMatch[1]);

const couponsMatch = couponsData.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
const couponsList = eval(couponsMatch[1]);

console.log('=== AUDIT REPORT ===');
console.log('Total Stores configured:', storesData.length);
console.log('Total Coupons/Deals configured:', couponsList.length);

// Store deals distribution
const dealsPerStore = {};
couponsList.forEach(c => {
  dealsPerStore[c.storeSlug] = (dealsPerStore[c.storeSlug] || 0) + 1;
});

const storesWithoutDeals = storesData.filter(s => !dealsPerStore[s.slug]);
console.log('Stores with at least 1 deal:', Object.keys(dealsPerStore).length);
console.log('Stores with 0 deals:', storesWithoutDeals.length);

// Verify presence of tracking links (Rule 2 & Rule 5)
let invalidAffiliateUrls = 0;
couponsList.forEach(c => {
  if (!c.affiliateUrl || !c.affiliateUrl.startsWith('http')) {
    invalidAffiliateUrls++;
  }
});
console.log('Deals with valid tracking affiliate URLs:', couponsList.length - invalidAffiliateUrls, '/', couponsList.length);

// Check sports brands
const sports = ['nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok'];
console.log('--- Sports Brands Status ---');
sports.forEach(s => {
  const store = storesData.find(st => st.slug === s);
  const count = dealsPerStore[s] || 0;
  console.log(s + ':', store ? 'Profile OK (' + store.name + ')' : 'NO PROFILE', '| Deals:', count);
});

