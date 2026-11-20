// deals-portal/src/pages/api/deals-chunks/[page].json.ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { getFullInterleavedCatalog } from '../../../utils/buildInterleavedFeed';
import { renderDealCardHtml, renderInGridBannerHtml } from '../../../utils/renderDealGridItem';

export const prerender = true;

const DEALS_PER_PAGE = 24; // Clean 24-card grid (4x6 desktop, 3x8 tablet, 2x12 mobile)

export const getStaticPaths: GetStaticPaths = async () => {
  const { interleavedDeals, totalDeals } = getFullInterleavedCatalog();
  const totalPages = Math.ceil(totalDeals / DEALS_PER_PAGE);

  // Generate chunks for pages 2 to totalPages (Page 1 is in index.astro)
  const paths = [];
  for (let page = 2; page <= totalPages; page++) {
    paths.push({
      params: { page: String(page) }
    });
  }

  return paths;
};

export const GET: APIRoute = async ({ params }) => {
  const pageNum = parseInt(params.page as string, 10);
  const { interleavedDeals, totalDeals } = getFullInterleavedCatalog();
  const totalPages = Math.ceil(totalDeals / DEALS_PER_PAGE);

  if (isNaN(pageNum) || pageNum < 2 || pageNum > totalPages) {
    return new Response(JSON.stringify({ error: 'Page not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const startIdx = (pageNum - 1) * DEALS_PER_PAGE;
  const pageDeals = interleavedDeals.slice(startIdx, startIdx + DEALS_PER_PAGE);

  const htmlParts: string[] = [];
  pageDeals.forEach((deal, relIdx) => {
    const globalIdx = startIdx + relIdx;
    htmlParts.push(renderDealCardHtml(deal, globalIdx, '', false));
  });

  const payload = {
    page: pageNum,
    totalPages,
    totalDeals,
    itemsCount: pageDeals.length,
    html: htmlParts.join('\n')
  };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};

