import { Offer } from '../types.js';
import { LlmGatewayService } from '../services/llm-gateway.service.js';

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
    const gateway = LlmGatewayService.getInstance();
    const result = await gateway.executeInference('agent-context-copywriter-02', {
      systemPrompt: 'You are an expert technical SEO specialist.',
      userPrompt: prompt,
      temperature: 0.3,
    });
    let optimizedHtml = result.rawText.trim();
    if (optimizedHtml.startsWith('```html')) {
      optimizedHtml = optimizedHtml.replace(/^```html\s*/, '').replace(/\s*```$/, '');
    }
    return optimizedHtml;
  } catch (err) {
    console.error('[SEO Skill] Failed to generate SEO metadata. Returning original HTML.', err);
    return html;
  }
}
