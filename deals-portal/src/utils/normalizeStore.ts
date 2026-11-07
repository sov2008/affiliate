import { STORE_DOMAINS_MAP } from '../data/storeDomains';

/**
 * 1. Store Name Sanitization & Junk Filtering
 */

// Patterns to strip technical affiliate/CPA metadata
const AFFILIATE_METADATA_REGEXES: RegExp[] = [
  // Technical suffixes / tokens
  /\b\d{1,2}\s+[A-Za-z]{3,9}\s+incentive\s+campaign\b/gi,
  /\bincentive\s+campaign\b/gi,
  /\b(?:clone\s+of|non\s+coupon\s+publishers|standard\s+commission|referral\s+period)\b/gi,
  /\b(Default\s+Payout|Program\s+Terms?|Standard\s+Terms?|Public\s+Affiliate\s+Terms?|with\s+performance\s+incentives|Terms|Payout|RS|S2S|CPA|CPS|CPL|RevShare)\b/gi,
  // Locking strings
  /\+\s*\d+\s*Days?\s*Locking/gi,
  // Percentage / commission strings
  /[-–—|]\s*\d+(?:\.\d+)?%/g,
  /\b\d+(?:\.\d+)?%\b/g,
  // Decimal commission numbers like 12.23 or standalone numbers
  /\b\d+\.\d+\b/g,
  // Trailing years like 26-27 or 2024-2026
  /\b(?:20)?\d{2}[-–—](?:20)?\d{2}\b/g,
  /\b202[4-9]\b/g,
  // Tariff / tier prefixes
  /^(?:commission|cpa|cps|cpl|revshare)\s*\d*(?:\.\d+)?%?\s*[-–—:•|]?\s*/i,
  /^\d+(?:\.\d+)?\s*(?:%|percents?)\s*(?:commission|off|cpa|cps|revshare)?\s*[-–—:•|]?\s*/i,
  // Date-like campaign prefixes
  /^(?:CPA[_-]?)?\d{4}[._-]\d{1,2}[._-]\d{1,2}[_-]?(?:newuser[_-]?)?/i,
  // Leading or trailing country code tags
  /^(?:CN|US|UK|FR|DE|EU|GLOBAL|WW|ALL)\s*[-–—:]\s*/i,
  /\s*(?:\((?:US|UK|FR|DE|EU|CN|CA|AU|GLOBAL|WW)\)|[-–—]\s*(?:US|UK|FR|DE|EU|CN))(?:\s*\(\d+\))?$/gi,
  /\s*\(\d+\)$/g,
  /[_\s]+(?:US|UK|FR|DE|EU|CN|ALL|NEWUSER|CPS|CPA)$/i,
  // Trailing affiliate workflow noise
  /\s+(?:Default|Program|Terms?|Standard|Tier|Global|Official|Affiliate|Campaign|Store|WW)$/gi
];

