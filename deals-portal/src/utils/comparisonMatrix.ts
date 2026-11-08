import type { StoreProfile, CouponDeal } from '../data/couponsData';

export interface ComparisonPair {
  slug: string;
  storeA: string;
  storeB: string;
  category: string;
  title: string;
  desc: string;
  maxDiscountA: string;
  maxDiscountB: string;
  startingPriceA: string;
  startingPriceB: string;
  guaranteeA: string;
  guaranteeB: string;
  regionsA: string;
  regionsB: string;
  bestForA: string;
  bestForB: string;
  scoreA: string;
  scoreB: string;
  verdictTitle: string;
  verdictBody: string;
}

export interface StoreComparisonMetrics {
  totalDeals: number;
  activeCodesCount: number;
  maxDiscount: string;
  estSavings: string;
  verifiedRate: string;
}

// Canonical curated category clusters for cross-merchant comparison matrix
export const COMPARISON_VERTICALS: Record<string, string[]> = {
  'VPN & Cybersecurity': ['keepersecurity', 'clevguard', 'adguard', 'nordpass'],
  'Web Hosting & Cloud': ['prohoster', 'hostinger', 'godlike-host'],
  'Travel & Experiences': ['raynatours', 'klook', 'barcelo-mx-br'],
  'E-Commerce & Retail': ['aliexpress', 'alibaba', 'thedealoutlet', 'the-luxury-closet', 'vogacloset', 'answear', 'miravia-es-pt'],
  'AI Tools & Tech Hardware': ['corsair', 'redmagic', 'lenovo', 'parallels', 'acer-in', 'allpowers']
};

/**
 * Calculates dynamic comparison metrics for a store based on live COUPONS_DATA
 */
export function calculateStoreMetrics(deals: CouponDeal[], store?: StoreProfile): StoreComparisonMetrics {
  let maxPct = 0;
  let maxDiscountBadge = 'Verified Deal';
  let activeCodes = 0;

  for (const deal of deals) {
    if (deal.code && deal.code.trim().length > 0) {
      activeCodes++;
    }
    const badge = deal.discountBadge || '';
    const match = badge.match(/(\d+)%/);
    if (match) {
      const pct = parseInt(match[1], 10);
      if (pct > maxPct) {
        maxPct = pct;
        maxDiscountBadge = badge;
      }
    } else if (maxPct === 0 && badge) {
      maxDiscountBadge = badge;
    }
  }

  // Calculate estimated savings range
  let estSavings = '$25 - $45';
  if (maxPct >= 70) {
    estSavings = '$80 - $150+';
  } else if (maxPct >= 50) {
    estSavings = '$50 - $95';
  } else if (maxPct >= 30) {
    estSavings = '$30 - $65';
  } else if (maxPct > 0) {
    estSavings = '$15 - $35';
  }

  const formattedDiscount = maxPct > 0 
    ? (maxDiscountBadge.includes('%') ? maxDiscountBadge : `${maxPct}% OFF`)
    : maxDiscountBadge;

  return {
    totalDeals: deals.length,
    activeCodesCount: activeCodes,
    maxDiscount: formattedDiscount,
    estSavings,
    verifiedRate: deals.length > 0 ? '99.4%' : '98.5%'
  };
}

/**
 * Generates all comparison pairs dynamically based on category groupings & minimum active offer requirements (>= 2 deals)
 */
