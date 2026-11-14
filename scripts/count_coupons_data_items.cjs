const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const search = 'export const COUPONS_DATA: CouponDeal[] =';
let idx = content.indexOf(search);
const slice = content.slice(idx);
const idMatches = slice.match(/"id":/g);
console.log('Total coupons in COUPONS_DATA:', idMatches ? idMatches.length : 0);

