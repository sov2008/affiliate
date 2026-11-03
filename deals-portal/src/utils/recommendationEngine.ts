/**
 * Privacy-First Client-Side Recommendation & Personalization Engine for PromoRadar
 * 
 * Complies 100% with STRICT ZERO DEMO DATA RULE (AGENTS.md):
 * - Records ONLY real user interactions (category clicks, searches, coupon reveals, copies, external merchant redirects)
 * - Persists zero-party intent locally in localStorage
 * - Calculates multi-dimensional relevance scoring
 * - Powers tailored Hero Deal, Spotlight, and "Recommended For You" modules
 */

export interface UserAffinityProfile {
  categories: Record<string, number>; // categoryName -> interaction score
  stores: Record<string, number>;     // storeSlug -> interaction score
  revealedDeals: string[];            // dealIds clicked
  copiedDeals: string[];              // dealIds copied
  preferredRegion: string;            // 'GLOBAL', 'US', 'EU', 'GCC', 'UA', etc.
  preferredLang: string;              // 'en', 'ar', 'es', 'ua', etc.
  lastActive: number;
}

const STORAGE_KEY = 'promoradar_user_affinity';

export function getUserAffinity(): UserAffinityProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        categories: parsed.categories || {},
        stores: parsed.stores || {},
        revealedDeals: Array.isArray(parsed.revealedDeals) ? parsed.revealedDeals : [],
        copiedDeals: Array.isArray(parsed.copiedDeals) ? parsed.copiedDeals : [],
        preferredRegion: parsed.preferredRegion || localStorage.getItem('promoradar_selected_region') || 'GLOBAL',
        preferredLang: parsed.preferredLang || localStorage.getItem('promoradar_lang') || 'en',
        lastActive: parsed.lastActive || Date.now()
      };
    }
  } catch (e) {}

  return {
    categories: {},
    stores: {},
    revealedDeals: [],
    copiedDeals: [],
    preferredRegion: 'GLOBAL',
    preferredLang: 'en',
    lastActive: Date.now()
  };
}