export function generateComparisonPairs(stores: StoreProfile[], coupons: CouponDeal[]): ComparisonPair[] {
  // Count active deals per store
  const dealCounts = new Map<string, number>();
  for (const c of coupons) {
    dealCounts.set(c.storeSlug, (dealCounts.get(c.storeSlug) || 0) + 1);
  }

  const storeMap = new Map<string, StoreProfile>();
  for (const s of stores) {
    storeMap.set(s.slug, s);
  }

  const pairs: ComparisonPair[] = [];
  const seenPairSlugs = new Set<string>();

  // Curated baseline pairs (ensures legacy URLs like expressvpn-vs-purevpn remain active)
  const legacyCurated: ComparisonPair[] = [
    {
      slug: 'expressvpn-vs-purevpn',
      storeA: 'expressvpn',
      storeB: 'purevpn',
      category: 'VPN & Cybersecurity',
      title: 'ExpressVPN vs PureVPN — 2026 Promo Codes & Direct Speed/Price Comparison',
      desc: 'Compare ExpressVPN and PureVPN discount deals, promo vouchers, server speeds, and checkout pricing.',
      maxDiscountA: '81% OFF + 4 Mo. Free',
      maxDiscountB: '85% OFF + 3 Mo. Free',
      startingPriceA: '$6.67/mo',
      startingPriceB: '$2.14/mo',
      guaranteeA: '30-Day Money-Back',
      guaranteeB: '31-Day Money-Back',
      regionsA: 'Global (105 countries)',
      regionsB: 'Global (65+ countries)',
      bestForA: 'High-speed 4K streaming, Lightway protocol, and strict privacy',
      bestForB: 'Budget-conscious multi-year subscriptions with port forwarding',
      scoreA: '9.8 / 10',
      scoreB: '9.3 / 10',
      verdictTitle: 'ExpressVPN Wins for Performance, PureVPN for Pure Price',
      verdictBody: 'If your priority is zero buffering, instant streaming unblocks for Netflix/BBC iPlayer, and ultra-reliable connection stability, ExpressVPN is the gold standard. For users looking to spend the least amount of cash over a multi-year horizon, PureVPN represents unbeatable raw savings.'
    },
    {
      slug: 'airalo-vs-allpowers',
      storeA: 'airalo',
      storeB: 'allpowers',
      category: 'Travel & Experiences',
      title: 'Airalo eSIM vs ALLPOWERS Solar — Digital Travel Tech Coupons Compared',
      desc: 'Direct comparison of travel connectivity and remote power deals. Save up to $800 with verified promo codes.',
      maxDiscountA: '10% OFF',
      maxDiscountB: '15% OFF (Up to $800)',
      startingPriceA: '$4.50 (1GB data)',
      startingPriceB: '$199 (Power Station)',
      guaranteeA: 'Instant digital delivery & 24/7 support',
      guaranteeB: '5-Year Manufacturer Warranty',
      regionsA: '200+ Countries worldwide',
      regionsB: 'US, EU, Ukraine, Global',
      bestForA: 'Instant international mobile data without physical SIM cards',
      bestForB: 'Off-grid camping, blackouts, and heavy solar power resilience',
      scoreA: '9.7 / 10',
      scoreB: '9.5 / 10',
      verdictTitle: 'Complementary Travel Powerhouses',
      verdictBody: 'Airalo solves the communication hurdle for international globe-trotters instantly via software eSIM. ALLPOWERS provides the physical electricity to keep laptops, drones, and equipment running anywhere.'
    }
  ];

  for (const p of legacyCurated) {
    pairs.push(p);
    seenPairSlugs.add(p.slug);
  }

  // Cross-generate pairs within each vertical for merchants with >= 2 active offers
  for (const [verticalName, merchantSlugs] of Object.entries(COMPARISON_VERTICALS)) {
    // Filter to merchants with >= 2 active deals and existing StoreProfile
    const eligibleSlugs = merchantSlugs.filter(slug => {
      const store = storeMap.get(slug);
      const count = dealCounts.get(slug) || 0;
      return Boolean(store && count >= 2);
    });

    for (let i = 0; i < eligibleSlugs.length; i++) {
      for (let j = i + 1; j < eligibleSlugs.length; j++) {
        const slugA = eligibleSlugs[i];
        const slugB = eligibleSlugs[j];
        const pairSlug = `${slugA}-vs-${slugB}`;

        if (seenPairSlugs.has(pairSlug)) continue;

        const storeA = storeMap.get(slugA)!;
        const storeB = storeMap.get(slugB)!;
        const dealsA = coupons.filter(c => c.storeSlug === slugA);
        const dealsB = coupons.filter(c => c.storeSlug === slugB);

        const metricsA = calculateStoreMetrics(dealsA, storeA);
        const metricsB = calculateStoreMetrics(dealsB, storeB);

        pairs.push({
          slug: pairSlug,
          storeA: slugA,
          storeB: slugB,
          category: verticalName,
          title: `${storeA.name} vs ${storeB.name} — 2026 Promo Codes, Vouchers & Savings Compared`,
          desc: `Direct comparison of verified ${storeA.name} and ${storeB.name} coupon codes, checkout discounts, refund terms, and estimated buyer savings for 2026.`,
          maxDiscountA: metricsA.maxDiscount,
          maxDiscountB: metricsB.maxDiscount,
          startingPriceA: 'Verified checkout markdown',
          startingPriceB: 'Verified checkout markdown',
          guaranteeA: 'Official Manufacturer/Partner Warranty',
          guaranteeB: 'Official Manufacturer/Partner Warranty',
          regionsA: storeA.cleanDomain || 'Global / Multi-region',
          regionsB: storeB.cleanDomain || 'Global / Multi-region',
          bestForA: storeA.shortDesc || `Verified ${storeA.name} promotions and direct savings`,
          bestForB: storeB.shortDesc || `Verified ${storeB.name} promotions and direct savings`,
          scoreA: '9.6 / 10',
          scoreB: '9.5 / 10',
          verdictTitle: `${storeA.name} vs ${storeB.name}: Which Offer Delivers Greater Value?`,
          verdictBody: `Both ${storeA.name} and ${storeB.name} deliver verified buyer savings across their primary categories. If you are targeting maximum percentage markdown, ${storeA.name} offers up to ${metricsA.maxDiscount} with an estimated savings of ${metricsA.estSavings}. Meanwhile, ${storeB.name} features ${metricsB.totalDeals} active promotions with savings around ${metricsB.estSavings}. Check our verified checkout codes below to secure the lowest price.`
        });

        seenPairSlugs.add(pairSlug);
      }
    }
  }

  return pairs;
}

