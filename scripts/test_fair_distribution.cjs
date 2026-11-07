const fs = require('fs');

const couponsFile = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const jsonMatch = couponsFile.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

function distributeFair(items) {
  // Group by brand
  const buckets = new Map();
  items.forEach(item => {
    const b = (item.storeName || item.merchant || 'unknown').trim();
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b).push(item);
  });

  const result = [];
  const brandList = Array.from(buckets.keys());

  // Round 1: Take the BEST 1 offer from EVERY brand! (Guarantees all 300+ stores are shown before any repeats!)
  // Sort brands in Round 1: e.g. popular/reputable brands first, or highest discounts
  const round1Brands = [...brandList].sort((a, b) => {
    // If a brand has codes, prioritize
    const aHasCode = buckets.get(a).some(x => x.code && x.code.trim().length > 0) ? 1 : 0;
    const bHasCode = buckets.get(b).some(x => x.code && x.code.trim().length > 0) ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    return a.localeCompare(b);
  });

  round1Brands.forEach(b => {
    const list = buckets.get(b);
    if (list.length > 0) {
      result.push(list.shift());
    }
  });

  console.log(`Round 1 finished: ${result.length} unique stores in the first ${result.length} positions!`);

  // Subsequent rounds: interleave remaining offers with minimum distance >= 12
  let remainingCount = 0;
  for (const list of buckets.values()) remainingCount += list.length;

  const recentHistory = result.slice(-20).map(x => (x.storeName || x.merchant || '').trim());

  while (remainingCount > 0) {
    const active = brandList.filter(b => buckets.get(b).length > 0);
    active.sort((a, b) => {
      const aIdx = recentHistory.lastIndexOf(a);
      const bIdx = recentHistory.lastIndexOf(b);
      const aDist = aIdx === -1 ? 999 : (recentHistory.length - aIdx);
      const bDist = bIdx === -1 ? 999 : (recentHistory.length - bIdx);

      const aAllowed = aDist >= 12;
      const bAllowed = bDist >= 12;
      if (aAllowed !== bAllowed) return aAllowed ? -1 : 1;

      // prioritize higher remaining
      const aRem = buckets.get(a).length;
      const bRem = buckets.get(b).length;
      if (aRem !== bRem) return bRem - aRem;

      return bDist - aDist;
    });

    const chosen = active[0];
    const deal = buckets.get(chosen).shift();
    result.push(deal);
    recentHistory.push(chosen);
    if (recentHistory.length > 25) recentHistory.shift();
    remainingCount--;
  }

  return result;
}

const fairList = distributeFair(coupons);
console.log(`Total distributed: ${fairList.length}`);

// Check first 42 cards
console.log('First 42 cards stores:');
const first42Stores = fairList.slice(0, 42).map(x => x.storeName || x.merchant);
console.log(first42Stores);

// Check if any duplicates in first 42:
const set42 = new Set(first42Stores);
console.log(`Unique stores in first 42: ${set42.size} (Duplicates: ${42 - set42.size})`);

