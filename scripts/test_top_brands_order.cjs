const fs = require('fs');

const couponsFile = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const jsonMatch = couponsFile.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

function distributeFair(items) {
  const buckets = new Map();
  items.forEach(item => {
    const b = (item.storeName || item.merchant || 'unknown').trim();
    const key = b.toLowerCase();
    if (!buckets.has(key)) buckets.set(key, { name: b, deals: [] });
    buckets.get(key).deals.push(item);
  });

  // Sort inside each bucket: code first, then discount
  for (const bucket of buckets.values()) {
    bucket.deals.sort((a, b) => {
      const aCode = a.code && a.code.trim().length > 0 ? 1 : 0;
      const bCode = b.code && b.code.trim().length > 0 ? 1 : 0;
      if (aCode !== bCode) return bCode - aCode;
      const aDisc = /(\d+%|\$\d+)/.test(a.discountBadge || '') ? 1 : 0;
      const bDisc = /(\d+%|\$\d+)/.test(b.discountBadge || '') ? 1 : 0;
      return bDisc - aDisc;
    });
  }

  const result = [];
  const brandKeys = Array.from(buckets.keys());

  // Priority tier 1: Top popular brands with confirmed high interest
  const TOP_BRANDS = [
    'hostinger', 'expressvpn', 'nordvpn', 'surfshark', 'aliexpress',
    'kaspersky', 'booking.com', 'allpowers', 'harfington', 'corsair',
    'prohoster', 'redmagic', 'adguard', 'airalo esim', 'newbalance',
    'lenovo', 'miravia es, pt', 'honor uae', 'answear', 'chicme'
  ];

  // Round 1: Take 1 best offer from each brand, ordered with TOP_BRANDS first, then remaining unique brands
  const round1Order = [...brandKeys].sort((a, b) => {
    const aTop = TOP_BRANDS.indexOf(a);
    const bTop = TOP_BRANDS.indexOf(b);
    if (aTop !== -1 && bTop !== -1) return aTop - bTop;
    if (aTop !== -1) return -1;
    if (bTop !== -1) return 1;

    // Has discount code?
    const aCode = buckets.get(a).deals[0]?.code ? 1 : 0;
    const bCode = buckets.get(b).deals[0]?.code ? 1 : 0;
    if (aCode !== bCode) return bCode - aCode;

    return a.localeCompare(b);
  });

  round1Order.forEach(k => {
    const bucket = buckets.get(k);
    if (bucket.deals.length > 0) {
      result.push(bucket.deals.shift());
    }
  });

  console.log(`Round 1: ${result.length} unique merchants in the first ${result.length} cards!`);

  // Subsequent rounds: interleave remaining deals with strict spacing >= 10
  let totalRemaining = 0;
  for (const b of buckets.values()) totalRemaining += b.deals.length;

  const recentHistory = result.slice(-30).map(d => (d.storeName || d.merchant || 'unknown').trim().toLowerCase());

  while (totalRemaining > 0) {
    const active = brandKeys.filter(k => buckets.get(k).deals.length > 0);
    active.sort((a, b) => {
      const aIdx = recentHistory.lastIndexOf(a);
      const bIdx = recentHistory.lastIndexOf(b);
      const aDist = aIdx === -1 ? 999 : (recentHistory.length - aIdx);
      const bDist = bIdx === -1 ? 999 : (recentHistory.length - bIdx);

      const aOk = aDist >= 10;
      const bOk = bDist >= 10;
      if (aOk !== bOk) return aOk ? -1 : 1;

      // Higher remaining count gets priority
      const aRem = buckets.get(a).deals.length;
      const bRem = buckets.get(b).deals.length;
      if (aRem !== bRem) return bRem - aRem;

      return bDist - aDist;
    });

    const chosen = active[0];
    const deal = buckets.get(chosen).deals.shift();
    result.push(deal);
    recentHistory.push(chosen);
    if (recentHistory.length > 30) recentHistory.shift();
    totalRemaining--;
  }

  return result;
}

const list = distributeFair(coupons);
console.log('Total items in list:', list.length);
console.log('First 21 cards stores:');
for (let i = 0; i < 21; i++) {
  console.log(`  ${i+1}: ${list[i].storeName} (${list[i].discountBadge})`);
}

console.log('Cards 22 to 42 stores:');
for (let i = 21; i < 42; i++) {
  console.log(`  ${i+1}: ${list[i].storeName} (${list[i].discountBadge})`);
}

