const fs = require('fs');
const path = 'deals-portal/src/utils/dealNormalizer.ts';
let code = fs.readFileSync(path, 'utf8');

const targetFunc = `/**
 * Prioritize high-value offers and interleave merchants so that:
 * 1. Round 1: ALL unique merchants get 1 offer before ANY repeat appears (guarantees maximum catalog diversity).
 * 2. Subsequent rounds: remaining offers are interleaved with generous minimum spacing.
 */
export function diversifyDealsFeed<T extends { cleanBrand?: string; code?: string; discountBadge?: string; badge?: string }>(deals: T[]): T[] {
  const buckets = new Map<string, { brand: string; deals: T[] }>();
  for (const deal of deals) {
    const rawBrand = (deal.cleanBrand || 'unknown').trim();
    const key = rawBrand.toLowerCase();
    if (!buckets.has(key)) buckets.set(key, { brand: rawBrand, deals: [] });
    buckets.get(key)!.deals.push(deal);
  }

  // Sort inside each bucket: code first, then %/$ discount
  for (const b of buckets.values()) {
    b.deals.sort((a, bDeal) => {
      const aHasCode = a.code && a.code.trim().length > 0 ? 1 : 0;
      const bHasCode = bDeal.code && bDeal.code.trim().length > 0 ? 1 : 0;
      if (aHasCode !== bHasCode) return bHasCode - aHasCode;

      const aHasNumber = /(\\d+%|\\$\\d+|€\\d+)/.test(a.discountBadge || a.badge || '') ? 1 : 0;
      const bHasNumber = /(\\d+%|\\$\\d+|€\\d+)/.test(bDeal.discountBadge || bDeal.badge || '') ? 1 : 0;
      return bHasNumber - aHasNumber;
    });
  }

  const result: T[] = [];
  const brandKeys = Array.from(buckets.keys());

  // Priority Tier: High-intent flagship brands to headline the top of the feed
  const HEADLINE_BRANDS = [
    'hostinger', 'expressvpn', 'nordvpn', 'surfshark', 'aliexpress',
    'kaspersky', 'booking.com', 'allpowers', 'harfington', 'corsair',
    'prohoster', 'redmagic', 'adguard', 'airalo esim', 'newbalance',
    'lenovo', 'miravia es, pt', 'honor uae', 'answear', 'chicme'
  ];

  // Round 1: Take exactly 1 best deal from each unique merchant
  const round1Order = [...brandKeys].sort((a, b) => {
    const aHead = HEADLINE_BRANDS.indexOf(a);
    const bHead = HEADLINE_BRANDS.indexOf(b);
    if (aHead !== -1 && bHead !== -1) return aHead - bHead;
    if (aHead !== -1) return -1;
    if (bHead !== -1) return 1;

    // Prioritize brands with discount codes
    const aHasCode = buckets.get(a)!.deals[0]?.code ? 1 : 0;
    const bHasCode = buckets.get(b)!.deals[0]?.code ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;

    return a.localeCompare(b);
  });

  round1Order.forEach(k => {
    const b = buckets.get(k)!;
    if (b.deals.length > 0) {
      result.push(b.deals.shift()!);
    }
  });

  // Subsequent rounds: interleave remaining deals with strict spacing >= 10
  let totalRemaining = 0;
  for (const b of buckets.values()) totalRemaining += b.deals.length;

  const recentHistory = result.slice(-30).map(d => (d.cleanBrand || 'unknown').trim().toLowerCase());

  while (totalRemaining > 0) {
    const active = brandKeys.filter(k => buckets.get(k)!.deals.length > 0);
    active.sort((a, b) => {
      const aIdx = recentHistory.lastIndexOf(a);
      const bIdx = recentHistory.lastIndexOf(b);
      const aDist = aIdx === -1 ? 999 : (recentHistory.length - aIdx);
      const bDist = bIdx === -1 ? 999 : (recentHistory.length - bIdx);

      const aOk = aDist >= 10;
      const bOk = bDist >= 10;
      if (aOk !== bOk) return aOk ? -1 : 1;

      // Higher remaining count gets priority
      const aRem = buckets.get(a)!.deals.length;
      const bRem = buckets.get(b)!.deals.length;
      if (aRem !== bRem) return bRem - aRem;

      return bDist - aDist;
    });

    const chosen = active[0];
    const deal = buckets.get(chosen)!.deals.shift()!;
    result.push(deal);
    recentHistory.push(chosen);
    if (recentHistory.length > 30) recentHistory.shift();
    totalRemaining--;
  }

  return result;
}`;

// Replace from export function diversifyDealsFeed down to export const MONOGRAM_GRADIENTS
const startIdx = code.indexOf('export function diversifyDealsFeed');
const endIdx = code.indexOf('export const MONOGRAM_GRADIENTS');

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find function boundaries');
  process.exit(1);
}

// Find previous doc comment
const commentIdx = code.lastIndexOf('/**', startIdx);

code = code.substring(0, commentIdx) + targetFunc + '\r\n\r\n' + code.substring(endIdx);
fs.writeFileSync(path, code, 'utf8');
console.log('Successfully updated diversifyDealsFeed in dealNormalizer.ts');

