const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const search = 'export const COUPONS_DATA: CouponDeal[] =';
let idx = content.indexOf(search);
console.log('COUPONS_DATA start:', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 1000));
}

