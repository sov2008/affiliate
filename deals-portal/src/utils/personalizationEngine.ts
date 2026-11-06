/**
 * Personalization & User Intent Engine (`pr_user_profile_v1`)
 * Tracks user engagement, category affinity, claimed coupons,
 * and scores candidate recovery offers.
 */

export interface UserProfile {
  geo: string;            // 'US' | 'EU' | 'GCC' | 'UA' | 'GLOBAL'
  os: string;             // 'iOS' | 'Android' | 'macOS' | 'Windows' | 'Linux'
  categoryAffinities: Record<string, number>;
  storeAffinities: Record<string, number>;
  claimedDealIds: string[];
  lastActionTimestamp: number;
}

export interface CandidateDeal {
  id: string;
  title: string;
  desc?: string;
  description?: string;
  code?: string;
  badge?: string;
  discountBadge?: string;
  storeName: string;
  storeSlug?: string;
  canonicalSlug?: string;
  domain?: string;
  resolvedDomain?: string;
  category?: string;
  smartCategory?: string;
  storeCategory?: string;
  affiliateUrl: string;
  successRate?: string;
  isTopPick?: boolean;
}

const STORAGE_PROFILE_KEY = 'pr_user_profile_v1';
const RECOVERY_SHOWN_KEY = 'pr_recovery_shown';
const RECOVERY_DISMISSED_KEY = 'pr_recovery_dismissed_until';
const LAST_CONVERSION_KEY = 'pr_last_conversion_time';

/**
 * Detect client OS from navigator user-agent
 */
export function detectClientOS(): string {
  if (typeof window === 'undefined') return 'Windows';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Android/.test(ua)) return 'Android';
  if (/Macintosh|Mac OS X/.test(ua)) return 'macOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

/**
 * Detect client region code or fallback to timezone heuristic
 */
export function detectClientGeo(): string {
  if (typeof window === 'undefined') return 'GLOBAL';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Kyiv') || tz.includes('Kiev') || tz.includes('Simferopol')) return 'UA';
    if (tz.includes('Dubai') || tz.includes('Riyadh') || tz.includes('Qatar') || tz.includes('Muscat')) return 'GCC';
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver')) return 'US';
    if (tz.includes('London') || tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Madrid') || tz.includes('Rome') || tz.includes('Warsaw')) return 'EU';
  } catch (e) {}
  return 'GLOBAL';
}

/**
 * Read current user profile or initialize default
 */
export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') {
    return {
      geo: 'GLOBAL',
      os: 'Windows',
      categoryAffinities: {},
      storeAffinities: {},
      claimedDealIds: [],
      lastActionTimestamp: Date.now()
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          geo: parsed.geo || detectClientGeo(),
          os: parsed.os || detectClientOS(),
          categoryAffinities: parsed.categoryAffinities || {},
          storeAffinities: parsed.storeAffinities || {},
          claimedDealIds: parsed.claimedDealIds || [],
          lastActionTimestamp: parsed.lastActionTimestamp || Date.now()
        };
      }
    }
  } catch (e) {}

  const initial: UserProfile = {
    geo: detectClientGeo(),
    os: detectClientOS(),
    categoryAffinities: {},
    storeAffinities: {},
    claimedDealIds: [],
    lastActionTimestamp: Date.now()
  };
  saveUserProfile(initial);
  return initial;
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

/**
 * Mark a deal as claimed (copied code or clicked affiliate CTA)
 */
export function markDealClaimed(dealId: string): void {
  if (typeof window === 'undefined' || !dealId) return;
  try {
    const profile = getUserProfile();
    if (!profile.claimedDealIds.includes(dealId)) {
      profile.claimedDealIds.push(dealId);
      profile.lastActionTimestamp = Date.now();
      saveUserProfile(profile);
    }
    // Also record conversion timestamp for suppression
    sessionStorage.setItem(LAST_CONVERSION_KEY, String(Date.now()));
  } catch (e) {}
}

/**
 * Track user interaction to increase category or store affinity
 */
