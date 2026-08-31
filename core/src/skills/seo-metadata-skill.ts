import { Offer } from '../types';
import { generateContent } from '../llm-gateway';

export async function injectSeoMetadata(html: string, offer: Offer): Promise<string> {
  console.log('[SEO Skill] Generating and injecting SEO metadata...');
  
  const prompt = `
    You are an SEO expert. Analyze the following HTML landing page for the offer:
    Name: ${offer.name}
    Geo: ${offer.targetGeo.join(', ')}
    
    Inject highly optimized <title>, <meta name="description">, OpenGraph tags, and JSON-LD structured data inside the <head> tag.
    Return the COMPLETE, updated raw HTML. Do not output markdown code blocks.
    
    HTML:
    ${html}
  `;

  try {
    let optimizedHtml = await generateContent(prompt);
    optimizedHtml = optimizedHtml.trim();
    if (optimizedHtml.startsWith('\`\`\`html')) {
      optimizedHtml = optimizedHtml.replace(/^\`\`\`html\s*/, '').replace(/\s*\`\`\`$/, '');
    }
    return optimizedHtml;
  } catch (err) {
    console.error('[SEO Skill] Failed to generate SEO metadata. Returning original HTML.', err);
    return html;
  }
}
