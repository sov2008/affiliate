// deals-portal/src/utils/buildInterleavedFeed.ts
import { COUPONS_DATA } from '../data/couponsData';
import homeRotatorBanners from '../data/homeRotatorBanners.json';
import {
  isJunkTestOffer,
  resolveMerchantIdentity,
  extractSmartDiscountBadge,
  getCanonicalStoreSlug,
  resolveSmartCategory
} from './dealNormalizer';
import type { EnrichedDealItem, InGridPartnerBannerItem } from './renderDealGridItem';

const HEADLINE_SLUGS = [
  'nike', 'adidas', 'puma', 'under-armour', 'new-balance', 'decathlon', 'reebok', 'vogacloset', 'hostinger', 'expressvpn', 'nordvpn', 'surfshark',
  'aliexpress', 'kaspersky', 'booking.com', 'allpowers', 'harfington',
  'corsair', 'prohoster', 'redmagic', 'adguard', 'airalo',
  'newbalance', 'lenovo', 'miravia-es-pt', 'honor-uae', 'answear', 'chicme'
];

export function getFullInterleavedCatalog(): {
  interleavedDeals: EnrichedDealItem[];
  inGridPartnerBanners: InGridPartnerBannerItem[];
  totalDeals: number;
} {
  const validCouponsData = COUPONS_DATA.filter(d => !isJunkTestOffer(d.storeName, d.title));

  const seenDealFps = new Set<string>();
  const deduplicatedCoupons = validCouponsData.filter(deal => {
    const fp = deal.storeSlug + '::' + deal.discountBadge + '::' + (deal.code || '').toLowerCase() + '::' + deal.title.toLowerCase().slice(0, 30);
    if (seenDealFps.has(fp)) return false;
    seenDealFps.add(fp);
    return true;
  });

  const enrichedDeals: EnrichedDealItem[] = deduplicatedCoupons.map(d => {
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

  const storeBuckets = new Map<string, EnrichedDealItem[]>();
  for (const deal of enrichedDeals) {
    const key = (deal.canonicalSlug || deal.storeSlug).toLowerCase();
    if (!storeBuckets.has(key)) storeBuckets.set(key, []);
    storeBuckets.get(key)!.push(deal);
  }

  for (const bucket of storeBuckets.values()) {
    bucket.sort((a, b) => {
      const aHasCode = a.code && a.code.length > 0 ? 1 : 0;
      const bHasCode = b.code && b.code.length > 0 ? 1 : 0;
      if (aHasCode !== bHasCode) return bHasCode - aHasCode;
      const aNum = parseInt((a.cleanBadge.match(/\d+/) || ['0'])[0], 10);
      const bNum = parseInt((b.cleanBadge.match(/\d+/) || ['0'])[0], 10);
      return bNum - aNum;
    });
  }

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

  const interleavedDeals: EnrichedDealItem[] = [];
  for (const key of sortedStoreKeys) {
    const deals = storeBuckets.get(key)!;
    if (deals.length > 0) interleavedDeals.push(deals[0]);
  }
  for (const key of sortedStoreKeys) {
    const deals = storeBuckets.get(key)!;
    if (deals.length > 1) interleavedDeals.push(deals[1]);
  }

  // 3. In-Grid Creative Banners
  const rawBanners = homeRotatorBanners.rectangles || [];
  const seenBannerImgs = new Set<string>();
  const seenBannerIds = new Set<string>();
  const uniqueBannerList: InGridPartnerBannerItem[] = [];

  for (const b of rawBanners) {
    const img = b.src || (b as any).imageUrl || (b as any).image;
    const bId = b.id || b.name || img;
    if (!img || seenBannerImgs.has(img) || seenBannerIds.has(bId)) continue;
    seenBannerImgs.add(img);
    seenBannerIds.add(bId);
    uniqueBannerList.push(b as InGridPartnerBannerItem);
  }

  const bannerPartnerBuckets = new Map<string, InGridPartnerBannerItem[]>();
  for (const b of uniqueBannerList) {
    const p = b.partnerSlug || 'other';
    if (!bannerPartnerBuckets.has(p)) bannerPartnerBuckets.set(p, []);
    bannerPartnerBuckets.get(p)!.push(b);
  }

  const inGridPartnerBanners: InGridPartnerBannerItem[] = [];
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

  return {
    interleavedDeals,
    inGridPartnerBanners,
    totalDeals: interleavedDeals.length
  };
}