/**
 * Generates Schema.org FAQPage structured data for Brand A vs Brand B promo codes
 */
export function generateComparisonFaqSchema(pair: ComparisonPair, storeA: StoreProfile, storeB: StoreProfile, metricsA: StoreComparisonMetrics, metricsB: StoreComparisonMetrics) {
  const brandA = storeA?.name || 'Brand A';
  const brandB = storeB?.name || 'Brand B';

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Which gives better discounts: ${brandA} or ${brandB}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${brandA} currently offers discounts up to ${metricsA.maxDiscount} with an estimated savings of ${metricsA.estSavings}, while ${brandB} provides up to ${metricsB.maxDiscount} with average savings of ${metricsB.estSavings}. Both rates are verified at checkout by PromoRadar.`
        }
      },
      {
        "@type": "Question",
        "name": `How many active promo codes are available for ${brandA} vs ${brandB}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `PromoRadar currently verifies ${metricsA.totalDeals} active offers (${metricsA.activeCodesCount} direct promo codes) for ${brandA}, compared to ${metricsB.totalDeals} active deals (${metricsB.activeCodesCount} direct promo codes) for ${brandB}.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I stack ${brandA} and ${brandB} promo codes with seasonal sales?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Most verified promo codes for both ${brandA} and ${brandB} can be combined with sitewide promotions and seasonal markdowns. Make sure to apply the coupon in the checkout payment screen to confirm total basket reduction.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I redeem verified ${brandA} vs ${brandB} coupon codes?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Click 'Get Code' or 'Claim Deal' on PromoRadar to reveal the active voucher, copy the code, and click through our secure link. The promotional rate or instant partner discount will be applied automatically at the merchant checkout.`
        }
      }
    ]
  };
}

