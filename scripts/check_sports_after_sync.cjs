const fs = require('fs');

const couponsData = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');

const sportsSlugs = ['nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok'];
console.log('--- Sports stores verification ---');
sportsSlugs.forEach(s => {
  const storeFound = couponsData.includes("slug: '" + s + "'") || couponsData.includes('slug: "' + s + '"');
  console.log(s, storeFound ? 'PRESENT' : 'MISSING');
});

// Count total stores
const storeMatches = (couponsData.match(/slug:\s*['"][^'"]+['"]/g) || []).length;
console.log('Total store slug mentions in couponsData.ts:', storeMatches);

