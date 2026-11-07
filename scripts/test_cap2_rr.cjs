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

// Group by storeSlug and cap at max 2 offers per store for the homepage grid!
const storeBuckets = new Map();
deduped.forEach(deal => {
  const slug = deal.storeSlug || 'unknown';
  if (!storeBuckets.has(slug)) {
    storeBuckets.set(slug, []);
  }
  storeBuckets.get(slug).push(deal);
});

// Cap at max 2
const cappedStoreBuckets = new Map();
storeBuckets.forEach((list, slug) => {
  // Sort by quality
  list.sort((a, b) => {
    const aHasCode = a.code && a.code.trim().length > 0 ? 1 : 0;
    const bHasCode = b.code && b.code.trim().length > 0 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    const aNum = /(\d+)%/.exec(a.discountBadge || '')?.[1] ? parseInt(RegExp.$1, 10) : 0;
    const bNum = /(\d+)%/.exec(b.discountBadge || '')?.[1] ? parseInt(RegExp.$1, 10) : 0;
    return bNum - aNum;
  });
  cappedStoreBuckets.set(slug, list.slice(0, 2));
});

// Round Robin:
// Pass 1: take deal #0 from each store
// Pass 2: take deal #1 from each store
const pass1 = [];
const pass2 = [];

cappedStoreBuckets.forEach((list, slug) => {
  if (list[0]) pass1.push(list[0]);
  if (list[1]) pass2.push(list[1]);
});

console.log(`Pass 1 stores: ${pass1.length}`);
console.log(`Pass 2 stores: ${pass2.length}`);
console.log(`Total homepage deals: ${pass1.length + pass2.length}`);

// Combine pass1 and pass2
const homepageDeals = [...pass1, ...pass2];

// Check adjacent violations
let adjacentViolations = 0;
for (let i = 0; i < homepageDeals.length - 1; i++) {
  if (homepageDeals[i].storeSlug === homepageDeals[i + 1].storeSlug) {
    adjacentViolations++;
    console.log(`Adjacent violation at ${i}: ${homepageDeals[i].storeSlug}`);
  }
}
console.log(`Total adjacent violations with Cap 2 + Round-Robin: ${adjacentViolations}`);

