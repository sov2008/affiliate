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

