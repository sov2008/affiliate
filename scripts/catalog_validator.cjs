/**
 * Unified Catalog Validator for PromoRadar
 * 
 * Enforces critical business and regulatory compliance rules across Admitad, CJ, and partner feeds
 * prior to persisting data into deals-portal/src/data/couponsData.ts:
 * 
 * 1. Rule 8 (GEO & Domain Ban):
 *    - Strict ban on .ru, .by, .kz, .su, .рф, .бел domains.
 *    - Strict ban on RU/BY/KZ regions and entities (Россия, Беларусь, Казахстан).
 *    - Strict ban on RUB / BYN / KZT currencies (RUB, BYN, KZT, руб, ₽, тенге, ₸).
 * 
 * 2. Rule 2 (Zero Demo Data & Real Deals Only):
 *    - Coupons must have genuine non-empty codes if code is specified or coupon-type.
 *    - Banned placeholders: /^(test|demo|sample|fake|example|12345|promo|null|undefined)$/i.
 *    - Expiration check: Reject deals with endDate < Date.now().
 * 
 * 3. Store Domain & Deduplication:
 *    - Verification against STORE_DOMAINS_MAP in storeDomains.ts or valid websiteUrl.
 *    - Deduplication by coupon ID and content signature.
 * 
 * 4. Summary & Audit Logging:
 *    - Comprehensive breakdown of accepted vs rejected deals.
 */

const fs = require('fs');
const path = require('path');

// Regex patterns for Rule 8 (Banned domains, TLDs, regions, and currencies)
const BANNED_TLD_REGEX = /\.(ru|by|kz|su|xn--p1ai|xn--90ais)(\/|$|\?)/i;
const BANNED_GEO_REGEX = /\b(BY|RU|KZ|RUS|BLR|KAZ|Belarus|Russia|Kazakhstan|Беларусь|Белоруссия|Россия|Казахстан|РФ)\b/i;
const BANNED_CURRENCY_REGEX = /\b(RUB|BYN|KZT)\b|[\u20BD\u20B8]|руб|рубл|копе|тенге/i;

// Regex patterns for Rule 2 (Demo/Placeholder detection)
const PLACEHOLDER_CODE_REGEX = /^(test|demo|sample|fake|example|12345|promo|null|undefined|none|n\/a|tbd)$/i;

// Load STORE_DOMAINS_MAP from storeDomains.ts
function loadStoreDomainsMap() {
  const domainsFilePath = path.resolve(__dirname, '../deals-portal/src/data/storeDomains.ts');
  if (!fs.existsSync(domainsFilePath)) {
    return {};
  }
  try {
    const content = fs.readFileSync(domainsFilePath, 'utf8');
    const match = content.match(/export const STORE_DOMAINS_MAP: Record<string, string> = (\{[\s\S]*?\n\};)/);
    if (match) {
      const evalMap = new Function(`return ${match[1].replace(/;$/, '')}`);
      return evalMap();
    }
  } catch (err) {
    console.error(`[VALIDATOR] Warning loading storeDomains.ts: ${err.message}`);
  }
  return {};
}

/**
 * Validates whether a store violates Rule 8 (RU/BY/KZ Ban)
 */