export function trackUserAction(action: {
  type: 'hover' | 'search' | 'view_store' | 'claim_deal';
  category?: string;
  storeSlug?: string;
  dealId?: string;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const profile = getUserProfile();
    const weight = action.type === 'claim_deal' ? 5 : action.type === 'view_store' ? 3 : 1;

    if (action.category) {
      profile.categoryAffinities[action.category] = (profile.categoryAffinities[action.category] || 0) + weight;
    }
    if (action.storeSlug) {
      profile.storeAffinities[action.storeSlug] = (profile.storeAffinities[action.storeSlug] || 0) + weight;
    }
    if (action.dealId && action.type === 'claim_deal') {
      if (!profile.claimedDealIds.includes(action.dealId)) {
        profile.claimedDealIds.push(action.dealId);
      }
      sessionStorage.setItem(LAST_CONVERSION_KEY, String(Date.now()));
    }

    profile.lastActionTimestamp = Date.now();
    saveUserProfile(profile);
  } catch (e) {}
}

/**
 * Target OS mapping for stores and offers
 */
export const STORE_OS_TARGETS: Record<string, string[]> = {
  'parallels': ['macOS'],
  'wondershare': ['macOS', 'Windows'],
  'abelssoft': ['Windows'],
  'iolo': ['Windows'],
  'airalo': ['iOS', 'Android'],
  'globalyo': ['iOS', 'Android'],
  'purevpn': ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
  'expressvpn': ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
  'nordvpn': ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
  'protonvpn': ['Windows', 'macOS', 'iOS', 'Android', 'Linux'],
  'keepersecurity': ['iOS', 'Android', 'macOS', 'Windows'],
  'qustodio': ['iOS', 'Android', 'macOS', 'Windows'],
  'touch': ['iOS', 'Android'],
  'touch-ua': ['iOS', 'Android'],
  'turbify': ['Windows', 'macOS', 'Linux'],
  'hostinger': ['Windows', 'macOS', 'Linux']
};

/**
 * Related Category Synergy Matrix (Affinity Spillover)
 */
export const CATEGORY_SYNERGY: Record<string, string[]> = {
  'Software & Tools': ['Hosting & Domains', 'VPN & Security', 'Web Services'],
  'Hosting & Domains': ['Software & Tools', 'VPN & Security', 'Web Services'],
  'VPN & Security': ['Hosting & Domains', 'Software & Tools', 'Travel & Flights'],
  'Travel & Flights': ['eSIM & Connectivity', 'Fashion & Retail', 'Luggage & Gear'],
  'Fashion & Retail': ['Beauty & Health', 'Travel & Flights', 'Accessories'],
  'Electronics & Hardware': ['Software & Tools', 'Gaming', 'Office & Home']
};

/**
 * Banner item definition for scoring
 */
export interface BannerItem {
  brand: string;
  partnerSlug: string;
  category: string;
  src: string;
  width?: number;
  height?: number;
  name?: string;
  affiliateUrl: string;
}

/**
 * Extract marketing intent from URL params (UTM tags) and seed affinities
 */
export function initializeUtmAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const params = new URLSearchParams(window.location.search);
    const utmCampaign = (params.get('utm_campaign') || '').toLowerCase();
    const utmContent = (params.get('utm_content') || '').toLowerCase();
    const utmTerm = (params.get('utm_term') || '').toLowerCase();

    const textToMatch = `${utmCampaign} ${utmContent} ${utmTerm}`;
    if (!textToMatch.trim()) return;

    const profile = getUserProfile();
    let updated = false;

    if (textToMatch.includes('vpn') || textToMatch.includes('privacy') || textToMatch.includes('security')) {
      profile.categoryAffinities['VPN & Security'] = (profile.categoryAffinities['VPN & Security'] || 0) + 6;
      updated = true;
    }
    if (textToMatch.includes('hosting') || textToMatch.includes('domain') || textToMatch.includes('vps') || textToMatch.includes('server')) {
      profile.categoryAffinities['Hosting & Domains'] = (profile.categoryAffinities['Hosting & Domains'] || 0) + 6;
      updated = true;
    }
    if (textToMatch.includes('software') || textToMatch.includes('tools') || textToMatch.includes('mac') || textToMatch.includes('windows')) {
      profile.categoryAffinities['Software & Tools'] = (profile.categoryAffinities['Software & Tools'] || 0) + 6;
      updated = true;
    }
    if (textToMatch.includes('travel') || textToMatch.includes('flight') || textToMatch.includes('hotel') || textToMatch.includes('esim')) {
      profile.categoryAffinities['Travel & Flights'] = (profile.categoryAffinities['Travel & Flights'] || 0) + 6;
      updated = true;
    }

    if (updated) {
      saveUserProfile(profile);
    }
  } catch (e) {}
}

