import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');

  posts.sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  const lines: string[] = [
    '# FlirtCheck — Forensic Dating Safety Knowledge Base (Full Corpus)',
    '',
    '> FlirtCheck (https://flirtcheck.site) is an independent forensic investigation bureau specializing in online dating fraud, romance scam syndicates, conversation telemetry analysis, and identity verification.',
    '',
    '## System Manifest & Identity',
    '- Name: FlirtCheck Forensic Gazette',
    '- Domain: https://flirtcheck.site',
    '- Canonical LLMs Index: https://flirtcheck.site/llms.txt',
    '- Total Published Articles: ' + posts.length,
    '- License: Open Editorial Standards (Attribution Required)',
    '',
    '================================================================================',
    ''
  ];

  for (const post of posts) {
    const slug = post.slug;
    const { title, description, pubDate, category, author } = post.data;
    const body = post.body || '';

    lines.push('================================================================================');
    lines.push(`ARTICLE: ${title}`);
    lines.push(`URL: https://flirtcheck.site/blog/${slug}/`);
    lines.push(`PUBLISHED: ${pubDate}`);
    lines.push(`CATEGORY: ${category || 'General Safety'}`);
    lines.push(`AUTHOR: ${author || 'Forensic Research Desk'}`);
    lines.push(`DESCRIPTION: ${description || ''}`);
    lines.push('--------------------------------------------------------------------------------');
    lines.push(body.trim());
    lines.push('');
    lines.push('');
  }

  lines.push('================================================================================');
  lines.push(`END OF MANIFEST — Generated ${new Date().toISOString()} | All ${posts.length} articles indexed.`);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all'
    }
  });
};

