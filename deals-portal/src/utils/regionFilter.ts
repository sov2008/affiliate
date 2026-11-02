/**
 * Comprehensive Geo / Region resolution mapping for stores and affiliate programs.
 * Returns the exact list of valid regions/countries for a store:
 * Regions: 'US', 'EU', 'GCC', 'UA', 'IN', 'MX', 'BR', 'CZ', 'PL', 'KZ', 'GB', 'GLOBAL'
 */
export const STORE_GEO_MAPPING: Record<string, string[]> = {
  // Pure GCC / UAE Offers
  'qasr-alawani': ['GCC'],
  'vogacloset': ['GCC'],
  'dabdoob': ['GCC'],
  'thedealoutlet': ['GCC'],
  'raynatours': ['GCC'],
  'jashanmal': ['GCC'],
  'vperfumes': ['GCC'],
  'nazih': ['GCC'],
  'eyewa-kw-qt-om': ['GCC'],

  // Pure Ukraine Offers
  'touch': ['UA'],
  'polis': ['UA'],
  'turbosto': ['UA'],

  // Pure India Offers
  'bliss-club-in': ['IN'],
  'lenovo-india-in': ['IN'],
  'nveda-in': ['IN'],
  'the-hindu-in': ['IN'],
  'emami-zanducare-in': ['IN'],
  'salty-in': ['IN'],
  'tata-neu-credit-card-cpd-in': ['IN'],
  'r-for-rabbit-in': ['IN'],
  'acer-in': ['IN'],
  'digihaat-in': ['IN'],
  'charles-keith-in': ['IN'],
  'ctrl8-in': ['IN'],

  // Pure Mexico Offers
  'levis-mx': ['MX'],
  'sharkninja-mx': ['MX'],
  'wild-fork-mx': ['MX'],
  'sol-cr-dito-mx': ['MX'],
  'neion-mx': ['MX'],
  'american-eagle-mx': ['MX'],
  'cheapvuelos': ['MX', 'US', 'GLOBAL'],
  'fiesta-credito': ['MX'],

  // Pure Brazil Offers
  'saude-abril-br-grupo-abril': ['BR'],
  'shopee-cpa-br': ['BR'],
  'shopee-br': ['BR'],
  'bold-snacks-br': ['BR'],
  'phooto-br': ['BR'],
  'guldi-br': ['BR'],
  'eset-br': ['BR'],
  'shopee-brazil': ['BR'],

  // Pure Czech Republic Offers
  'zonky-cz': ['CZ', 'EU'],
  'nazivnost-cz': ['CZ', 'EU'],
  'coolcredit-cz': ['CZ', 'EU'],
  'kenwood-cz': ['CZ', 'EU'],
  'proficredit-cz': ['CZ', 'EU'],

  // Pure Poland Offers
  'megogo-pl': ['PL', 'EU'],
  'konesso-pl': ['PL', 'EU'],
  'katalog-marze-pl': ['PL', 'EU'],

  // Pure Kazakhstan Offers
  'ya-man-kz': ['KZ'],
  'doctorslon-kz': ['KZ'],

  // Pure UK Offers
  'xplora-uk': ['GB', 'EU'],
  'xplora-uk-affiliate-programme': ['GB', 'EU'],
  'smart-spending-l-snoop-finance-cpa-android-uk': ['GB', 'EU'],

  // Pure US Offers
  '945industries': ['US'],
  'diecast1': ['US'],
  'directdeals-10-standard-terms-bonuses': ['US'],
  'verified-match': ['US'],
  'discreet-local': ['US'],
  'spokeo': ['US'],
  'bannerbuzz': ['US'],
  'bannerbuzz-terms': ['US'],
  'wristbandexpress-com-default-terms-10-commission-updated-2026': ['US'],
  'wristbandexpress': ['US'],
  'paternitylab-com-program-terms': ['US'],
  'paternitylab': ['US'],

  // Multi-region Global Brands
  'expressvpn': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'purevpn': ['GLOBAL', 'US', 'EU', 'GCC'],
  'nordvpn': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'surfshark': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'hostinger': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'alibaba': ['GLOBAL', 'US', 'EU', 'GCC'],
  'aliexpress': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'airalo': ['GLOBAL', 'US', 'EU', 'GCC', 'UA'],
  'allpowers': ['GLOBAL', 'US', 'EU', 'UA'],
  'chicme': ['GLOBAL', 'US', 'EU'],
  'glasseslit': ['GLOBAL', 'US', 'EU'],
  'kodland': ['GLOBAL', 'EU', 'UA'],
  'keepersecurity': ['GLOBAL', 'US', 'EU'],
  'qustodio': ['GLOBAL', 'US', 'EU'],
  'abelssoft': ['GLOBAL', 'US', 'EU'],
  'onlinesim': ['GLOBAL', 'EU', 'UA']
};

