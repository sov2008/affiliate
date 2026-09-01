import { Offer } from './types.js';
import { LlmGatewayService } from './services/llm-gateway.service.js';
import { optimizeContext } from './context-optimizer.js';
import fs from 'fs/promises';
import path from 'path';

export async function generateTaskPrompt(offer: Offer): Promise<string> {
  const uiUxSkillPath = path.resolve(process.cwd(), '.antigravity/skills/ui_ux_pro_max.md');
  let uiUxSkill = '';
  try {
    uiUxSkill = await fs.readFile(uiUxSkillPath, 'utf8');
  } catch (err) {}

  const prompt = `
    You are an Elite Traffic & Affiliate Architect. 
    
    Generate a complete, standalone execution prompt that instructs an AI developer to build a production-ready landing page for the following offer:
    
    Offer Details:
    - ID: ${offer.id}
    - Name: ${offer.name}
    - Vertical: ${offer.vertical}
    - Target Geo: ${offer.targetGeo.join(', ')}
    - Payout: $${offer.payout}
    
    The resulting prompt MUST strictly require the following from the developer:
    1. A mobile-first responsive layout using Tailwind CSS via CDN.
    2. A clean, high-converting design standard for the ${offer.vertical} vertical.
    3. Client-side URL parameter extraction (specifically 'click_id', 'sub1', 'sub2').
    4. Dynamic injection of these extracted parameters into all outbound Call-To-Action (CTA) links targeting the affiliate base URL: ${offer.affiliateUrlTemplate}
    
    Provide the complete technical specifications to build a landing page.
    The landing page MUST feature:
    - High-converting commercial typography
    - Micro-borders and glassmorphism accents
    - Modern color palettes
    - A mobile-first layout with a sticky bottom CTA bar
    - Precise tracking parameters (click_id, sub1, sub2) in all links
    
    Design Rules to Follow:
    ${uiUxSkill}
    
    Format the output as a clear, instructional prompt ready to be fed to an AI coding assistant.
  `;

  const optimizedPrompt = optimizeContext(prompt, { 
    preserveKeys: ['click_id', 'sub1', 'sub2'] 
  });

  try {
    const gateway = LlmGatewayService.getInstance();
    const result = await gateway.executeInference('agent-context-copywriter-02', {
      systemPrompt: 'You are an Elite Traffic & Affiliate Architect.',
      userPrompt: optimizedPrompt,
      temperature: 0.7,
    });
    return result.rawText;
  } catch (error) {
    console.error("Error generating task prompt:", error);
    throw error;
  }
}