export function saveUserAffinity(profile: UserAffinityProfile): void {
  try {
    profile.lastActive = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {}
}

/**
 * Record user interactions with real weights:
 * - Category Tab Click: +2
 * - Store Filter Click / Ticker Brand Click: +3
 * - Coupon Reveal Click: +6
 * - Code Copy: +8
 * - Outbound Affiliate Click (/go): +10
 */
export function trackInteraction(
  type: 'category' | 'store' | 'reveal' | 'copy' | 'affiliate_click',
  payload: { category?: string; storeSlug?: string; dealId?: string }
): void {
  const profile = getUserAffinity();

  if (type === 'category' && payload.category) {
    profile.categories[payload.category] = (profile.categories[payload.category] || 0) + 2;
  } else if (type === 'store' && payload.storeSlug) {
    profile.stores[payload.storeSlug] = (profile.stores[payload.storeSlug] || 0) + 3;
  } else if (type === 'reveal' && payload.dealId) {
    if (!profile.revealedDeals.includes(payload.dealId)) {
      profile.revealedDeals.push(payload.dealId);
    }
    if (payload.category) {
      profile.categories[payload.category] = (profile.categories[payload.category] || 0) + 6;
    }
    if (payload.storeSlug) {
      profile.stores[payload.storeSlug] = (profile.stores[payload.storeSlug] || 0) + 6;
    }
  } else if (type === 'copy' && payload.dealId) {
    if (!profile.copiedDeals.includes(payload.dealId)) {
      profile.copiedDeals.push(payload.dealId);
    }
    if (payload.category) {
      profile.categories[payload.category] = (profile.categories[payload.category] || 0) + 8;
    }
    if (payload.storeSlug) {
      profile.stores[payload.storeSlug] = (profile.stores[payload.storeSlug] || 0) + 8;
    }
  } else if (type === 'affiliate_click') {
    if (payload.category) {
      profile.categories[payload.category] = (profile.categories[payload.category] || 0) + 10;
    }
    if (payload.storeSlug) {
      profile.stores[payload.storeSlug] = (profile.stores[payload.storeSlug] || 0) + 10;
    }
  }

  saveUserAffinity(profile);
}

/**
 * Score and rank offers based on real user affinity vector & geo relevance
 */
export function scoreDeal(
  deal: { id: string; storeSlug: string; category?: string; badge?: string; discountVal?: number },
  profile: UserAffinityProfile,
  allowedRegionsForStore: string[] = ['GLOBAL']
): number {
  let score = 0;

  // 1. Geo alignment score (Primary Gatekeeper)
  const userRegion = profile.preferredRegion;
  if (userRegion === 'ALL' || userRegion === 'GLOBAL') {
    score += 5;
  } else if (allowedRegionsForStore.includes(userRegion) || allowedRegionsForStore.includes('GLOBAL')) {
    score += 25; // High priority for localized matching
  } else {
    return -100; // Incompatible region: deprioritize
  }

  // 2. Category Affinity score
  if (deal.category && profile.categories[deal.category]) {
    score += Math.min(40, profile.categories[deal.category] * 2.5);
  }

  // 3. Store Affinity score
  if (profile.stores[deal.storeSlug]) {
    score += Math.min(30, profile.stores[deal.storeSlug] * 3);
  }

  // 4. Discount Depth / Urgency weight
  if (deal.discountVal && deal.discountVal > 40) {
    score += 10;
  } else if (deal.discountVal && deal.discountVal > 20) {
    score += 5;
  }

  // 5. Already revealed / copied bonus or decay (avoid fatigue while keeping relevant)
  if (profile.copiedDeals.includes(deal.id)) {
    score -= 5; // User already copied this specific code
  }

  return score;
}

/**
 * Auto-attach event listeners on client load
 */
export function initRecommendationListeners(): void {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Track Category Button Click
    const catBtn = target.closest('[data-cat]') as HTMLElement | null;
    if (catBtn) {
      const cat = catBtn.getAttribute('data-cat');
      if (cat && cat !== 'ALL') {
        trackInteraction('category', { category: cat });
      }
    }

    // Track Brand Ticker / Store Filter Click
    const storeLink = target.closest('[data-filter-store]') as HTMLElement | null;
    if (storeLink) {
      const storeName = storeLink.getAttribute('data-filter-store');
      if (storeName) {
        trackInteraction('store', { storeSlug: storeName.toLowerCase().replace(/[^a-z0-9]/g, '-') });
      }
    }

    // Track Coupon Reveal Click
    const revealBtn = target.closest('[data-reveal-deal]') as HTMLElement | null;
    if (revealBtn) {
      try {
        const raw = revealBtn.getAttribute('data-reveal-deal');
        if (raw) {
          const deal = JSON.parse(raw);
          trackInteraction('reveal', {
            dealId: deal.id,
            storeSlug: deal.storeSlug,
            category: deal.category
          });
        }
      } catch (err) {}
    }

    // Track Copy Code Action
    const copyBtn = target.closest('#copyCodeBtn, #copyStoreCodeBtn') as HTMLElement | null;
    if (copyBtn) {
      const currentDealId = copyBtn.getAttribute('data-active-deal-id') || '';
      trackInteraction('copy', { dealId: currentDealId });
    }

    // Track Outbound Affiliate Click (/go?)
    const affLink = target.closest('a[href*="/go?"]') as HTMLAnchorElement | null;
    if (affLink) {
      const storeSlug = affLink.getAttribute('data-store-slug') || '';
      trackInteraction('affiliate_click', { storeSlug });
    }
  });

  // Track Region Change
  window.addEventListener('promoradar_region_changed', (e: any) => {
    const reg = e.detail?.region;
    if (reg) {
      const prof = getUserAffinity();
      prof.preferredRegion = reg;
      saveUserAffinity(prof);
    }
  });

  // Track Language Change
  window.addEventListener('promoradar_lang_changed', (e: any) => {
    const lang = e.detail?.lang;
    if (lang) {
      const prof = getUserAffinity();
      prof.preferredLang = lang;
      saveUserAffinity(prof);
    }
  });
}

