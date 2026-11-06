import { STORES_DATA, COUPONS_DATA } from '../data/couponsData';
import { STORE_DOMAINS_MAP } from '../data/storeDomains';
import {
  sanitizeStoreName,
  isValidBrandName,
  generateCanonicalStoreSlug,
  deduplicateStores,
  normalizeExpiryDate,
  EXPLICIT_MERCHANT_MAP,
  type CanonicalStore
} from './normalizeStore';

export {
  sanitizeStoreName,
  isValidBrandName,
  generateCanonicalStoreSlug,
  deduplicateStores,
  normalizeExpiryDate,
  CanonicalStore
};

export const EXPLICIT_PATTERN_MAP = EXPLICIT_MERCHANT_MAP;

export function isJunkTestOffer(rawBrand = '', rawTitle = ''): boolean {
  const b = (rawBrand || '').trim();
  const combined = `${b} ${rawTitle}`;
  return (
    // Internal test campaigns
    /1929B/i.test(combined) ||
    /\d+[a-z]*\s*tested/i.test(combined) ||
    /test\s+campaign/i.test(combined) ||
    /verified\s+savings\s+on\s+top\s+brand\s+goods/i.test(rawTitle) ||
    // Affiliate commission tariff-tier rows masquerading as stores
    /(program\s+terms?|default\s+terms?|wholesale\s+default|cross-border\s+program|cpa\s+\d+%?\s*terms?|standard\s+commission|bonus\s+terms?|tier\s+\d+)/i.test(b) ||
    /^(cpa|cps|cpl|revshare|default|wholesale|cross-border).*(terms?|rate|default)$/i.test(b) ||
    /^verified\s*partner$/i.test(b) ||
    /^(Default\s+US\/CA|Base\s+\d+%.*|\$\d+.*CPA|\d+.*commission.*)$/i.test(b)
  );
}

export function resolveMerchantIdentity(deal: any): { brand: string; domain: string } {
  const rawBrand = String(deal?.storeName || deal?.merchant || deal?.brand || deal?.name || '').trim();
  const rawTitle = String(deal?.title || '').trim();
  const rawUrl = String(deal?.merchantUrl || deal?.storeUrl || deal?.affiliateUrl || deal?.url || deal?.link || '').trim();
  const combined = `${rawBrand} ${rawTitle}`;

  // 1. Check explicit pattern map first
  for (const [regex, info] of EXPLICIT_PATTERN_MAP) {
    if (regex.test(combined)) return info;
  }

  // 2. Clean rawBrand without destroying legitimate brands that contain numbers (like 915Gear, 945 Industries, 1Password)
  let name = rawBrand
    .replace(/^\d+(\.\d+)?\s*(%|percents?)\s*(commission|off|cpa|cps|revshare)?\s*[-–—:•|]?\s*/i, '')
    .replace(/^(commission|cpa|cps|cpl|revshare)\s*\d*(\.\d+)?%?\s*[-–—:•|]?\s*/i, '')
    .replace(/^(?:CPA[_-]?)?\d{4}[._-]\d{1,2}[._-]\d{1,2}[_-]?(?:newuser[_-]?)?/i, '')
    .replace(/^(?:CN|US|UK|FR|DE|EU|GLOBAL|WW|ALL)\s*[-–—:]\s*/i, '')
    .replace(/\s*(?:\((?:US|UK|FR|DE|EU|CN|CA|AU|GLOBAL|WW)\)|[-–—]\s*(?:US|UK|FR|DE|EU|CN))(\s*\(\d+\))?$/gi, '')
    .replace(/\s*\(\d+\)$/g, '')
    .replace(/[_\s]+(US|UK|FR|DE|EU|CN|ALL|NEWUSER|CPS|CPA)$/i, '')
    .replace(/\.{2,}$/g, '')
    .replace(/_/g, ' ')
    .trim();

  // Strip trailing affiliate workflow words from any brand name
  name = name.replace(/\s+(Default|Program|Terms?|Standard|Tier|Global|Official|Affiliate|Campaign|Store|WW)$/gi, '').trim();

  // 3. If cleaned name is still missing or broken, extract capitalized brand noun from title
  if (!name || name.length < 2 || /^(verified\s*partner|chinas|cn|all|oem\s*tech)$/i.test(name)) {
    const titleBrand = rawTitle.match(/(?:on|for|at|from|with)\s+([A-Z0-9][A-Za-z0-9.+-]{2,18})/);
    if (titleBrand && !/^(All|Top|Select|Instant|Verified|Orders|Online|Global)$/i.test(titleBrand[1])) {
      name = titleBrand[1];
    } else {
      const firstWords = rawTitle.split(/\s+/).slice(0, 2).join(' ').replace(/[^A-Za-z0-9\s]/g, '').trim();
      name = firstWords || 'Global Store';
    }
  }

  // 4. Resolve clean domain for Google S2 Favicon lookup
  let domain = '';
  if (STORE_DOMAINS_MAP[name]) {
    domain = STORE_DOMAINS_MAP[name];
  } else if (rawUrl && !/admitad|impact|awltovhc|tkqlhce|anrdoezrs|dpbolvw|tjzuh|ujhjj|rthsu|yynbx/i.test(rawUrl)) {
    try {
      domain = new URL(rawUrl).hostname.replace(/^www\./, '');
    } catch {}
  }
  if (!domain) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (slug.length >= 3) domain = `${slug}.com`;
  }

  return { brand: name, domain };
}

