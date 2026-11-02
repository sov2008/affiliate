/**
 * Pre-Build & Post-Build Data Hygiene Gate for PromoRadar Deals Portal
 * 
 * Verifies:
 * 1. Zero raw CPA / affiliate network leak tokens in store names, titles, and descriptions.
 * 2. 100% uniqueness of store slugs and canonical store names.
 * 3. Zero active offers with an expired date earlier than today (YYYY-MM-DD).
 * 4. Minimum inventory thresholds (>= 15 active deals, >= 10 unique stores).
 * 5. If post-build (dist/ exists), scans dist/index.html to ensure zero CPA leaks in compiled markup.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COUPONS_DATA, STORES_DATA } from '../src/data/couponsData';
import { getUniqueCleanStores, resolveMerchantIdentity, isJunkTestOffer } from '../src/utils/dealNormalizer';
import { sanitizeStoreName, normalizeExpiryDate } from '../src/utils/normalizeStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const FORBIDDEN_CPA_REGEX = /\b(Default Payout|RS S2S|Public Affiliate Terms|with performance incentives|\$4\/\$20\/\$27 CPA|Base 4%|Default US\/CA|OYO 3% Term)\b/i;

function runHygieneCheck(): void {
  console.log('🔍 [PromoRadar Hygiene Gate] Starting strict data and build validation...');
  let hasErrors = false;
  const errors: string[] = [];

  // --- Step 1: Minimum Inventory Check ---
  console.log(`📦 Checking inventory volume (deals: ${COUPONS_DATA.length}, raw stores: ${STORES_DATA.length})...`);
  if (COUPONS_DATA.length < 15) {
    errors.push(`[INVENTORY] Insufficient active deals: found ${COUPONS_DATA.length}, expected at least 15.`);
    hasErrors = true;
  }

  // --- Step 2: Canonical Store Normalization & Deduplication ---
  const cleanStores = getUniqueCleanStores(STORES_DATA, COUPONS_DATA);
  console.log(`🏬 Checking canonical store entities (unique resolved: ${cleanStores.length})...`);
  if (cleanStores.length < 10) {
    errors.push(`[INVENTORY] Insufficient unique canonical stores: found ${cleanStores.length}, expected at least 10.`);
    hasErrors = true;
  }

  const seenSlugs = new Set<string>();
  const seenNames = new Set<string>();

  for (const store of cleanStores) {
    // Check for duplicate slugs
    if (seenSlugs.has(store.slug)) {
      errors.push(`[DUPLICATE STORE] Duplicate store slug detected: "${store.slug}".`);
      hasErrors = true;
    }
    seenSlugs.add(store.slug);

    // Check for duplicate names (case-insensitive)
    const normName = store.name.trim().toLowerCase();
    if (seenNames.has(normName)) {
      errors.push(`[DUPLICATE STORE] Duplicate store name detected: "${store.name}".`);
      hasErrors = true;
    }
    seenNames.add(normName);

    // Check for CPA leaks in store name or shortDesc
    if (FORBIDDEN_CPA_REGEX.test(store.name)) {
      errors.push(`[CPA LEAK] Forbidden affiliate token in store name: "${store.name}".`);
      hasErrors = true;
    }
    if (store.shortDesc && FORBIDDEN_CPA_REGEX.test(store.shortDesc)) {
      errors.push(`[CPA LEAK] Forbidden affiliate token in store description (${store.name}): "${store.shortDesc}".`);
      hasErrors = true;
    }
  }

  // --- Step 3: Deal Integrity & CPA Leak Check ---
  console.log(`🎟️ Checking deals for forbidden CPA tokens and date roll-forward...`);
  const today = new Date().toISOString().split('T')[0];

  for (const deal of COUPONS_DATA) {
    const rawBrand = deal.storeName || deal.merchant || '';
    const cleanBrand = sanitizeStoreName(rawBrand);
    const title = deal.title || '';
    const description = deal.description || '';
    const expiry = normalizeExpiryDate(deal.expires);

    // Check forbidden regex on brand, title, description
    if (FORBIDDEN_CPA_REGEX.test(rawBrand)) {
      errors.push(`[CPA LEAK] Deal ID "${deal.id}" contains forbidden token in raw storeName: "${rawBrand}".`);
      hasErrors = true;
    }
    if (FORBIDDEN_CPA_REGEX.test(cleanBrand)) {
      errors.push(`[CPA LEAK] Deal ID "${deal.id}" contains forbidden token in cleaned brand: "${cleanBrand}".`);
      hasErrors = true;
    }
    if (FORBIDDEN_CPA_REGEX.test(title)) {
      errors.push(`[CPA LEAK] Deal ID "${deal.id}" contains forbidden token in title: "${title}".`);
      hasErrors = true;
    }
    if (FORBIDDEN_CPA_REGEX.test(description)) {
      errors.push(`[CPA LEAK] Deal ID "${deal.id}" contains forbidden token in description: "${description}".`);
      hasErrors = true;
    }

    // Check expiry date
    if (expiry < today) {
      errors.push(`[EXPIRED DEAL] Deal ID "${deal.id}" (${cleanBrand}) has expired date: ${expiry} < ${today}.`);
      hasErrors = true;
    }
  }

  // --- Step 4: Post-Build HTML Inspection (if dist/ exists) ---
  const distIndexPath = path.join(ROOT_DIR, 'dist', 'index.html');
  if (fs.existsSync(distIndexPath)) {
    console.log(`🌐 Inspecting compiled build artifact: ${distIndexPath}...`);
    const htmlContent = fs.readFileSync(distIndexPath, 'utf-8');
    const match = htmlContent.match(FORBIDDEN_CPA_REGEX);
    if (match) {
      errors.push(`[COMPILED HTML LEAK] dist/index.html contains forbidden CPA token: "${match[0]}".`);
      hasErrors = true;
    }
  }

  // --- Output Results ---
  if (hasErrors) {
    console.error('\n❌ [PromoRadar Hygiene Gate FAILED]');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error(`Total violations: ${errors.length}\n`);
    process.exit(1);
  }

  console.log('\n✅ [PromoRadar Hygiene Gate PASSED]');
  console.log(`  - 0 CPA leaks found across ${COUPONS_DATA.length} deals.`);
  console.log(`  - ${cleanStores.length} unique canonical stores validated without duplicate slugs.`);
  console.log(`  - 100% active offers have valid future/evergreen expiry dates (>= ${today}).`);
  if (fs.existsSync(distIndexPath)) {
    console.log(`  - Compiled dist/index.html verified clean.`);
  }
  process.exit(0);
}

runHygieneCheck();

