const fs = require('fs');
const path = 'deals-portal/src/data/couponsData.ts';
const content = fs.readFileSync(path, 'utf8');
const jsonMatch = content.match(/export const COUPONS_DATA[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
const coupons = JSON.parse(jsonMatch[1]);

// 1. Deduplicate by fingerprint
const seenFingerprints = new Set();
const deduped = [];
coupons.forEach(deal => {
  const fp = `${deal.storeSlug}::${deal.discountBadge}::${(deal.code || '').toLowerCase()}::${deal.title.toLowerCase().slice(0, 30)}`;
  if (!seenFingerprints.has(fp)) {
    seenFingerprints.add(fp);
    deduped.push(deal);
  }
});
console.log(`After deduplication: ${deduped.length} deals (from ${coupons.length})`);

// 2. Group by storeSlug and test Round-Robin Pass Ordering
const storeBuckets = new Map();
deduped.forEach(deal => {
  const slug = deal.storeSlug || 'unknown';
  if (!storeBuckets.has(slug)) {
    storeBuckets.set(slug, []);
  }
  storeBuckets.get(slug).push(deal);
});

console.log(`Unique stores: ${storeBuckets.size}`);

// Sort each store's deals by quality/discount descending
storeBuckets.forEach((list, slug) => {
  list.sort((a, b) => {
    const aHasCode = a.code && a.code.trim().length > 0 ? 1 : 0;
    const bHasCode = b.code && b.code.trim().length > 0 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    const aNum = /(\d+)%/.exec(a.discountBadge || '')?.[1] ? parseInt(RegExp.$1, 10) : 0;
    const bNum = /(\d+)%/.exec(b.discountBadge || '')?.[1] ? parseInt(RegExp.$1, 10) : 0;
    return bNum - aNum;
  });
});

// Pass 1: take #1 from every store
// Pass 2: take #2 from every store
// etc.
const roundRobinDeals = [];
let pass = 0;
let hasMore = true;

const storeSlugs = Array.from(storeBuckets.keys());

while (hasMore) {
  hasMore = false;
  for (const slug of storeSlugs) {
    const list = storeBuckets.get(slug);
    if (pass < list.length) {
      roundRobinDeals.push(list[pass]);
      if (pass + 1 < list.length) {
        hasMore = true;
      }
    }
  }
  pass++;
}

console.log(`Round-robin total deals: ${roundRobinDeals.length}`);

// Verify adjacency: check if ANY two adjacent cards have the same storeSlug
let adjacentViolations = 0;
for (let i = 0; i < roundRobinDeals.length - 1; i++) {
  if (roundRobinDeals[i].storeSlug === roundRobinDeals[i + 1].storeSlug) {
    adjacentViolations++;
    console.log(`Adjacent violation at ${i}: ${roundRobinDeals[i].storeSlug}`);
  }
}
console.log(`Total adjacent store violations: ${adjacentViolations}`);

