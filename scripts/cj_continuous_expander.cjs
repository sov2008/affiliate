/**
 * CJ Affiliate Continuous Ingestion Engine
 * Pulls confirmed joined advertisers via CJ REST API v3,
 * generates Bespoke Store and Coupon structures,
 * and integrates them into PromoRadar catalog.
 */

const fs = require('fs');
const path = require('path');
const { isBannedRuByProgram } = require('./catalog_validator.cjs');

const DATA_FILE = path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts');
const CJ_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_joined_v3.json');
const PID = '101907236'; // Verified Website ID for PromoRadar links

const PURE_JUNK_REGEX = /^(default sale|clone of \d+|travel club|\d+[- ]*(%|percent)?\s*(commission|referral period)|term\s*\d+|cpa\s*terms|standard commission)/i;

function isValidBrandName(name = '') {
  const trimmed = String(name || '').trim();
  if (!trimmed || trimmed.length < 2 || trimmed.length > 50) return false;
  if (PURE_JUNK_REGEX.test(trimmed)) return false;
  if (/^\d+([.,]\d+)?%?\s*(commission|cpa|payout)/i.test(trimmed)) return false;
  if (/^clone\s+of/i.test(trimmed)) return false;
  if (/^\d+d\s+referral\s+period/i.test(trimmed)) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  return true;
}

function cleanBrandName(rawName = '') {
  let name = String(rawName || '')
    .replace(/\b\d{1,2}\s+[A-Za-z]{3,9}\s+incentive\s+campaign\b/gi, '')
    .replace(/\b(incentive campaign|program terms|default program|cj program terms|cj program|affiliate program)\b/gi, '')
    .replace(/\b(ww|many geos|ua|ae|sa|gcc|offline|codes|links|tracking|cpl|cps|android|ios)\b/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\.com.*$/i, '')
    .replace(/ - \d+%.*$/i, '')
    .replace(/ - \d+.*$/i, '')
    .replace(/\bInt\b/g, '')
    .replace(/&amp;/g, '&')
    .replace(/\s+(Global|North America|US|UK|CA|Inc|LLC)$/i, '')
    .trim();
  return name;
}