/**
 * Score banner creative against user profile (Geo, OS, Category affinity, Synergy)
 */
export function scoreBanner(banner: BannerItem, profile: UserProfile): number {
  let score = 0;
  const slug = (banner.partnerSlug || '').toLowerCase();

  // 1. GEO compatibility
  const allowedGeos = STORE_GEOS[slug] || ['GLOBAL'];
  if (profile.geo !== 'GLOBAL') {
    if (allowedGeos.includes(profile.geo)) {
      score += 40;
    } else if (allowedGeos.includes('GLOBAL')) {
      score += 15;
    } else {
      score -= 50; // Incompatible with user's GEO!
    }
  } else {
    score += 10;
  }

  // 2. OS compatibility
  const targetOsList = STORE_OS_TARGETS[slug];
  if (targetOsList && targetOsList.length > 0) {
    if (targetOsList.includes(profile.os)) {
      score += 30; // Perfect match (e.g. Parallels on macOS, Airalo on mobile)
    } else {
      score -= 25; // Negative weight for non-target OS (e.g. Parallels on Android)
    }
  }

  // 3. Category direct affinity
  if (banner.category && profile.categoryAffinities[banner.category]) {
    score += profile.categoryAffinities[banner.category] * 12;
  }

  // 4. Category synergy (spillover)
  for (const [userCat, points] of Object.entries(profile.categoryAffinities)) {
    const related = CATEGORY_SYNERGY[userCat];
    if (related && related.includes(banner.category)) {
      score += points * 4;
    }
  }

  // 5. Store affinity
  if (profile.storeAffinities[slug]) {
    score += profile.storeAffinities[slug] * 15;
  }

  return score;
}

/**
 * Return sorted banners based on user context
 */
export function getPersonalizedBanners(banners: BannerItem[], customProfile?: UserProfile): BannerItem[] {
  const profile = customProfile || getUserProfile();
  return [...banners].sort((a, b) => scoreBanner(b, profile) - scoreBanner(a, profile));
}

/**
 * Extract percentage discount value for tie-breaking
 */
function extractDiscountValue(deal: CandidateDeal): number {
  const badge = deal.discountBadge || deal.badge || '';
  const match = badge.match(/(\d+)%/);
  if (match) return parseInt(match[1], 10);
  if (badge.toUpperCase().includes('FREE')) return 99;
  if (/\$\d+/.test(badge)) return 50;
  return 10;
}

/**
 * Known Target Region mapping for stores
 */
export const STORE_GEOS: Record<string, string[]> = {
  'chicme': ['GLOBAL', 'EU', 'US'],
  'glasseslit': ['GLOBAL', 'US', 'EU'],
  'raynatours': ['GCC', 'GLOBAL'],
  'purevpn': ['GLOBAL', 'EU', 'US', 'GCC'],
  'expressvpn': ['GLOBAL', 'EU', 'US', 'GCC', 'UA'],
  'alibaba': ['GLOBAL', 'EU', 'GCC', 'US'],
  'thedealoutlet': ['GCC'],
  'vogacloset': ['GCC', 'GLOBAL'],
  'kodland': ['GLOBAL', 'EU', 'UA'],
  'airalo': ['GLOBAL', 'EU', 'GCC', 'US', 'UA'],
  'keepersecurity': ['GLOBAL', 'EU', 'US'],
  'qustodio': ['GLOBAL', 'EU', 'US'],
  'allpowers': ['UA', 'GLOBAL', 'EU'],
  'huawei': ['GCC', 'GLOBAL', 'EU'],
  'nazih': ['GCC'],
  'touch': ['UA'],
  'touch-ua': ['UA'],
  'onlinesim': ['GLOBAL', 'EU', 'UA'],
  'jashanmal': ['GCC'],
  'dabdoob': ['GCC'],
  'vperfumes': ['GCC'],
  'aovica': ['GLOBAL', 'EU', 'US'],
  'chicme': ['GLOBAL', 'EU'],
  'elitedate': ['EU'],
  'verified-match': ['US', 'GLOBAL'],
  'discreet-local': ['US', 'GLOBAL'],
  'spokeo': ['US'],
  'hostinger': ['GLOBAL', 'US', 'EU', 'UA', 'GCC'],
  'abelssoft': ['GLOBAL', 'EU', 'US'],
  '945industries': ['US', 'GLOBAL', 'EU']
};

