// deals-portal/src/utils/categoryChunks.ts
import { getFullInterleavedCatalog } from './buildInterleavedFeed';
import { renderDealCardHtml, renderInGridBannerHtml, type EnrichedDealItem, type InGridPartnerBannerItem } from './renderDealGridItem';

export const CATEGORY_SLUG_MAP: Record<string, { name: string; matchVerticals: string[] }> = {
  'black-friday': {
    name: 'Black Friday Deals',
    matchVerticals: ['BLACK_FRIDAY']
  },
  'privacy-security': {
    name: 'Privacy & VPN',
    matchVerticals: ['Privacy & Security']
  },
  'gaming-software': {
    name: 'Software & AI',
    matchVerticals: ['Gaming, Media & Software']
  },
  'web-hosting': {
    name: 'Hosting & Cloud',
    matchVerticals: ['Web Hosting & Domains']
  },
  'travel-tours': {
    name: 'Travel & Flights',
    matchVerticals: ['Travel & Tours']
  },
  'electronics-gadgets': {
    name: 'Electronics & Power',
    matchVerticals: ['Electronics & Gadgets']
  },
  'home-living': {
    name: 'Home & Furniture',
    matchVerticals: ['Home & Living']
  },
  'fashion-apparel': {
    name: 'Fashion & Shoes',
    matchVerticals: ['Fashion & Apparel']
  },
  'beauty-fragrances': {
    name: 'Beauty & Fragrances',
    matchVerticals: ['Beauty & Fragrances']
  },
  'eyewear-health': {
    name: 'Eyewear & Health',
    matchVerticals: ['Eyewear & Health']
  },
  'auto-mobility': {
    name: 'Auto & Dashcams',
    matchVerticals: ['Auto, Dashcams & Mobility']
  },
  'food-beverage': {
    name: 'Food & Nutrition',
    matchVerticals: ['Food, Beverage & Nutrition']
  },
  'insurance-finance': {
    name: 'Finance & Insurance',
    matchVerticals: ['Insurance & Finance']
  },
  'education-learning': {
    name: 'Education & Coding',
    matchVerticals: ['Education & Learning']
  },
  'kids-toys': {
    name: 'Kids & Toys',
    matchVerticals: ['Kids & Toys']
  },
  'dating-lifestyle': {
    name: 'Dating & Lifestyle',
    matchVerticals: ['Dating & Lifestyle']
  },
  'ecommerce-wholesale': {
    name: 'E-Commerce & B2B',
    matchVerticals: ['E-Commerce & Wholesale']
  }
};

// Map from data-cat attribute values used on buttons to URL category slugs
export const DATA_CAT_TO_SLUG: Record<string, string> = {
  'BLACK_FRIDAY': 'black-friday',
  'Privacy & Security': 'privacy-security',
  'Gaming, Media & Software': 'gaming-software',
  'Web Hosting & Domains': 'web-hosting',
  'Travel & Tours': 'travel-tours',
  'Electronics & Gadgets': 'electronics-gadgets',
  'Home & Living': 'home-living',
  'Fashion & Apparel': 'fashion-apparel',
  'Beauty & Fragrances': 'beauty-fragrances',
  'Eyewear & Health': 'eyewear-health',
  'Auto, Dashcams & Mobility': 'auto-mobility',
  'Food, Beverage & Nutrition': 'food-beverage',
  'Insurance & Finance': 'insurance-finance',
  'Education & Learning': 'education-learning',
  'Kids & Toys': 'kids-toys',
  'Dating & Lifestyle': 'dating-lifestyle',
  'E-Commerce & Wholesale': 'ecommerce-wholesale'
};

const normCat = (s: string) => (s || '').replace(/&amp;/g, '&').toLowerCase().trim();

export function matchesCategory(deal: EnrichedDealItem, categorySlug: string): boolean {
  const config = CATEGORY_SLUG_MAP[categorySlug];
  if (!config) return false;

  const cCat = deal.smartCategory || deal.storeCategory || '';
  const cCatNorm = normCat(cCat);
  const cText = (deal.title + ' ' + deal.description + ' ' + deal.cleanBadge).toLowerCase();

  if (categorySlug === 'black-friday') {
    const discountMatch = cText.match(/(\d+)%/);
    const pct = discountMatch ? parseInt(discountMatch[1], 10) : 0;
    return pct >= 40 || cText.includes('black friday') || cText.includes('cyber') || cText.includes('save up to') || cText.includes('free');
  }

  for (const vert of config.matchVerticals) {
    const vertNorm = normCat(vert);
    if (cCatNorm === vertNorm || cCatNorm.includes(vertNorm) || vertNorm.includes(cCatNorm)) {
      return true;
    }
  }

  return false;
}

export interface CategoryPageChunk {
  categorySlug: string;
  categoryName: string;
  page: number;
  totalPages: number;
  totalCategoryDeals: number;
  shownCount: number;
  html: string;
}

export const DEALS_PER_CATEGORY_PAGE = 24; // Clean 24-card grid (4x6 desktop, 3x8 tablet, 2x12 mobile)

export function getCategoryChunks(categorySlug: string): CategoryPageChunk[] {
  const { interleavedDeals } = getFullInterleavedCatalog();
  const config = CATEGORY_SLUG_MAP[categorySlug];
  if (!config) return [];

  const matchedDeals = interleavedDeals.filter(d => matchesCategory(d, categorySlug));
  const totalCategoryDeals = matchedDeals.length;
  const totalPages = Math.max(1, Math.ceil(totalCategoryDeals / DEALS_PER_CATEGORY_PAGE));

  const chunks: CategoryPageChunk[] = [];

  for (let page = 1; page <= totalPages; page++) {
    const startIdx = (page - 1) * DEALS_PER_CATEGORY_PAGE;
    const pageDeals = matchedDeals.slice(startIdx, startIdx + DEALS_PER_CATEGORY_PAGE);

    const htmlParts: string[] = [];
    pageDeals.forEach((deal, relIdx) => {
      const globalIdx = startIdx + relIdx;
      htmlParts.push(renderDealCardHtml(deal, globalIdx, '', false));
    });

    chunks.push({
      categorySlug,
      categoryName: config.name,
      page,
      totalPages,
      totalCategoryDeals,
      shownCount: pageDeals.length,
      html: htmlParts.join('\n')
    });
  }

  return chunks;
}

