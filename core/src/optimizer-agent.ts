import fs from 'fs/promises';
import path from 'path';
import { recall, remember } from './memory-engine.js';
import { LlmGatewayService } from './services/llm-gateway.service.js';
import { auditTrackingLinks } from './skills/tracking-audit-skill.js';

const CAMPAIGNS_DIR = path.resolve(process.cwd(), 'campaigns');

async function optimizeCampaign(campaignId: string, campaignData: any, autoEvolve: boolean) {
  console.log(`\n--- Optimizing Campaign: ${campaignId} ---`);
  const performance = campaignData.performance;
  if (!performance) {
    console.log('No performance data available. Skipping.');
    return;
  }

  // Find variants with data
  const variantKeys = Object.keys(performance).filter(k => k.startsWith('v'));
  if (variantKeys.length === 0) {
    console.log('No variants data available.');
    return;
  }

  let winner = null;
  let maxRevenue = -1;

  for (const vKey of variantKeys) {
    const data = performance[vKey];
    console.log(`Variant ${vKey}: Clicks: ${data.clicks}, Revenue: $${data.revenue}, CR: ${data.cr}`);
    
    // Low threshold for testing
    if (data.clicks >= 2) {
      if (data.revenue > maxRevenue) {
        maxRevenue = data.revenue;
        winner = vKey;
      }
    }
  }

  if (!winner) {
    console.log('Not enough data to determine a statistical winner.');
    return;
  }

  console.log(`🏆 Winner designated: ${winner} with Revenue $${maxRevenue}`);

  // Auto-Evolve Logic
  let activeVariants = [winner];
  let trafficWeights = [100]; // 100% to winner by default

  if (autoEvolve) {
    const nextVariantIndex = variantKeys.length + 1;
    const challengerKey = `v${nextVariantIndex}`;
    
    console.log(`[Auto-Evolve] Synthesizing Challenger Variant: ${challengerKey}`);
    
    try {
      const winnerHtmlPath = path.join(CAMPAIGNS_DIR, campaignId, winner, 'index.html');
      let winnerHtml = await fs.readFile(winnerHtmlPath, 'utf8');
      
      const evolvePrompt = `
You are an Elite Traffic & Affiliate Architect.
Analyze the following successful HTML landing page.
Create a NEW challenger variant that improves on it by:
- Modifying the Call-To-Action (CTA) urgency.
- Enhancing social proof or adding localized credibility.
- Refining the primary value hook.
DO NOT remove existing 'click_id' and 'variant' URL parameters from links, just update the variant parameter to '${challengerKey}'.
Return ONLY the raw HTML code.

Original HTML:
${winnerHtml.substring(0, 4000)} // Truncating for API limits
      `;
      
      const gateway = LlmGatewayService.getInstance();
      const result = await gateway.executeInference('agent-context-copywriter-02', {
        systemPrompt: 'You are an Elite Traffic & Affiliate Architect.',
        userPrompt: evolvePrompt,
        temperature: 0.7,
      });

      let newHtml = result.rawText;
      if (newHtml.startsWith('```html')) {
        newHtml = newHtml.replace(/^```html\s*/, '').replace(/\s*```$/, '');
      }

      // Quick fix loop for tracking links
      let auditResult = auditTrackingLinks(newHtml);
      if (!auditResult.passed) {
         console.log('Challenger failed tracking audit. Fixing...');
         newHtml = newHtml.replace(/variant=v[0-9]+/g, `variant=${challengerKey}`);
         // Basic auto-fix for demo purposes
      }
      
      const challengerDir = path.join(CAMPAIGNS_DIR, campaignId, challengerKey);
      await fs.mkdir(challengerDir, { recursive: true });
      await fs.writeFile(path.join(challengerDir, 'index.html'), newHtml);
      
      console.log(`✅ Challenger ${challengerKey} synthesized and saved.`);
      
      activeVariants = [winner, challengerKey];
      trafficWeights = [80, 20]; // 80% Winner, 20% Challenger
      
    } catch (err: any) {
      console.error('Failed to synthesize challenger:', err.message);
    }
  }

  // Update Root Split Router
  console.log(`Updating Split Router for ${campaignId}... Traffic Weights: ${trafficWeights.join('/')}`);
  
  // Logic: 80% / 20%
  const routerHtml = `<!DOCTYPE html>
<html>
<head><title>Split Router</title></head>
<body>
<script>
  let v = localStorage.getItem('${campaignId}_variant');
  if (!v) {
    const rand = Math.random() * 100;
    v = (rand < ${trafficWeights[0]}) ? '${activeVariants[0]}' : '${activeVariants[1] || activeVariants[0]}';
    localStorage.setItem('${campaignId}_variant', v);
  }
  window.location.href = './' + v + '/index.html' + window.location.search;
</script>
</body>
</html>`;
  
  const rootDir = path.join(CAMPAIGNS_DIR, campaignId);
  await fs.writeFile(path.join(rootDir, 'index.html'), routerHtml);
  console.log(`✅ Split Router updated successfully.`);
}

async function runOptimizer() {
  const args = process.argv.slice(2);
  const autoEvolve = args.includes('--auto-evolve');
  
  try {
    const memory = await recall('deployed_campaigns');
    
    for (const [campaignId, data] of Object.entries(memory)) {
      await optimizeCampaign(campaignId, data, autoEvolve);
    }
    
    console.log('\n✅ Optimization & Auto-Evolution Engine finished.');
  } catch (err) {
    console.error('Optimizer Error:', err);
  }
}

runOptimizer();
