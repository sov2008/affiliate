const fs = require('fs');
const file = 'deals-portal/src/utils/dealNormalizer.ts';
let code = fs.readFileSync(file, 'utf8');

const oldFuncStart = code.indexOf('export function diversifyDealsFeed');
const oldFuncEnd = code.indexOf('export const MONOGRAM_GRADIENTS');

const newFunc = `export function diversifyDealsFeed<T extends { cleanBrand?: string; code?: string; discountBadge?: string; badge?: string }>(deals: T[]): T[] {
  // Sort each merchant's deals: codes & explicit discounts first
  const buckets = new Map<string, T[]>();
  for (const deal of deals) {
    const key = (deal.cleanBrand || 'unknown').toLowerCase();
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(deal);
  }

  // Sort inside each bucket: code first, then %/$ discount
  for (const list of buckets.values()) {
    list.sort((a, b) => {
      const aHasCode = a.code && a.code.trim().length > 0 ? 1 : 0;
      const bHasCode = b.code && b.code.trim().length > 0 ? 1 : 0;
      if (aHasCode !== bHasCode) return bHasCode - aHasCode;

      const aHasNumber = /(\\d+%|\\$\\d+)/.test(a.discountBadge || a.badge || '') ? 1 : 0;
      const bHasNumber = /(\\d+%|\\$\\d+)/.test(b.discountBadge || b.badge || '') ? 1 : 0;
      return bHasNumber - aHasNumber;
    });
  }

  const result: T[] = [];
  const brandList = Array.from(buckets.keys());
  const MIN_SPACING = 4;
  const recentHistory: string[] = [];
  let totalRemaining = deals.length;

  // Compute pacing target for each brand so dominant brands don't bunch at the end
  const totalCount = deals.length;
  const brandFrequency = new Map<string, number>();
  for (const b of brandList) {
    const count = buckets.get(b)!.length;
    const idealInterval = Math.max(MIN_SPACING, Math.floor(totalCount / Math.max(1, count)));
    brandFrequency.set(b, idealInterval);
  }

  while (totalRemaining > 0) {
    const activeBrands = brandList.filter(b => buckets.get(b)!.length > 0);

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

      // Prioritize higher relative remaining count (drain large queues smoothly)
      const aRem = buckets.get(a)!.length;
      const bRem = buckets.get(b)!.length;
      if (aRem !== bRem) {
        return bRem - aRem;
      }

      return bDist - aDist;
    });

    const chosenBrand = activeBrands[0];
    const deal = buckets.get(chosenBrand)!.shift()!;
    result.push(deal);
    recentHistory.push(chosenBrand);
    if (recentHistory.length > 25) {
      recentHistory.shift();
    }
    totalRemaining--;
  }

  return result;
}

`;

code = code.slice(0, oldFuncStart) + newFunc + code.slice(oldFuncEnd);
fs.writeFileSync(file, code, 'utf8');
console.log('Successfully updated dealNormalizer.ts!');