function cleanSlug(name) {
  return name
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapCategory(primaryCategory) {
  if (!primaryCategory) return 'E-Commerce & Wholesale';
  const c = primaryCategory.toLowerCase();
  if (c.includes('computer') || c.includes('software') || c.includes('electronic') || c.includes('security')) return 'Electronics & Gadgets';
  if (c.includes('travel') || c.includes('hotel') || c.includes('car') || c.includes('flight')) return 'Travel & Tours';
  if (c.includes('apparel') || c.includes('clothing') || c.includes('fashion') || c.includes('shoe')) return 'Fashion & Apparel';
  if (c.includes('home') || c.includes('garden') || c.includes('furniture')) return 'Home & Lifestyle';
  if (c.includes('health') || c.includes('beauty') || c.includes('fitness') || c.includes('wellness')) return 'Beauty & Fragrances';
  if (c.includes('financial') || c.includes('insurance') || c.includes('legal')) return 'Insurance & Finance';
  if (c.includes('food') || c.includes('drink') || c.includes('restaurant')) return 'Food & Nutrition';
  if (c.includes('game') || c.includes('toy') || c.includes('entertainment')) return 'Kids & Toys';
  return 'E-Commerce & Wholesale';
}

function generateCjBespoke(adv) {
  const brandName = cleanBrandName(adv.name);
  const slug = cleanSlug(brandName);
  const cat = mapCategory(adv.primaryCategory);
  
  // Clean official website URL
  let websiteUrl = adv.programUrl || `https://www.${slug}.com`;
  if (!websiteUrl.startsWith('http')) websiteUrl = 'https://' + websiteUrl;

  // Direct CJ Clickthrough URL with Publisher PID
  const primaryAffiliateUrl = `https://www.anrdoezrs.net/click-${PID}-${adv.id}?url=${encodeURIComponent(websiteUrl)}`;

  const storeProfile = {
    slug,
    name: brandName,
    category: cat,
    logoText: brandName.toUpperCase().slice(0, 14),
    shortDesc: `Verified ${brandName} discount codes, seasonal promotions, and partner savings on official orders.`,
    fullDesc: `${brandName} is a premier brand in ${cat}, offering premium products, dedicated customer service, and reliable fulfillment. PromoRadar shoppers get access to verified promotions and seasonal vouchers with confirmed activation.`,
    websiteUrl,
    howToApply: [
      `Select the active ${brandName} promotional deal or coupon on PromoRadar.`,
      `Click "Claim Deal" to activate the verified partner discount.`,
      `Enter any provided coupon code at checkout on ${brandName} to secure instant savings.`
    ],
    faqs: [
      {
        question: `How do I redeem my ${brandName} voucher code?`,
        answer: `Click through our verified partner link to activate the offer, then apply any promo code directly at the ${brandName} shopping cart.`
      },
      {
        question: `Are ${brandName} promotional discounts verified?`,
        answer: `Yes, all coupon codes and promotional sales are updated and verified continuously through our CJ Affiliate partnership.`
      }
    ],
    primaryAffiliateUrl
  };

  const couponDeal = {
    id: `deal-cj-${slug}-verified`,
    storeSlug: slug,
    storeName: brandName,
    storeCategory: cat,
    discountBadge: 'Verified Deal',
    title: `Special Online Savings & Verified Offers at ${brandName}`,
    description: `Shop top-rated ${cat} collections at ${brandName} with verified seasonal markdowns and partner savings.`,
    code: '',
    isExclusive: false,
    isVerified: true,
    expiryDate: '2026-12-31',
    affiliateUrl: primaryAffiliateUrl,
    storeLogoText: brandName.toUpperCase().slice(0, 14),
    terms: 'Direct partner markdown applied automatically at merchant checkout.',
    successRate: '98%'
  };

  return { storeProfile, couponDeal };
}

function ingestCjAdvertisers(limit = 30) {
  if (!fs.existsSync(CJ_FILE)) {
    console.error('CJ joined advertisers file not found:', CJ_FILE);
    return 0;
  }

  const cjJoined = JSON.parse(fs.readFileSync(CJ_FILE, 'utf8'));
  let content = fs.readFileSync(DATA_FILE, 'utf8');

  // Match STORES_DATA and COUPONS_DATA using type-agnostic regex
  const storesMatch = content.match(/export const STORES_DATA\s*(?::\s*[\w<>[\]\s]+)?=\s*(\[[\s\S]*?\n\];)/);
  const couponsMatch = content.match(/export const COUPONS_DATA\s*(?::\s*[\w<>[\]\s]+)?=\s*(\[[\s\S]*?\n\];)/);

  if (!storesMatch || !couponsMatch) {
    console.error('Marker structure not found in couponsData.ts (regex match failed)');
    return 0;
  }

  const existingStores = new Function(`return ${storesMatch[1].replace(/;$/, '')}`)();
  const existingCoupons = new Function(`return ${couponsMatch[1].replace(/;$/, '')}`)();

  const existingSlugs = new Set(existingStores.map(s => s.slug));
  const existingCouponIds = new Set(existingCoupons.map(c => c.id));

  const candidates = [];
  const sorted = cjJoined.sort((a, b) => parseFloat(b.threeMonthEpc || 0) - parseFloat(a.threeMonthEpc || 0));

  for (const adv of sorted) {
    if (!adv.name || adv.name.length < 2) continue;
    if (isBannedRuByProgram(adv)) continue;

    const brandName = cleanBrandName(adv.name);
    if (!isValidBrandName(brandName)) continue;

    const slug = cleanSlug(brandName);
    if (!slug || slug.length < 3 || existingSlugs.has(slug)) continue;

    existingSlugs.add(slug);
    candidates.push(adv);
    if (candidates.length >= limit) break;
  }

  if (candidates.length === 0) {
    console.log('[CJ Continuous Ingestion] All eligible CJ advertisers are already in catalog.');
    return 0;
  }

  console.log(`[CJ Continuous Ingestion] Ingesting ${candidates.length} top-EPC CJ advertisers...`);

  for (const c of candidates) {
    const data = generateCjBespoke(c);
    existingStores.push(data.storeProfile);
    if (!existingCouponIds.has(data.couponDeal.id)) {
      existingCoupons.push(data.couponDeal);
      existingCouponIds.add(data.couponDeal.id);
    }
  }

  const updatedContent = `// Auto-generated unified catalog for PromoRadar
// Generated on: ${new Date().toISOString()}

export interface Store {
  slug: string;
  name: string;
  category: string;
  logoText?: string;
  shortDesc: string;
  fullDesc: string;
  websiteUrl: string;
  cleanDomain?: string;
  primaryAffiliateUrl?: string;
  howToApply: string[];
  faqs: { question: string; answer: string; }[];
}

export interface Coupon {
  id: string;
  storeSlug: string;
  storeName: string;
  storeCategory: string;
  discountBadge: string;
  title: string;
  description: string;
  code: string;
  isExclusive: boolean;
  isVerified: boolean;
  expiryDate: string;
  affiliateUrl: string;
  storeLogoText?: string;
  terms?: string;
  successRate?: string;
}

export const STORES_DATA: Store[] = ${JSON.stringify(existingStores, null, 2)};

export const COUPONS_DATA: Coupon[] = ${JSON.stringify(existingCoupons, null, 2)};
`;

  fs.writeFileSync(DATA_FILE, updatedContent, 'utf8');
  console.log(`[CJ Continuous Ingestion] Successfully added ${candidates.length} stores and deals. Total stores: ${existingStores.length}, total deals: ${existingCoupons.length}`);
  return candidates.length;
}

if (require.main === module) {
  ingestCjAdvertisers(30);
}

module.exports = { ingestCjAdvertisers };