// Explicit mappings for known merchants that have specific styling or noisy affiliate feed names
export const EXPLICIT_MERCHANT_MAP: Array<[RegExp, { brand: string; domain: string }]> = [
  [/mamas\s*(?:and|&)\s*papas|mamasandpapas/i, { brand: 'Mamas & Papas', domain: 'mamasandpapas.com' }],
  [/123\s*[-–]?\s*reg/i, { brand: '123 Reg', domain: '123-reg.co.uk' }],
  [/winpig/i, { brand: 'Winpig', domain: 'winpig.com' }],
  [/pure\s*genius\s*protein/i, { brand: 'Pure Genius Protein', domain: 'puregeniusprotein.com' }],
  [/carpuride/i, { brand: 'Carpuride', domain: 'carpuride.com' }],
  [/homsee/i, { brand: 'Homsee', domain: 'homsee.com' }],
  [/kijou\s*steam\s*box|kijou/i, { brand: 'Kijou STEAM Box', domain: 'kijou.com' }],
  [/fufugaga|fufu\s*(&|and)?\s*gaga/i, { brand: 'FUFUGAGA', domain: 'fufugaga.com' }],
  [/accor\s*plus/i, { brand: 'Accor Plus', domain: 'accorplus.com' }],
  [/booking(?:\.com)?/i, { brand: 'Booking.com', domain: 'booking.com' }],
  [/oyo(?:\s*rooms)?/i, { brand: 'OYO', domain: 'oyorooms.com' }],
  [/wristband\s*express/i, { brand: 'Wristband Express', domain: 'wristbandexpress.com' }],
  [/whokeys/i, { brand: 'WhoKeys', domain: 'whokeys.com' }],
  [/945\s*industries/i, { brand: '945 Industries', domain: '945industries.com' }],
  [/tactical\s+edc\s+gear|915\s*gear/i, { brand: '915Gear', domain: '915gear.com' }],
  [/chinavasion/i, { brand: 'Chinavasion', domain: 'chinavasion.com' }],
  [/eharmony/i, { brand: 'eharmony', domain: 'eharmony.com' }],
  [/abelssoft/i, { brand: 'Abelssoft', domain: 'abelssoft.de' }],
  [/fubotv|fubo/i, { brand: 'FuboTV', domain: 'fubo.tv' }],
  [/expressvpn/i, { brand: 'ExpressVPN', domain: 'expressvpn.com' }],
  [/purevpn/i, { brand: 'PureVPN', domain: 'purevpn.com' }],
  [/nordvpn/i, { brand: 'NordVPN', domain: 'nordvpn.com' }],
  [/surfshark/i, { brand: 'Surfshark', domain: 'surfshark.com' }],
  [/hostinger/i, { brand: 'Hostinger', domain: 'hostinger.com' }],
  [/alibaba/i, { brand: 'Alibaba', domain: 'alibaba.com' }],
  [/aliexpress/i, { brand: 'AliExpress', domain: 'aliexpress.com' }],
  [/chicme/i, { brand: 'ChicMe', domain: 'chicme.com' }],
  [/allpowers/i, { brand: 'ALLPOWERS', domain: 'iallpowers.com' }],
  [/airalo/i, { brand: 'Airalo', domain: 'airalo.com' }],
  [/yesim/i, { brand: 'Yesim', domain: 'yesim.app' }],
  [/topaz/i, { brand: 'Topaz Labs', domain: 'topazlabs.com' }],
  [/kodland/i, { brand: 'Kodland', domain: 'kodland.org' }],
  [/acorn\s*tv/i, { brand: 'Acorn TV', domain: 'acorn.tv' }],
  [/luminar|skylum/i, { brand: 'Skylum Luminar', domain: 'skylum.com' }],
  [/kaspersky/i, { brand: 'Kaspersky', domain: 'kaspersky.com' }],
  [/bitdefender/i, { brand: 'Bitdefender', domain: 'bitdefender.com' }],
  [/rexing/i, { brand: 'Rexing USA', domain: 'rexingusa.com' }],
  [/ugreen/i, { brand: 'UGREEN', domain: 'ugreen.com' }],
  [/creality/i, { brand: 'Creality 3D', domain: 'creality.com' }],
  [/megogo/i, { brand: 'MEGOGO', domain: 'megogo.net' }],
  [/wondershare/i, { brand: 'Wondershare', domain: 'wondershare.com' }],
  [/wild\s*fork/i, { brand: 'Wild Fork', domain: 'wildforkfoods.com' }],
  [/upscale\s*coffee/i, { brand: 'Upscale Coffee', domain: 'upscalecoffee.com' }],
  [/h&m|\bh\s*and\s*m\b/i, { brand: 'H&M', domain: 'hm.com' }],
  [/footlocker/i, { brand: 'Footlocker', domain: 'footlocker.com' }],
  [/levi/i, { brand: 'Levis', domain: 'levi.com' }],
  [/glasseslit/i, { brand: 'GlassesLit', domain: 'glasseslit.com' }],
  [/raynatours|rayna\s*tours/i, { brand: 'Rayna Tours', domain: 'raynatours.com' }],
  [/qustodio/i, { brand: 'Qustodio', domain: 'qustodio.com' }],
  [/keeper/i, { brand: 'Keeper Security', domain: 'keepersecurity.com' }],
  [/1password/i, { brand: '1Password', domain: '1password.com' }],
  [/aiper/i, { brand: 'Aiper', domain: 'aiper.com' }],
  [/wargaming/i, { brand: 'Wargaming', domain: 'wargaming.net' }],
  [/stylevana/i, { brand: 'Stylevana', domain: 'stylevana.com' }],
  [/gearup/i, { brand: 'GearUP', domain: 'gearupbooster.com' }],
  [/overgear/i, { brand: 'Overgear', domain: 'overgear.com' }],
  [/iseehair/i, { brand: 'ISEE Hair', domain: 'iseehair.com' }],
  [/raws*paws/i, { brand: 'Raw Paws Pet Food', domain: 'rawpawspetfood.com' }],
  [/wowangel/i, { brand: 'Wowangel', domain: 'wowangel.com' }],
  [/ayurvedas*experience/i, { brand: 'The Ayurveda Experience', domain: 'theayurvedaexperience.com' }],
  [/legendz/i, { brand: 'Legendz', domain: 'legendz.com' }],
  [/sharafs*dg|sharafdg/i, { brand: 'Sharaf DG', domain: 'sharafdg.com' }],
  [/vips*cars/i, { brand: 'VIP Cars', domain: 'vipcars.com' }],
  [/kaer/i, { brand: 'KAER', domain: 'kaer.com' }],
  [/yoses*power/i, { brand: 'Yose Power', domain: 'yosepower.com' }],
  [/gabiona/i, { brand: 'Gabiona', domain: 'gabiona.de' }],
  [/empowerdx/i, { brand: 'empowerDX', domain: 'empowerdxlab.com' }],
  [/airs*serbia/i, { brand: 'Air Serbia', domain: 'airserbia.com' }],
  [/expondo/i, { brand: 'Expondo', domain: 'expondo.de' }]
];

