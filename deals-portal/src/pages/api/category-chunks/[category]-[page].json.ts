// deals-portal/src/pages/api/category-chunks/[category]/[page].json.ts
import type { APIRoute, GetStaticPaths } from 'astro';
import { CATEGORY_SLUG_MAP, getCategoryChunks } from '../../../utils/categoryChunks';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const paths: { params: { category: string; page: string } }[] = [];

  for (const categorySlug of Object.keys(CATEGORY_SLUG_MAP)) {
    const chunks = getCategoryChunks(categorySlug);
    for (const chunk of chunks) {
      paths.push({
        params: {
          category: categorySlug,
          page: String(chunk.page)
        }
      });
    }
  }

  return paths;
};

export const GET: APIRoute = async ({ params }) => {
  const categorySlug = params.category as string;
  const pageNum = parseInt(params.page as string, 10);

  if (!categorySlug || isNaN(pageNum)) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const chunks = getCategoryChunks(categorySlug);
  const chunk = chunks.find(c => c.page === pageNum);

  if (!chunk) {
    return new Response(JSON.stringify({ error: 'Category page not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify(chunk), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400'
    }
  });
};

