const fs = require('fs');
const p = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(p, 'utf8');

const sEnrich = content.indexOf('const validCouponsData = COUPONS_DATA.filter(d => !isJunkTestOffer(d.storeName, d.title));');
const eEnrich = content.indexOf('const topStoreDealIds = new Set<string>();');

if (sEnrich !== -1 && eEnrich !== -1) {
  const newEnrich = const validCouponsData = COUPONS_DATA.filter(d => !isJunkTestOffer(d.storeName, d.title));

// 1. Strict Offer Deduplication via Composite Fingerprint
const seenDealFps = new Set<string>();
const deduplicatedCoupons = validCouponsData.filter(deal => {
  const fp = \\::\::\::\\;
  if (seenDealFps.has(fp)) return false;
  seenDealFps.add(fp);
  return true;
});

// Pre-resolve merchant identity and discount badge for every coupon
const enrichedDeals = deduplicatedCoupons.map(d => {
  const identity = resolveMerchantIdentity(d);
  const smartBadge = extractSmartDiscountBadge(d.discountBadge, d.title);
  const canonicalSlug = getCanonicalStoreSlug(identity.brand);
  const smartCategory = resolveSmartCategory(d.storeCategory, identity.brand, d.title);
  return {
    ...d,
    cleanBrand: identity.brand,
    canonicalSlug,
    smartCategory,
    resolvedDomain: identity.domain,
    cleanBadge: smartBadge
  };
});

// Count total coupons per resolved clean brand for  +X more [Brand] deals →
const storeCouponCounts: Record<string, number> = {};
for (const d of enrichedDeals) {
  storeCouponCounts[d.cleanBrand] = (storeCouponCounts[d.cleanBrand] || 0) + 1;
}

// 2. Homepage Brand Diversity: Group by store, sort by best offer, cap at max 2 offers per store, and interleave Round-Robin
const storeBuckets = new Map<string, typeof enrichedDeals>();
for (const deal of enrichedDeals) {
  const key = (deal.canonicalSlug || deal.storeSlug).toLowerCase();
  if (!storeBuckets.has(key)) storeBuckets.set(key, []);
  storeBuckets.get(key)!.push(deal);
}

// Sort deals within each store bucket: offers with promo code first, then highest discount
for (const bucket of storeBuckets.values()) {
  bucket.sort((a, b) => {
    const aHasCode = a.code && a.code.length > 0 ? 1 : 0;
    const bHasCode = b.code && b.code.length > 0 ? 1 : 0;
    if (aHasCode !== bHasCode) return bHasCode - aHasCode;
    const aNum = parseInt((a.cleanBadge.match(/\\d+/) || ['0'])[0], 10);
    const bNum = parseInt((b.cleanBadge.match(/\\d+/) || ['0'])[0], 10);
    return bNum - aNum;
  });
}

// Priority flagship headliners
const HEADLINE_SLUGS = [
  'hostinger', 'expressvpn', 'nordvpn', 'surfshark', 'aliexpress',
  'kaspersky', 'booking.com', 'allpowers', 'harfington', 'corsair',
  'prohoster', 'redmagic', 'adguard', 'airalo', 'newbalance',
  'lenovo', 'miravia-es-pt', 'honor-uae', 'answear', 'chicme'
];

const sortedStoreKeys = Array.from(storeBuckets.keys()).sort((a, b) => {
  const aIdx = HEADLINE_SLUGS.indexOf(a);
  const bIdx = HEADLINE_SLUGS.indexOf(b);
  if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
  if (aIdx !== -1) return -1;
  if (bIdx !== -1) return 1;
  const aCode = storeBuckets.get(a)![0]?.code ? 1 : 0;
  const bCode = storeBuckets.get(b)![0]?.code ? 1 : 0;
  if (aCode !== bCode) return bCode - aCode;
  return a.localeCompare(b);
});

// Round-Robin Interleaving: Pass 1 (deal #1 of each store), Pass 2 (deal #2 of stores that have a 2nd)
const interleavedDeals: typeof enrichedDeals = [];
for (const key of sortedStoreKeys) {
  const deals = storeBuckets.get(key)!;
  if (deals.length > 0) interleavedDeals.push(deals[0]);
}
for (const key of sortedStoreKeys) {
  const deals = storeBuckets.get(key)!;
  if (deals.length > 1) interleavedDeals.push(deals[1]);
}

// 3. In-Grid Creative Banners: Strictly deduplicate by image and id, and round-robin across partner brands
const rawBanners = homeRotatorBanners.rectangles || [];
const seenBannerImgs = new Set<string>();
const seenBannerIds = new Set<string>();
const uniqueBannerList: typeof rawBanners = [];

for (const b of rawBanners) {
  const img = b.src || b.imageUrl || b.image;
  const bId = b.id || b.name || img;
  if (!img || seenBannerImgs.has(img) || seenBannerIds.has(bId)) continue;
  seenBannerImgs.add(img);
  seenBannerIds.add(bId);
  uniqueBannerList.push(b);
}

// Round-robin banners by partnerSlug to prevent adjacent same-brand banners
const bannerPartnerBuckets = new Map<string, typeof rawBanners>();
for (const b of uniqueBannerList) {
  const p = b.partnerSlug || 'other';
  if (!bannerPartnerBuckets.has(p)) bannerPartnerBuckets.set(p, []);
  bannerPartnerBuckets.get(p)!.push(b);
}

const inGridPartnerBanners: typeof rawBanners = [];
let bannerRemaining = true;
let bannerRound = 0;
while (bannerRemaining) {
  bannerRemaining = false;
  for (const list of bannerPartnerBuckets.values()) {
    if (list.length > bannerRound) {
      inGridPartnerBanners.push(list[bannerRound]);
      bannerRemaining = true;
    }
  }
  bannerRound++;
}

;
  content = content.slice(0, sEnrich) + newEnrich + content.slice(eEnrich);
  fs.writeFileSync(p, content, 'utf8');
  console.log('Updated deduplication, Cap 2 RR, and unique banners successfully!');
} else {
  console.log('Target not found', sEnrich, eEnrich);
}