/**
 * Strips technical affiliate suffixes, percentage numbers, locking days, and trims residual punctuation.
 */
export function sanitizeStoreName(rawName = ''): string {
  let name = String(rawName || '').trim();
  if (!name) return '';

  // Check explicit map first
  for (const [pattern, target] of EXPLICIT_MERCHANT_MAP) {
    if (pattern.test(name)) {
      return target.brand;
    }
  }

  // Handle specific known cases
  if (/mamasandpapas/i.test(name)) {
    return 'Mamas & Papas';
  }

  // Apply all regex sanitizers
  for (const regex of AFFILIATE_METADATA_REGEXES) {
    name = name.replace(regex, ' ');
  }

  // Replace underscores and clean punctuation
  name = name
    .replace(/_/g, ' ')
    .replace(/[–—|/•\\]/g, ' ')
    .replace(/\s*-\s*$/, '')
    .replace(/^\s*-\s*/, '')
    .replace(/\.{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If still ends with dangling punctuation or hyphens
  name = name.replace(/^[^\w#&]+|[^\w#&]+$/g, '').trim();

  return name;
}

/**
 * Checks if a store name represents a legitimate consumer brand rather than
 * generic affiliate tariff placeholders (e.g. "$4/$20/$27 CPA", "Base 4%", "Default US/CA").
 */
export function isValidBrandName(name = ''): boolean {
  const s = String(name || '').trim();
  if (!s || s.length < 2) return false;

  // Drop obvious junk / placeholders / commission formulas
  if (/^\$?\d+(?:\/\$?\d+)*\s*(?:cpa|cps|cpl|revshare)?$/i.test(s)) return false;
  if (/^(?:base|default|wholesale|standard|tiered|clone\s+of|bonus|tier)\b/i.test(s)) return false;
  if (/^(?:cpa|cps|cpl|revshare|terms|payout|campaign)$/i.test(s)) return false;
  if (/^verified\s*partner$/i.test(s)) return false;
  if (/^(?:default\s+us\/ca|base\s+\d+%.*|\$\d+.*cpa|\d+.*commission.*)$/i.test(s)) return false;
  if (/^\d+(\.\d+)?%?$/i.test(s)) return false;

  // Must contain at least one letter (allowing numbers like 945 Industries, 915Gear, 1Password)
  if (!/[a-zA-Z]/.test(s)) return false;

  return true;
}

/**
 * 2. Strict Store Deduplication Slug Generator
 */
export function generateCanonicalStoreSlug(cleanBrand: string): string {
  return String(cleanBrand || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface CanonicalStore {
  slug: string;
  name: string;
  canonicalBrand: string;
  domain: string;
  category: string;
  shortDesc: string;
  fullDesc?: string;
  logoText?: string;
  websiteUrl?: string;
  originalSlug?: string;
  dealsCount: number;
}

/**
 * Deduplicates raw store profiles and coupons into unique CanonicalStore items.
 */
export function deduplicateStores(
  rawStores: any[] = [],
  rawCoupons: any[] = []
): CanonicalStore[] {
  const storeMap = new Map<string, CanonicalStore>();

  // Helper to ingest or merge a store entry
  function ingestStore(
    brandName: string,
    rawEntry: any,
    initialCount = 0
  ) {
    const cleanName = sanitizeStoreName(brandName);
    if (!isValidBrandName(cleanName)) return;

    const slug = generateCanonicalStoreSlug(cleanName);
    if (!slug) return;

    let domain = rawEntry?.domain || rawEntry?.cleanDomain || '';
    if (!domain && STORE_DOMAINS_MAP[cleanName]) {
      domain = STORE_DOMAINS_MAP[cleanName];
    }
    if (!domain) {
      // Check explicit merchant map
      for (const [pattern, target] of EXPLICIT_MERCHANT_MAP) {
        if (pattern.test(cleanName)) {
          domain = target.domain;
          break;
        }
      }
    }
    if (!domain) {
      domain = `${slug.replace(/[^a-z0-9]/g, '')}.com`;
    }

    if (!storeMap.has(slug)) {
      storeMap.set(slug, {
        slug,
        name: cleanName,
        canonicalBrand: cleanName,
        domain,
        category: rawEntry?.category || rawEntry?.storeCategory || 'E-Commerce & Wholesale',
        shortDesc: rawEntry?.shortDesc || `Verified promo codes and discounts for ${cleanName}.`,
        fullDesc: rawEntry?.fullDesc,
        logoText: rawEntry?.logoText || cleanName,
        websiteUrl: rawEntry?.websiteUrl || rawEntry?.primaryAffiliateUrl || rawEntry?.affiliateUrl,
        originalSlug: rawEntry?.slug || rawEntry?.storeSlug || slug,
        dealsCount: initialCount
      });
    } else {
      const existing = storeMap.get(slug)!;
      existing.dealsCount += initialCount;
      if (!existing.fullDesc && rawEntry?.fullDesc) {
        existing.fullDesc = rawEntry.fullDesc;
      }
      if (!existing.websiteUrl && (rawEntry?.websiteUrl || rawEntry?.primaryAffiliateUrl)) {
        existing.websiteUrl = rawEntry.websiteUrl || rawEntry.primaryAffiliateUrl;
      }
    }
  }

  // 1. Ingest base store profiles
  for (const s of rawStores) {
    const rawName = s?.name || s?.canonicalBrand || s?.storeName || '';
    ingestStore(rawName, s, 0);
  }

  // 2. Count and associate deals with canonical store
  for (const c of rawCoupons) {
    const rawStoreName = c?.storeName || c?.brand || c?.merchant || '';
    const cleanName = sanitizeStoreName(rawStoreName);
    if (!isValidBrandName(cleanName)) continue;

    const slug = generateCanonicalStoreSlug(cleanName);
    if (!slug) continue;

    if (storeMap.has(slug)) {
      storeMap.get(slug)!.dealsCount += 1;
    } else {
      // If store directory lacked this valid merchant, register it with deal count = 1
      ingestStore(cleanName, c, 1);
    }
  }

  return Array.from(storeMap.values()).sort((a, b) => {
    // Sort with highest dealsCount first, then alphabetical
    if (b.dealsCount !== a.dealsCount) return b.dealsCount - a.dealsCount;
    return a.name.localeCompare(b.name);
  });
}

/**
 * 3. Dynamic Expiration Fallback (Evergreen Offer Roll-Forward)
 */
export function normalizeExpiryDate(expiryDateStr?: string, referenceDate: Date = new Date()): string {
  // Format reference date components
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth(); // 0-indexed

  // Calculate last day of current month
  const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  
  const endOfMonthStr = `${lastDayOfCurrentMonth.getFullYear()}-${pad(lastDayOfCurrentMonth.getMonth() + 1)}-${pad(lastDayOfCurrentMonth.getDate())}`;
  const endOfYearStr = `${currentYear}-12-31`;

  if (!expiryDateStr || typeof expiryDateStr !== 'string') {
    return endOfMonthStr;
  }

  const trimmed = expiryDateStr.trim();
  const dateObj = new Date(trimmed);

  // If date is invalid or NaN, roll forward to end of month
  if (isNaN(dateObj.getTime())) {
    return endOfMonthStr;
  }

  // Compare timestamps (ignoring hours/minutes for date-only comparison)
  const refMidnight = new Date(currentYear, currentMonth, referenceDate.getDate()).getTime();
  const expMidnight = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();

  // If expired or expires today, roll forward to last day of current month or end of year
  if (expMidnight < refMidnight) {
    // If we are already past the end of the current month or on the last day, roll to next month or end of year
    if (referenceDate.getDate() >= lastDayOfCurrentMonth.getDate()) {
      return endOfYearStr;
    }
    return endOfMonthStr;
  }

  // Already valid future date: return in canonical YYYY-MM-DD
  return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
}

