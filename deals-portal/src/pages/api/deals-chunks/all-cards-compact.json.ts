// deals-portal/src/pages/api/deals-chunks/all-cards-compact.json.ts
import type { APIRoute } from 'astro';
import { getFullInterleavedCatalog } from '../../../utils/buildInterleavedFeed';

export const prerender = true;

export interface CompactCatalogDeal {
  id: string;
  s: string; // storeName
  slug: string; // storeSlug
  b: string; // brand
  c: string; // category
  sc: string; // smartCategory
  d: string; // domain
  bdg: string; // badge
  t: string; // title
  desc: string; // description
  code?: string; // code
  u: string; // affiliateUrl
  reg?: string[]; // regions
  l?: string; // lang
}

export const GET: APIRoute = async () => {
  const { interleavedDeals } = getFullInterleavedCatalog();

  const compactList: CompactCatalogDeal[] = interleavedDeals.map(deal => ({
    id: deal.id,
    s: deal.storeName,
    slug: deal.canonicalSlug || deal.storeSlug,
    b: deal.cleanBrand,
    c: deal.storeCategory,
    sc: deal.smartCategory,
    d: deal.resolvedDomain,
    bdg: deal.cleanBadge,
    t: deal.title,
    desc: deal.description,
    code: deal.code,
    u: deal.affiliateUrl
  }));

  return new Response(JSON.stringify(compactList), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400'
    }
  });
};