/**
 * Returns strictly allowed regions for a given merchant or deal slug.
 * If the store is designated for a specific geo (e.g. GCC or UA or MX),
 * it returns only that region and NOT 'GLOBAL', ensuring it never leaks into other regions.
 */
export function getStoreAllowedRegions(slug = '', brandName = ''): string[] {
  const s = slug.toLowerCase();
  const b = brandName.toLowerCase();

  // 1. Explicit map check
  if (STORE_GEO_MAPPING[s]) {
    return STORE_GEO_MAPPING[s];
  }
  for (const [key, val] of Object.entries(STORE_GEO_MAPPING)) {
    if (s.includes(key) || key.includes(s)) return val;
  }

  // 2. Exact geo suffix & keyword detection
  if (s.endsWith('-in') || s.includes('-in-') || b.includes(' india') || s.includes('biba') || s.includes('tata-neu') || s.includes('zanducare') || s.includes('bliss-club')) return ['IN'];
  if (s.endsWith('-mx') || s.includes('-mx-') || b.includes(' mexico') || s.includes('fiesta-credito') || s.includes('sol-cr')) return ['MX'];
  if (s.endsWith('-br') || s.includes('-br-') || b.includes(' brasil') || b.includes(' brazil') || s.includes('shopee-brazil') || s.includes('phooto') || s.includes('guldi')) return ['BR'];
  if (s.endsWith('-cz') || s.includes('-cz-') || b.includes(' czech') || s.includes('zonky') || s.includes('nazivnost') || s.includes('proficredit') || s.includes('coolcredit')) return ['CZ', 'EU'];
  if (s.endsWith('-pl') || s.includes('-pl-') || b.includes(' poland') || s.includes('konesso') || s.includes('katalog-marze') || s.includes('megogo-pl')) return ['PL', 'EU'];
  if (s.endsWith('-kz') || s.includes('-kz-') || b.includes(' kazakhstan') || s.includes('ya-man-kz') || s.includes('doctorslon')) return ['KZ'];
  if (s.endsWith('-ua') || s.includes('-ua-') || s.includes('touch') || s.includes('polis') || s.includes('turbosto') || s.includes('punisher') || b.includes(' ukraine')) return ['UA'];
  if (s.endsWith('-uk') || s.includes('-uk-') || b.includes(' united kingdom') || s.includes('xplora-uk') || s.includes('snoop-finance')) return ['GB', 'EU'];
  if (s.endsWith('-de') || s.includes('-de-') || b.includes(' germany') || s.includes('abelssoft')) return ['DE', 'EU'];
  if (s.endsWith('-fr') || s.includes('-fr-') || b.includes(' france')) return ['FR', 'EU'];
  if (s.endsWith('-id') || s.includes('-id-') || b.includes(' indonesia')) return ['ID'];
  if (s.endsWith('-ph') || s.includes('-ph-') || b.includes(' philippines')) return ['PH'];
  if (s.endsWith('-by') || b.includes(' belarus')) return ['BY'];
  if (['kw', 'om', 'sa', 'dubai', 'uae', 'rayna', 'dabdoob', 'vperfumes', 'jashanmal', 'nazih', 'vogacloset', 'thedealoutlet', 'qasr', 'eyewa'].some(k => s.includes(k))) return ['GCC'];
  if (['usa', 'spokeo', 'discreet', 'verified-match', '945', 'wild-fork', 'directdeals', 'bannerbuzz', 'wristband', 'diecast1'].some(k => s.includes(k))) return ['US'];

  // 3. Fallback: standard worldwide global stores that operate across US, EU and Worldwide
  return ['GLOBAL', 'US', 'EU'];
}

