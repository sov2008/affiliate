const fs = require('fs');
const content = fs.readFileSync('/var/www/affiliate/deals-portal/src/data/couponsData.ts', 'utf8');
const dealsMatch = content.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);/);
if (dealsMatch) {
  const deals = JSON.parse(dealsMatch[1]);
  // Filter only high quality real merchant names
  const cleanDeals = deals.filter(d => 
    !d.storeName.includes('Term') && 
    !d.storeName.includes('Commission') && 
    !d.storeName.includes('Clone') &&
    !d.storeName.includes('|')
  );
  console.log('Clean verified deals count:', cleanDeals.length);
  const stores = {};
  for (const d of cleanDeals) {
    if (!stores[d.storeSlug]) {
      stores[d.storeSlug] = {
        name: d.storeName,
        category: d.storeCategory,
        count: 0,
        bestDiscount: d.discountBadge
      };
    }
    stores[d.storeSlug].count++;
  }
  console.log('Unique verified stores:', Object.keys(stores).length);
  console.log('Sample stores:\n', JSON.stringify(Object.values(stores).slice(0, 20), null, 2));
}

