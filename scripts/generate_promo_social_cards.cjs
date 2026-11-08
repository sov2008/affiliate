/**
 * Batch Social Cards Generator for PromoRadar
 * Generates PNG and WebP 1200x630 (X/Telegram) and 1000x1500 (Pinterest)
 * for Deal of the Day and Head-to-Head Compare pages
 */

const fs = require('fs');
const path = require('path');
const { SocialCardGeneratorService } = require('./social_card_generator.cjs');

// Parse COUPONS_DATA and STORES_DATA from TypeScript file safely
function loadCouponsData() {
  const tsContent = fs.readFileSync(path.resolve(__dirname, '../deals-portal/src/data/couponsData.ts'), 'utf8');
  
  // Extract stores array
  const storesMatch = tsContent.match(/export const STORES_DATA: StoreProfile\[\] = (\[[\s\S]*?\]);\s*export const COUPONS_DATA/);
  // Extract coupons array
  const couponsMatch = tsContent.match(/export const COUPONS_DATA: CouponDeal\[\] = (\[[\s\S]*?\]);\s*export const FEATURED_STORES/);

  let stores = [];
  let coupons = [];

  if (storesMatch) {
    try {
      stores = eval(storesMatch[1]);
    } catch (e) {
      console.warn('Could not eval stores via regex', e.message);
    }
  }

  if (couponsMatch) {
    try {
      coupons = eval(couponsMatch[1]);
    } catch (e) {
      console.warn('Could not eval coupons via regex', e.message);
    }
  }

  return { stores, coupons };
}

async function main() {
  console.log('🖼️ Starting Batch PromoRadar Social Card Generation...');
  const generator = new SocialCardGeneratorService();
  const { stores, coupons } = loadCouponsData();

  const storeMap = new Map(stores.map(s => [s.slug, s]));

  // 1. Generate for Top Stores / Deal of the Day
  const featuredSlugs = [
    'expressvpn', 'hostinger', 'chicme', 'vogacloset', 'airalo',
    'raynatours', 'keepersecurity', 'alibaba', 'aliexpress', 'allpowers'
  ];

  let dealCount = 0;
  for (const slug of featuredSlugs) {
    const store = storeMap.get(slug);
    if (!store) continue;

    const storeDeals = coupons.filter(c => c.storeSlug === slug);
    const topDeal = storeDeals[0] || {
      title: `${store.name} Verified Handshake Vouchers`,
      description: store.description,
      discount: 'Verified Deal',
      code: 'CLAIM DEAL'
    };

    const cardData = {
      storeName: store.name,
      storeSlug: store.slug,
      category: store.category,
      discountBadge: topDeal.discount || 'TOP DEAL',
      savingsLabel: 'EST. SAVINGS:',
      savingsValue: topDeal.discount.includes('%') ? `Up to ${topDeal.discount}` : '$45.00 NET',
      code: topDeal.code && topDeal.code !== 'NO_CODE_REQUIRED' ? topDeal.code : 'HANDSHAKE LINK',
      title: topDeal.title,
      description: topDeal.description || store.description,
      domain: store.websiteUrl ? new URL(store.websiteUrl).hostname.replace('www.', '') : 'promoradar.store'
    };

    await generator.generateDealLandscapeCard(cardData, `deal_${slug}_landscape`);
    await generator.generateDealPinterestCard(cardData, `deal_${slug}_pinterest`);
    dealCount++;
  }
  console.log(`✅ Generated social cards for ${dealCount} top deal merchants.`);

  // 2. Generate for Key Head-to-Head Compare pairs
  const topPairs = [
    {
      pairSlug: 'aliexpress-vs-alibaba',
      category: 'E-Commerce & Wholesale',
      storeAName: 'AliExpress',
      storeBName: 'Alibaba',
      maxDiscountA: '85% OFF',
      maxDiscountB: '$20 OFF',
      activeCodesA: 18,
      activeCodesB: 6,
      estSavingsA: '$32.50 NET',
      estSavingsB: '$65.00 NET',
      title: 'AliExpress vs Alibaba: Retail Dropship vs Factory Wholesale'
    },
    {
      pairSlug: 'expressvpn-vs-purevpn',
      category: 'Privacy & Security',
      storeAName: 'ExpressVPN',
      storeBName: 'PureVPN',
      maxDiscountA: '81% OFF',
      maxDiscountB: '20% OFF',
      activeCodesA: 4,
      activeCodesB: 3,
      estSavingsA: '$84.20 NET',
      estSavingsB: '$35.00 NET',
      title: 'ExpressVPN vs PureVPN: Lightway Protocol vs WireGuard Multi-Year'
    },
    {
      pairSlug: 'chicme-vs-vogacloset',
      category: 'Fashion & Apparel',
      storeAName: 'ChicMe',
      storeBName: 'VogaCloset',
      maxDiscountA: '15% EXTRA',
      maxDiscountB: '80% OFF',
      activeCodesA: 5,
      activeCodesB: 8,
      estSavingsA: '$22.00 NET',
      estSavingsB: '$74.00 NET',
      title: 'ChicMe vs VogaCloset: Fast Fashion vs GCC Designer Runway'
    },
    {
      pairSlug: 'raynatours-vs-airalo',
      category: 'Travel & Roaming',
      storeAName: 'Rayna Tours',
      storeBName: 'Airalo eSIM',
      maxDiscountA: '15% OFF',
      maxDiscountB: '10% OFF',
      activeCodesA: 3,
      activeCodesB: 4,
      estSavingsA: '$35.00 NET',
      estSavingsB: '$12.00 NET',
      title: 'Rayna Tours vs Airalo: Desert Safari Passes vs Global Roaming Data'
    },
    {
      pairSlug: 'hostinger-vs-prohoster',
      category: 'Web Hosting & Cloud',
      storeAName: 'Hostinger',
      storeBName: 'ProHoster',
      maxDiscountA: '78% OFF',
      maxDiscountB: '20% OFF',
      activeCodesA: 6,
      activeCodesB: 3,
      estSavingsA: '$110.00 NET',
      estSavingsB: '$25.00 NET',
      title: 'Hostinger vs ProHoster: Managed Cloud vs VPS Infrastructure'
    }
  ];

  let compareCount = 0;
  for (const pair of topPairs) {
    await generator.generateComparisonLandscapeCard(pair, `compare_${pair.pairSlug.replace(/-/g, '_')}_landscape`);
    await generator.generateComparisonPinterestCard(pair, `compare_${pair.pairSlug.replace(/-/g, '_')}_pinterest`);
    compareCount++;
  }
  console.log(`✅ Generated social cards for ${compareCount} comparison pairs.`);

  console.log('🎉 Social Card Generation Complete! Files saved to deals-portal/public/images/social-cards/');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal batch error:', err);
    process.exit(1);
  });
}

module.exports = { main };

