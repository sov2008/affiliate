import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export const GET: APIRoute = async () => {
  const siteUrl = 'https://flirtcheck.site';
  const posts = await getCollection('posts', ({ data }) => !data.draft);

  // Sort descending by publication date
  posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const items = posts.map((post) => {
    const slug = post.id || post.slug;
    const link = `${siteUrl}/${slug}/`;
    const pubDateUtc = post.data.pubDate.toUTCString();
    const categories = (post.data.tags || []).map(t => `<category>${escapeXml(t)}</category>`).join('\n      ');

    return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${escapeXml(post.data.description)}</description>
      <pubDate>${pubDateUtc}</pubDate>
      <author>desk@flirtcheck.site (Arthur Vance)</author>
      ${categories}
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>FlirtCheck // Forensic Evidence &amp; Intelligence Dispatches</title>
    <description>Independent investigative bureau auditing commercial dating algorithms, bot farms, romance scams, and identity telemetry.</description>
    <link>${siteUrl}/</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>desk@flirtcheck.site (Arthur Vance)</managingEditor>
    <webMaster>desk@flirtcheck.site (FlirtCheck Bureau)</webMaster>
${items}
  </channel>
</rss>`;

  return new Response(rss.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