/**
 * Checks whether a store/deal is allowed in the target region.
 * Target regions:
 * - 'GLOBAL' / 'ALL' -> all stores
 * - 'US' -> only stores supporting 'US' (regional GCC / UA / IN etc. are excluded!)
 * - 'EU' -> only stores supporting 'EU'
 * - 'GCC' -> only stores supporting 'GCC'
 * - 'UA' -> only stores supporting 'UA'
 */
export function isDealAllowedInRegion(dealRegions: string[], targetRegion: string): boolean {
  if (!targetRegion || targetRegion === 'ALL' || targetRegion === 'GLOBAL') {
    return true;
  }
  return dealRegions.includes(targetRegion);
}

/**
 * Detects the intrinsic or localized language of a deal based on its content and store slug.
 * Supported locales: 'en', 'ar', 'es', 'pt', 'de', 'ua', 'pl', 'cs'
 */
export function detectDealLanguage(deal: { storeSlug?: string; title?: string; description?: string }): string {
  const s = (deal.storeSlug || '').toLowerCase();
  const t = (deal.title || '') + ' ' + (deal.description || '');

  // Exact localized slug stems
  if (s.endsWith('-mx') || s.includes('-mx-')) return 'es';
  if (s.endsWith('-br') || s.includes('-br-')) return 'pt';
  if (s.endsWith('-cz') || s.includes('-cz-')) return 'cs';
  if (s.endsWith('-pl') || s.includes('-pl-')) return 'pl';
  if (s.endsWith('-ua') || s.includes('-ua-') || s === 'touch' || s === 'polis' || s === 'turbosto') return 'ua';
  if (s.endsWith('-de') || s.includes('-de-')) return 'de';

  // National character heuristics
  if (/[іІїЇєЄ]/.test(t)) return 'ua';
  if (/[čďěňřšťůžČĎĚŇŘŠŤŮŽ]/.test(t)) return 'cs';
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(t)) return 'pl';
  if (/[ãõÃÕçÇ]/.test(t)) return 'pt';
  if (/[áéíóúÁÉÍÓÚñÑ]/.test(t)) return 'es';
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/[äöüÄÖÜß]/.test(t)) return 'de';

  // Default international English
  return 'en';
}

/**
 * Validates whether a deal should be visible given the user's selected language.
 * Strict localization rule:
 * - When user chooses English ('en'), show universal English deals AND multi-region deals,
 *   while excluding deals that are written exclusively in foreign regional languages.
 * - When user chooses a specific regional language (e.g. 'ua', 'es', 'pt', 'pl', 'cs', 'de', 'ar'),
 *   show deals in that selected language AND universal English baseline deals.
 */
export function isDealAllowedInLanguage(dealLang: string, currentLang: string): boolean {
  const userLang = (currentLang || 'en').toLowerCase();
  const dLang = (dealLang || 'en').toLowerCase();

  // If user selected English: only allow English offers
  if (userLang === 'en') {
    return dLang === 'en';
  }

  // If user selected a specific language (e.g. 'ua', 'es', 'de', 'pt', 'pl', 'cs', 'ar'):
  // Show offers in that language + English baseline offers
  return dLang === userLang || dLang === 'en';
}