/**
 * Calculate relevance score for a deal against current user profile
 */
export function scoreDeal(deal: CandidateDeal, profile: UserProfile): number {
  let score = 0;

  const storeSlug = (deal.canonicalSlug || deal.storeSlug || '').toLowerCase();
  const category = deal.smartCategory || deal.storeCategory || deal.category || '';

  // 1. Store Affinity
  if (profile.storeAffinities[storeSlug]) {
    score += profile.storeAffinities[storeSlug] * 15;
  }

  // 2. Category Affinity
  if (profile.categoryAffinities[category]) {
    score += profile.categoryAffinities[category] * 10;
  }

  // 3. GEO Match
  const allowedGeos = STORE_GEOS[storeSlug] || ['GLOBAL'];
  if (allowedGeos.includes(profile.geo)) {
    score += 25;
  } else if (allowedGeos.includes('GLOBAL')) {
    score += 10;
  }

  // 4. Promo Code presence (codes convert higher than direct deals)
  if (deal.code && deal.code.trim().length > 0) {
    score += 8;
  }

  // 5. Discount Magnitude
  score += Math.min(extractDiscountValue(deal), 80) * 0.2;

  // 6. Top Pick bonus
  if (deal.isTopPick) {
    score += 12;
  }

  return score;
}

/**
 * Return #1 highest scoring unclaimed deal matching user's context
 */
export function getRecoveryOffer(deals: CandidateDeal[], customProfile?: UserProfile): CandidateDeal | null {
  const profile = customProfile || getUserProfile();
  const claimedSet = new Set(profile.claimedDealIds);

  // 1. Filter unclaimed & valid GEO deals
  const candidates = deals.filter(deal => {
    if (claimedSet.has(deal.id) || (deal.code && claimedSet.has(deal.code))) {
      return false;
    }
    const storeSlug = (deal.canonicalSlug || deal.storeSlug || '').toLowerCase();
    const allowedGeos = STORE_GEOS[storeSlug] || ['GLOBAL'];

    if (profile.geo === 'GLOBAL') return true;
    return allowedGeos.includes(profile.geo) || allowedGeos.includes('GLOBAL');
  });

  if (candidates.length === 0) {
    // If all strictly filtered deals are exhausted, fallback to top global deals
    return deals[0] || null;
  }

  // 2. Sort by scoreDeal descending, breaking ties by discount value
  candidates.sort((a, b) => {
    const scoreA = scoreDeal(a, profile);
    const scoreB = scoreDeal(b, profile);
    if (scoreB !== scoreA) return scoreB - scoreA;

    return extractDiscountValue(b) - extractDiscountValue(a);
  });

  return candidates[0] || null;
}

/**
 * Check if the recovery popup/sticky bar can be shown according to frequency capping
 */
export function canShowRecovery(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Strict cap: Once per session
    if (sessionStorage.getItem(RECOVERY_SHOWN_KEY)) {
      return false;
    }

    // 2. Dismissal cooldown: 24 hours
    const dismissedUntil = localStorage.getItem(RECOVERY_DISMISSED_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return false;
    }

    // 3. Conversion suppression: Do not interrupt if user converted in last 60 seconds
    const lastConversion = sessionStorage.getItem(LAST_CONVERSION_KEY);
    if (lastConversion && Date.now() - parseInt(lastConversion, 10) < 60 * 1000) {
      return false;
    }
  } catch (e) {}

  return true;
}

/**
 * Record that recovery component was triggered and shown in this session
 */
export function recordRecoveryShown(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RECOVERY_SHOWN_KEY, '1');
  } catch (e) {}
}

/**
 * Record user dismissal (sets 24h cooldown)
 */
export function recordRecoveryDismissed(): void {
  if (typeof window === 'undefined') return;
  try {
    const cooldown = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem(RECOVERY_DISMISSED_KEY, String(cooldown));
    sessionStorage.setItem(RECOVERY_SHOWN_KEY, '1');
  } catch (e) {}
}

