const fs = require('fs');

// Read validCouponsData and test different algorithms
// In deals-portal, let's load couponsData.ts and simulate
const couponsFile = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const jsonMatch = couponsFile.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
if (!jsonMatch) {
  console.log('Could not match COUPONS_DATA');
  process.exit(1);
}

const coupons = JSON.parse(jsonMatch[1]);
console.log('Loaded coupons:', coupons.length);

// Count how many unique brands
const brands = new Map();
coupons.forEach(c => {
  const brand = (c.storeName || c.merchant || 'unknown').trim();
  brands.set(brand, (brands.get(brand) || 0) + 1);
});
console.log('Unique brands count:', brands.size);

// Sort brands by count
const sortedBrands = [...brands.entries()].sort((a,b) => b[1] - a[1]);
console.log('Top 10 brands:');
sortedBrands.slice(0, 10).forEach(([b, count]) => {
  console.log(`  ${b}: ${count} offers`);
});

