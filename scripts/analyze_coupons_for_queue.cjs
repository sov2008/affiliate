const fs = require('fs');
const content = fs.readFileSync('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'utf8');
const dealsMatch = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
if (dealsMatch) {
  const deals = JSON.parse(dealsMatch[1]);
  console.log('Total coupons in catalog:', deals.length);

  // Group by storeCategory
  const byCat = {};
  for (const d of deals) {
    byCat[d.storeCategory] = (byCat[d.storeCategory] || 0) + 1;
  }
  console.log('Coupons by category:', JSON.stringify(byCat, null, 2));

  // Top stores by coupon count
  const byStore = {};
  for (const d of deals) {
    byStore[d.storeName] = (byStore[d.storeName] || 0) + 1;
  }
  const topStores = Object.entries(byStore).sort((a,b) => b[1] - a[1]).slice(0, 15);
  console.log('Top stores:', topStores);
}

