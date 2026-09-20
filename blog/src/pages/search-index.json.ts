import { getCollection } from 'astro:content';

export const prerender = true;

export async function GET() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  const searchIndex = posts.map(post => ({
    slug: post.id || post.slug,
    title: post.data.title,
    category: post.data.category,
    description: post.data.description,
    tags: post.data.tags || [],
    pubDate: post.data.pubDate.toISOString().split('T')[0]
  }));

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
