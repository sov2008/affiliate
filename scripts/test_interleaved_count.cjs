const fs = require('fs');

// We will test importing and building a small script with the normalizer logic
const couponsTs = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const normTs = fs.readFileSync('deals-portal/src/utils/dealNormalizer.ts', 'utf8');

console.log('Coupons size:', couponsTs.length);
console.log('Normalizer size:', normTs.length);

