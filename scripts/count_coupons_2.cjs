const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const couponMatches = content.match(/affiliateUrl:/g);
console.log('Total coupons with affiliateUrl:', couponMatches ? couponMatches.length : 0);

const storeMatches = content.match(/canonicalBrand:/g);
console.log('Total stores with canonicalBrand:', storeMatches ? storeMatches.length : 0);

