const fs = require('fs');

function testDiversify(deals) {
  const buckets = new Map();
  for (const deal of deals) {
    const key = (deal.cleanBrand || 'unknown').toLowerCase();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(deal);
  }

  // Sort inside each bucket: code first, then discount
  for (const list of buckets.values()) {
    list.sort((a, b) => {
      const aHasCode = a.code && a.code.trim().length > 0 ? 1 : 0;
      const bHasCode = b.code && b.code.trim().length > 0 ? 1 : 0;
      if (aHasCode !== bHasCode) return bHasCode - aHasCode;
      const aHasNumber = /(\d+%|\$\d+)/.test(a.discountBadge || a.badge || '') ? 1 : 0;
      const bHasNumber = /(\d+%|\$\d+)/.test(b.discountBadge || b.badge || '') ? 1 : 0;
      return bHasNumber - aHasNumber;
    });
  }

  const result = [];
  const brandList = Array.from(buckets.keys());

  // We want to interleave brands so that:
  // 1. Diverse brands appear throughout the whole feed (not just AliExpress, ProHoster at the top).
  // 2. High-volume brands (like AliExpress with 183 deals) are metered and paced so they appear at most once every 5 cards,
  //    distributing them smoothly across all 933 items (183 * 5 = ~915 items).
  const MIN_SPACING = 4;
  const recentHistory = []; // stores last N brands

  let totalDeals = deals.length;
  let round = 0;

  // Compute total deals and frequency target for each brand
  const totalCount = deals.length;
  const brandFrequency = new Map();
  for (const b of brandList) {
    const count = buckets.get(b).length;
    // Pacing interval: if count is 183 in 933, interval should be roughly 933/183 ~ 5.
    const idealInterval = Math.max(MIN_SPACING, Math.floor(totalCount / Math.max(1, count)));
    brandFrequency.set(b, idealInterval);
  }

  while (totalDeals > 0) {
    round++;
    const activeBrands = brandList.filter(b => buckets.get(b).length > 0);

    activeBrands.sort((a, b) => {
      const aIdx = recentHistory.lastIndexOf(a);
      const bIdx = recentHistory.lastIndexOf(b);

      const aDist = aIdx === -1 ? 999 : (recentHistory.length - aIdx);
      const bDist = bIdx === -1 ? 999 : (recentHistory.length - bIdx);

      const aPacing = brandFrequency.get(a) || MIN_SPACING;
      const bPacing = brandFrequency.get(b) || MIN_SPACING;

      const aReady = aDist >= aPacing;
      const bReady = bDist >= bPacing;

      // Prioritize brands that have waited their pacing interval
      if (aReady !== bReady) {
        return aReady ? -1 : 1;
      }

      // If both ready or both not ready, check absolute MIN_SPACING
      const aAllowed = aDist >= MIN_SPACING;
      const bAllowed = bDist >= MIN_SPACING;
      if (aAllowed !== bAllowed) {
        return aAllowed ? -1 : 1;
      }

      // Prioritize higher relative remaining pressure (remaining / totalDeals)
      const aRem = buckets.get(a).length;
      const bRem = buckets.get(b).length;
      if (aRem !== bRem) {
        return bRem - aRem;
      }

      return bDist - aDist;
    });

    const chosenBrand = activeBrands[0];
    const deal = buckets.get(chosenBrand).shift();
    result.push(deal);
    recentHistory.push(chosenBrand);
    if (recentHistory.length > 25) {
      recentHistory.shift();
    }
    totalDeals--;
  }

  return result;
}

const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const deals = [];
const regex = /"id":\s*"([^"]+)",\s*"storeSlug":\s*"([^"]+)",\s*"storeName":\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(content)) !== null) {
  let brand = m[3];
  if (brand.includes('AliExpress')) brand = 'AliExpress';
  deals.push({ id: m[1], storeSlug: m[2], cleanBrand: brand });
}

console.log('Parsed deals:', deals.length);
const diversified = testDiversify(deals);

// Validation
let maxConsecutive = 0;
let minDistance = 999;
const lastSeen = {};

for (let i = 0; i < diversified.length; i++) {
  const b = diversified[i].cleanBrand;
  if (lastSeen[b] !== undefined) {
    const dist = i - lastSeen[b];
    if (dist < minDistance) minDistance = dist;
  }
  lastSeen[b] = i;
}

console.log('Min distance between identical brands anywhere in feed:', minDistance);
console.log('Sample first 24 brands in feed (first page):\n', diversified.slice(0, 24).map((d, i) => `${i + 1}. ${d.cleanBrand}`).join('\n'));
console.log('\nSample items 200-224 (mid feed):\n', diversified.slice(200, 224).map((d, i) => `${i + 201}. ${d.cleanBrand}`).join('\n'));
console.log('\nSample items 900-924 (tail feed):\n', diversified.slice(900, 924).map((d, i) => `${i + 901}. ${d.cleanBrand}`).join('\n'));
