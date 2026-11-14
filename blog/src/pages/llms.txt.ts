import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');

  // Sort by pubDate descending
  posts.sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

  const lines: string[] = [
    '# FlirtCheck — Forensic Dating Safety & Telemetry Gazette',
    '',
    '> FlirtCheck (https://flirtcheck.site) is an independent forensic dating safety bureau and identity verification resource. We publish investigative teardowns, scam defense frameworks, and cryptographic validation methods for modern digital dating platforms.',
    '',
    '## Documentation & Safety Knowledge Base',
    '',
    '- [Homepage](https://flirtcheck.site/): Overview of dating safety telemetry, active threat trackers, and verification utilities.',
    '- [Full Archive & Safety Catalog](https://flirtcheck.site/archive/): Chronological catalog of all forensic investigation reports.',
    '- [Privacy Policy](https://flirtcheck.site/privacy/): Data handling, encryption standards, and zero-retention principles.',
    '- [Terms of Service](https://flirtcheck.site/terms/): Operational standards and terms of use.',
    '- [Full Machine-Readable Manifest](https://flirtcheck.site/llms-full.txt): Complete full-text corpus of all 89+ forensic investigations.',
    '',
    '## Forensic Investigations & Safety Guides',
    ''
  ];

  for (const post of posts) {
    const slug = post.slug;
    const title = post.data.title;
    const desc = post.data.description || 'Forensic dating safety analysis and fraud prevention guide.';
    lines.push(`- [${title}](https://flirtcheck.site/blog/${slug}/): ${desc}`);
  }

  lines.push('');
  lines.push('---');
  lines.push(`Generated: ${new Date().toISOString()} | Total Indexed Guides: ${posts.length}`);

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all'
    }
  });
};