function isStoreBanned(store = {}) {
  const name = String(store.name || '').trim();
  const slug = String(store.slug || '').trim();
  const siteUrl = String(store.websiteUrl || store.site_url || '').trim();
  const affUrl = String(store.primaryAffiliateUrl || store.gotolink || store.affiliateUrl || '').trim();
  const desc = String(store.shortDesc || store.fullDesc || store.description || '').trim();
  const regs = Array.isArray(store.regions) ? store.regions.map(r => typeof r === 'string' ? r : r.region) : [];

  // TLD check
  if (BANNED_TLD_REGEX.test(siteUrl) || BANNED_TLD_REGEX.test(affUrl)) {
    return { banned: true, reason: 'banned_tld_domain' };
  }

  // Slug patterns
  if (/-by$/.test(slug) || /-ru$/.test(slug) || /-kz$/.test(slug) || slug === 'by' || slug === 'kz' || slug === 'ru') {
    return { banned: true, reason: 'banned_slug_suffix' };
  }

  // Name patterns
  if (BANNED_GEO_REGEX.test(name) && !/\b(BUY|TRUST|RUBY|KAZOO)\b/i.test(name)) {
    return { banned: true, reason: 'banned_geo_in_name' };
  }

  // Description / Cyrillic brands explicitly bound to RU/BY
  if (/markformelle|meshnology|tengebai|doctorslon/i.test(slug) || /mark\s*formelle/i.test(name)) {
    return { banned: true, reason: 'banned_brand_entity' };
  }
  if (name.includes('Офистон') || name.includes('НА СВЯЗИ') || name.includes('Пятерочка') || name.includes('Яндекс')) {
    return { banned: true, reason: 'banned_ru_by_brand' };
  }

  // Currency references in store descriptions
  if (BANNED_CURRENCY_REGEX.test(desc) || BANNED_CURRENCY_REGEX.test(name)) {
    return { banned: true, reason: 'banned_currency_reference' };
  }

  // Exclusive target regions
  if (regs.length > 0 && regs.every(r => r === 'BY' || r === 'RU' || r === 'KZ')) {
    return { banned: true, reason: 'banned_exclusive_regions' };
  }

  return { banned: false };
}

/**
 * Validates a single deal / coupon against Rule 8, Rule 2, and domain relevance
 */
function validateDeal(deal = {}, store = null, storeDomainsMap = {}) {
  const code = String(deal.code || deal.promocode || '').trim();
  const title = String(deal.title || deal.name || deal.short_name || '').trim();
  const desc = String(deal.description || '').trim();
  const affUrl = String(deal.affiliateUrl || deal.goto_link || deal.url || '').trim();
  const expiry = deal.expiryDate || deal.date_end || '';
  const isCouponType = Boolean(deal.code || deal.promocode || deal.type === 'coupon');

  // 1. Rule 8 Check: GEO / Domain / Currency Ban
  if (BANNED_TLD_REGEX.test(affUrl)) {
    return { valid: false, reason: 'rule8_banned_domain' };
  }
  if (BANNED_GEO_REGEX.test(title) && !/\b(BUY|TRUST|RUBY|KAZOO)\b/i.test(title)) {
    return { valid: false, reason: 'rule8_banned_geo_in_title' };
  }
  if (BANNED_CURRENCY_REGEX.test(title) || BANNED_CURRENCY_REGEX.test(desc) || BANNED_CURRENCY_REGEX.test(deal.discountBadge || '')) {
    return { valid: false, reason: 'rule8_banned_currency' };
  }

  // If associated store is banned
  if (store) {
    const storeBanCheck = isStoreBanned(store);
    if (storeBanCheck.banned) {
      return { valid: false, reason: `rule8_store_${storeBanCheck.reason}` };
    }
  }

  // 2. Rule 2 Check: Strict Zero Demo Data & Placeholders
  if (code) {
    if (PLACEHOLDER_CODE_REGEX.test(code)) {
      return { valid: false, reason: 'rule2_placeholder_code' };
    }
    if (code.length < 2) {
      return { valid: false, reason: 'rule2_code_too_short' };
    }
  } else if (deal.type === 'coupon') {
    // If explicitly marked as coupon but code is empty
    return { valid: false, reason: 'rule2_empty_coupon_code' };
  }

  // Expiration check
  if (expiry) {
    const expDate = new Date(expiry);
    // Add end of day grace period (23:59:59)
    if (!isNaN(expDate.getTime())) {
      expDate.setHours(23, 59, 59, 999);
      if (expDate.getTime() < Date.now()) {
        return { valid: false, reason: 'rule2_expired_deal' };
      }
    }
  }

  // 3. Store Domain & Mapping check
  const slug = deal.storeSlug || (store && store.slug) || '';
  const storeName = deal.storeName || (store && store.name) || '';
  const domainFromMap = storeDomainsMap[slug] || storeDomainsMap[storeName] || storeDomainsMap[storeName.toLowerCase()];
  const hasStoreWebsite = Boolean(store && store.websiteUrl);

  if (!domainFromMap && !hasStoreWebsite && !deal.affiliateUrl) {
    return { valid: false, reason: 'rule3_unmapped_store_domain' };
  }

  return { valid: true };
}