export function getCanonicalStoreSlug(cleanBrand: string): string {
  return cleanBrand
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface UniqueCleanStore {
  canonicalBrand: string;
  domain: string;
  slug: string;
  originalSlug: string;
  category: string;
  shortDesc: string;
  name: string;
  fullDesc?: string;
  logoText?: string;
  websiteUrl?: string;
  dealsCount?: number;
}

/**
 * Returns deduplicated, junk-filtered canonical stores with unified canonical slugs and accurate dealsCount.
 */
export function getUniqueCleanStores(storesData = STORES_DATA, dealsData = COUPONS_DATA): UniqueCleanStore[] {
  const deduped = deduplicateStores(storesData, dealsData);
  return deduped.map(s => ({
    canonicalBrand: s.canonicalBrand,
    domain: s.domain,
    slug: s.slug,
    originalSlug: s.originalSlug || s.slug,
    category: resolveSmartCategory(s.category, s.canonicalBrand, s.shortDesc),
    shortDesc: s.shortDesc,
    name: s.name,
    fullDesc: s.fullDesc,
    logoText: s.logoText,
    websiteUrl: s.websiteUrl,
    dealsCount: s.dealsCount
  }));
}

/**
 * Smart Category Re-Classification (De-bloat catch-all categories)
 */
export function resolveSmartCategory(rawCategory = '', cleanBrand = '', rawTitle = ''): string {
  const brand = (cleanBrand || '').trim();
  const title = (rawTitle || '').trim();
  const combined = `${brand} ${title}`.toLowerCase();

  // 1. Privacy, VPN & Security
  if (/expressvpn|purevpn|nordvpn|surfshark|proton|qustodio|onlinesim|kaspersky|bitdefender|keeper|1password|antivirus|cyber|vpn/i.test(combined)) {
    return 'Privacy & Security';
  }

  // 2. Web Hosting, Cloud & Domains
  if (/hostinger|123-reg|namecheap|siteground|bluehost|godaddy|liquidweb|cloudways|vps|web hosting/i.test(combined)) {
    return 'Web Hosting & Domains';
  }

  // 3. Software, AI & Gaming
  if (/whokeys|abelssoft|topaz|skylum|luminar|wondershare|edraw|restoro|directdeals|corel|notta|game key/i.test(combined)) {
    return 'Gaming, Media & Software';
  }

  // 4. Auto, Dashcams & Mobility
  if (/carpuride|nilight|dashcam|turbosto|automotive|carplay|vehicle|tires/i.test(combined)) {
    return 'Auto, Dashcams & Mobility';
  }

  // 5. Travel, Hotels, Flights & eSIM
  if (/accor\s*plus|booking|cruisedirect|oojo|airalo|yesim|trip\.com|expedia|raynatours|sports\s*events\s*365|vacation|hotel|cruise|flight|resort|safari/i.test(combined)) {
    return 'Travel & Tours';
  }

  // 6. Food, Beverage & Gourmet Nutrition
  if (/coffee|upscale\s*coffee|zchocolat|protein|pure\s*genius|food|nutrition|steak|snack|gourmet|herbspro/i.test(combined)) {
    return 'Food, Beverage & Nutrition';
  }

  // 7. Eyewear & Optical Health
  if (/glasseslit|eyewear|glasses|sunglasses|optical|treatmyuti|uti|paternity\s*lab|mfi\s*medical|dna test|health/i.test(combined)) {
    return 'Eyewear & Health';
  }

  // 8. Beauty, Fragrances & Cosmetics
  if (/fragrance|perfume|yves\s*rocher|unice|hair|cosmetics|beauty|skincare|makeup|oud|scent/i.test(combined)) {
    return 'Beauty & Fragrances';
  }

  // 9. Kids, Family & Toys
  if (/kaiya\s*baby|xplora|baby|toy|doll|stroller|infant|toddler|kids|dabdoob/i.test(combined)) {
    return 'Kids & Toys';
  }

  // 10. Dating & Lifestyle
  if (/eharmony|mylead\s*dating|elitedate|discreet|dating|match|single|flirt/i.test(combined)) {
    return 'Dating & Lifestyle';
  }

  // 11. Insurance & Financial Services
  if (/insurance|finance|barclays|sainsbury|venmo|loan|bank|credit|polis|cool\s*credit|zonky/i.test(combined)) {
    return 'Insurance & Finance';
  }

  // 12. Education & Online Learning
  if (/kodland|education|snhu|university|course|learning|academy|coding/i.test(combined)) {
    return 'Education & Learning';
  }

  // 13. Home, Furniture & Smart Living
  if (/switchbot|fufugaga|homsee|sleep\s*&\s*beyond|sleepandbeyond|click\s*&\s*grow|groundluxe|furniture|home|decor|mattress|bedding|kenwood/i.test(combined)) {
    return 'Home & Living';
  }

  // 14. Electronics, Solar & Power Gear
  if (/915gear|945\s*industries|rovyvon|allpowers|binovibe|redtiger|cuktech|ugreen|jackery|creality|3d|tenergy|power\s*station|solar/i.test(combined)) {
    return 'Electronics & Gadgets';
  }

  // 15. Fashion, Apparel & Shoes
  if (/chicme|fashion|apparel|dress|shoes|clothing|pandahall|silverrush|dream\s*pairs|bruno\s*marc|mark\s*formelle|voga/i.test(combined)) {
    return 'Fashion & Apparel';
  }

  // 16. E-Commerce, Wholesale & Marketplaces
  if (/alibaba|aliexpress|chinavasion|dhgate|touch|wholesale|sourcing/i.test(combined)) {
    return 'E-Commerce & Wholesale';
  }

  // Fallback to normalized rawCategory
  if (rawCategory === 'Home & Lifestyle') return 'Home & Living';
  return rawCategory || 'E-Commerce & Wholesale';
}

export function cleanBrandName(rawBrand = '', rawTitle = '', merchantUrl = '', storeSlug = ''): string {
  const resolved = resolveMerchantIdentity({ storeName: rawBrand, title: rawTitle, merchantUrl, storeSlug });
  return resolved.brand;
}

/**
 * Extract concise discount badge:
 * If % or $ present: concise e.g. "81% OFF", "$200 OFF".
 * If free ship / bogo / trial: "FREE SHIP", "BOGO DEAL", "FREE TRIAL".
 * Otherwise: "PARTNER PRICE".
 */
export function extractSmartDiscountBadge(rawBadge = '', rawTitle = ''): string {
  const b = (rawBadge || '').trim().toUpperCase();

  // 1. If badge or title has a dollar / currency discount (e.g. "$20 OFF", "20 $ OFF", "20$ OFF", "$20")
  const currencyBadge = b.match(/(?:\$|USD|\b)\s*(\d+)\s*(?:\$|USD)?\s*OFF/i) ||
                        b.match(/\$\s*(\d+)/i) ||
                        rawTitle.match(/(?:\$|USD)\s*(\d+)\s*OFF/i) ||
                        rawTitle.match(/(\d+)\s*(?:\$|USD)\s*OFF/i) ||
                        rawTitle.match(/(?:Save|Get)\s+\$(\d+)/i);
  if (currencyBadge) {
    return `$${currencyBadge[1]} OFF`;
  }

  // 2. If badge already has a clear percentage (% OFF)
  const badgeNum = b.match(/(\d+%\s*OFF)/i) || b.match(/(\d+%)/);
  if (badgeNum) {
    const val = badgeNum[1].toUpperCase();
    return val.includes('OFF') ? val : `${val} OFF`;
  }

  // 3. Extract percentage discount from title (e.g. "Save 16% Instantly...", "Get 50% OFF...")
  const titlePercent = rawTitle.match(/(\d{1,2}%\s*OFF)/i) || rawTitle.match(/(?:Save|Get)\s+(\d{1,2}%)/i);
  if (titlePercent) {
    const val = titlePercent[1].toUpperCase();
    return val.includes('OFF') ? val : `${val} OFF`;
  }

  // 4. Specific promotion types
  const t = rawTitle.toUpperCase();
  if (t.includes('FREE SHIPPING') || t.includes('FREE DELIVERY') || b.includes('FREE SHIPPING')) {
    return 'FREE SHIP';
  }
  if (t.includes('BUY ONE GET ONE') || t.includes('BOGO')) {
    return 'BOGO DEAL';
  }
  if (t.includes('TRIAL') || t.includes('FREE MONTH') || t.includes('FREE MO')) {
    return 'FREE TRIAL';
  }

  // 5. High-converting non-numeric fallbacks (emerald/indigo badges instead of dull grey)
  if (t.includes('VIP') || b.includes('VIP') || /onlinesim|exclusive|direct/i.test(rawTitle)) {
    return 'VIP RATE';
  }

  return 'SPECIAL DEAL';
}

export const normalizeDiscountBadge = extractSmartDiscountBadge;

/**
 * Deduplicate store products by image URL and normalized title.
 */
export function deduplicateProducts<T extends { imageUrl: string; title: string; id?: string }>(products: T[]): T[] {
  const seenImages = new Set<string>();
  const seenTitles = new Set<string>();
  const result: T[] = [];

  for (const item of products) {
    const normTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    const normImg = (item.imageUrl || '').split('?')[0];

    if (normImg && seenImages.has(normImg)) continue;
    if (normTitle && seenTitles.has(normTitle)) continue;

    if (normImg) seenImages.add(normImg);
    if (normTitle) seenTitles.add(normTitle);
    result.push(item);
  }

  return result;
}

/**
 * Prioritize high-value offers and interleave merchants round-robin
 * so adjacent cards are always different brands.
 */
export function diversifyDealsFeed<T extends { cleanBrand?: string; code?: string; discountBadge?: string; badge?: string }>(deals: T[]): T[] {
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

      const aHasNumber = /(\d+%|\$\d+)/.test(a.discountBadge || a.badge || '') ? 1 : 0;
      const bHasNumber = /(\d+%|\$\d+)/.test(b.discountBadge || b.badge || '') ? 1 : 0;
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

export const MONOGRAM_GRADIENTS = [
  'from-indigo-600 via-indigo-700 to-indigo-800',  // 0: Indigo #4F46E5
  'from-rose-600 via-rose-700 to-rose-800',        // 1: Rose #E11D48
  'from-emerald-600 via-teal-700 to-emerald-800',  // 2: Emerald #059669
  'from-purple-600 via-violet-700 to-purple-800',  // 3: Violet #7C3AED
  'from-amber-500 via-amber-600 to-orange-700',    // 4: Amber #D97706
  'from-cyan-600 via-sky-700 to-blue-800'          // 5: Cyan #0284C7
];

export function getBrandGradient(brand = ''): string {
  const code = (brand || 'PR').charCodeAt(0) + (brand.length > 1 ? brand.charCodeAt(1) : 0);
  return MONOGRAM_GRADIENTS[code % MONOGRAM_GRADIENTS.length];
}
