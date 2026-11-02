const fs = require('fs');
const content = fs.readFileSync('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'utf8');
const dealsMatch = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
if (dealsMatch) {
  const deals = JSON.parse(dealsMatch[1]);
  console.log('Total coupons:', deals.length);
  const featured = deals.filter(d => ['allpowers', 'carpuride', 'hostinger', 'expressvpn', 'nordvpn', 'whokeys'].includes(d.storeSlug));
  console.log('Featured count:', featured.length);
  console.log(JSON.stringify(featured, null, 2));
} else {
  console.log('Match failed');
}