/**
 * Validates entire catalog (stores and deals), dedupes, and produces structured audit stats
 */
function validateCatalog(stores = [], deals = [], options = {}) {
  const storeDomainsMap = options.storeDomainsMap || loadStoreDomainsMap();

  const stats = {
    totalStoresInput: stores.length,
    acceptedStores: 0,
    rejectedStores: 0,
    storesRejectionDetails: {},

    totalDealsInput: deals.length,
    acceptedDeals: 0,
    rejectedDeals: 0,
    dealsRejectionDetails: {
      rule8_banned_domain: 0,
      rule8_banned_geo: 0,
      rule8_banned_currency: 0,
      rule8_store_banned: 0,
      rule2_placeholder_code: 0,
      rule2_empty_coupon_code: 0,
      rule2_code_too_short: 0,
      rule2_expired_deal: 0,
      rule3_unmapped_store_domain: 0,
      duplicate_deal_id: 0,
      other: 0
    }
  };

  // 1. Validate Stores
  const validStoresMap = new Map();
  for (const store of stores) {
    const banCheck = isStoreBanned(store);
    if (banCheck.banned) {
      stats.rejectedStores++;
      stats.storesRejectionDetails[banCheck.reason] = (stats.storesRejectionDetails[banCheck.reason] || 0) + 1;
      continue;
    }

    // Verify domain presence
    const slug = store.slug;
    const name = store.name;
    const domain = storeDomainsMap[slug] || storeDomainsMap[name] || storeDomainsMap[name.toLowerCase()] || store.cleanDomain;
    if (domain && !store.cleanDomain) {
      store.cleanDomain = domain;
    }

    validStoresMap.set(slug, store);
    stats.acceptedStores++;
  }

  // 2. Validate Deals & Deduplicate
  const seenDealIds = new Set();
  const seenDealSignatures = new Set();
  const validDeals = [];

  for (const deal of deals) {
    const dealId = String(deal.id || '').trim();
    if (!dealId || seenDealIds.has(dealId)) {
      stats.rejectedDeals++;
      stats.dealsRejectionDetails.duplicate_deal_id++;
      continue;
    }

    const store = validStoresMap.get(deal.storeSlug);
    if (!store && deal.storeSlug) {
      // If store was rejected or absent
      stats.rejectedDeals++;
      stats.dealsRejectionDetails.rule8_store_banned++;
      continue;
    }

    const validation = validateDeal(deal, store, storeDomainsMap);
    if (!validation.valid) {
      stats.rejectedDeals++;
      const reasonKey = validation.reason.startsWith('rule8_store_') ? 'rule8_store_banned' : validation.reason;
      if (stats.dealsRejectionDetails[reasonKey] !== undefined) {
        stats.dealsRejectionDetails[reasonKey]++;
      } else {
        stats.dealsRejectionDetails.other++;
      }
      continue;
    }

    // Deduplicate by signature (storeSlug + code + title)
    const signature = `${deal.storeSlug}::${deal.code || 'deal'}::${deal.title}`.toLowerCase();
    if (seenDealSignatures.has(signature)) {
      stats.rejectedDeals++;
      stats.dealsRejectionDetails.duplicate_deal_id++;
      continue;
    }

    seenDealIds.add(dealId);
    seenDealSignatures.add(signature);
    validDeals.push(deal);
    stats.acceptedDeals++;
  }

  return {
    validStores: Array.from(validStoresMap.values()),
    validDeals,
    stats
  };
}

/**
 * Pretty formats summary table for stdout and log files
 */
function printValidationSummary(stats, logger = console.log) {
  const line = '━'.repeat(64);
  logger(line);
  logger('🛡️ [PROMORADAR CATALOG VALIDATION AUDIT REPORT]');
  logger(line);
  logger(`🏪 STORES: ${stats.acceptedStores} accepted / ${stats.totalStoresInput} total (${stats.rejectedStores} rejected)`);
  if (stats.rejectedStores > 0) {
    for (const [r, cnt] of Object.entries(stats.storesRejectionDetails)) {
      logger(`   - ❌ Store Rejected [${r}]: ${cnt}`);
    }
  }
  logger(`🎟️ DEALS:  ${stats.acceptedDeals} accepted / ${stats.totalDealsInput} total (${stats.rejectedDeals} rejected)`);
  if (stats.rejectedDeals > 0) {
    logger('   Breakdown of rejected deals:');
    if (stats.dealsRejectionDetails.rule8_banned_domain > 0)
      logger(`   - 🚫 [Rule 8] Banned TLD/Domain (.ru/.by/.kz/.su): ${stats.dealsRejectionDetails.rule8_banned_domain}`);
    if (stats.dealsRejectionDetails.rule8_banned_geo > 0)
      logger(`   - 🚫 [Rule 8] Banned GEO Target (RU/BY/KZ):       ${stats.dealsRejectionDetails.rule8_banned_geo}`);
    if (stats.dealsRejectionDetails.rule8_banned_currency > 0)
      logger(`   - 🚫 [Rule 8] Banned Currency (RUB/BYN/KZT):      ${stats.dealsRejectionDetails.rule8_banned_currency}`);
    if (stats.dealsRejectionDetails.rule8_store_banned > 0)
      logger(`   - 🚫 [Rule 8] Associated Store Banned:            ${stats.dealsRejectionDetails.rule8_store_banned}`);
    if (stats.dealsRejectionDetails.rule2_placeholder_code > 0)
      logger(`   - ⚠️ [Rule 2] Placeholder Promo Code:             ${stats.dealsRejectionDetails.rule2_placeholder_code}`);
    if (stats.dealsRejectionDetails.rule2_empty_coupon_code > 0)
      logger(`   - ⚠️ [Rule 2] Empty Coupon Code:                  ${stats.dealsRejectionDetails.rule2_empty_coupon_code}`);
    if (stats.dealsRejectionDetails.rule2_code_too_short > 0)
      logger(`   - ⚠️ [Rule 2] Code Too Short (<2 chars):          ${stats.dealsRejectionDetails.rule2_code_too_short}`);
    if (stats.dealsRejectionDetails.rule2_expired_deal > 0)
      logger(`   - ⏳ [Rule 2] Expired Offer (endDate < now):      ${stats.dealsRejectionDetails.rule2_expired_deal}`);
    if (stats.dealsRejectionDetails.rule3_unmapped_store_domain > 0)
      logger(`   - 🌐 [Rule 3] Unmapped Domain:                    ${stats.dealsRejectionDetails.rule3_unmapped_store_domain}`);
    if (stats.dealsRejectionDetails.duplicate_deal_id > 0)
      logger(`   - 🔄 [Rule 3] Duplicate Deal ID/Signature:        ${stats.dealsRejectionDetails.duplicate_deal_id}`);
    if (stats.dealsRejectionDetails.other > 0)
      logger(`   - ❓ [Other] Other Validation Failure:            ${stats.dealsRejectionDetails.other}`);
  }
  logger(line);
}

module.exports = {
  loadStoreDomainsMap,
  isStoreBanned,
  validateDeal,
  validateCatalog,
  printValidationSummary,
  BANNED_TLD_REGEX,
  BANNED_GEO_REGEX,
  BANNED_CURRENCY_REGEX,
  PLACEHOLDER_CODE_REGEX
};
