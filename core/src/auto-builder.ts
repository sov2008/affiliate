import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { Offer } from './types';
import { generateContent } from './llm-gateway';
import { exportContextForPrompt, remember } from './memory-engine';
import { optimizeContext } from './context-optimizer';
import { injectSeoMetadata } from './skills/seo-metadata-skill';
import { optimizeHtml } from './skills/html-optimizer-skill';
import { auditTrackingLinks } from './skills/tracking-audit-skill';
import { generateGeoRouterScript } from './geo-localizer';
import { injectWeb3Connect } from './skills/web3-connect-skill';

const execAsync = util.promisify(exec);

async function generateHTML(offer: Offer): Promise<string> {
  const memoryContext = await exportContextForPrompt();
  
  // Load UI/UX Pro Max Skill
  const uiUxSkillPath = path.resolve(__dirname, '../../.antigravity/skills/ui_ux_pro_max.md');
  let uiUxSkill = '';
  try {
    uiUxSkill = await fs.readFile(uiUxSkillPath, 'utf8');
  } catch (err) {
    console.warn('Warning: UI/UX Pro Max skill not found.');
  }
  
  const prompt = `
    ${memoryContext}
    
    You are an Elite Traffic & Affiliate Architect. 
    
    Generate a complete, production-ready, mobile-first HTML landing page for the following offer.
    
    ${offer.variantAngle ? `VERY IMPORTANT ANGLE: ${offer.variantAngle}` : ''}
    
    Offer Details:
    - ID: ${offer.id}
    - Name: ${offer.name}
    - Vertical: ${offer.vertical}
    - Target Geo: ${offer.targetGeo.join(', ')}
    - Payout: $${offer.payout}
    
    Requirements:
    1. A mobile-first responsive layout using Tailwind CSS via CDN.
    2. A clean, high-converting design.
    3. Client-side URL parameter extraction ('click_id', 'sub1', 'sub2').
    4. Dynamic injection of these parameters into all outbound Call-To-Action (CTA) links targeting the affiliate base URL: ${offer.affiliateUrlTemplate}
    5. VERY IMPORTANT: Implement high-converting commercial typography, micro-borders, modern color palettes, and glassmorphism accents.
    6. Include a sticky bottom CTA bar on small screens.
    7. Fully preserve the dynamic tracking parameters in the URL format.
    
    Refer to the following UI/UX rules:
    ${uiUxSkill}
    
    Return ONLY the raw HTML code without markdown code blocks, formatting, or extra text.
  `;

  const optimizedPrompt = optimizeContext(prompt, { 
    preserveKeys: ['click_id', 'sub1', 'sub2'] 
  });

  let html = await generateContent(optimizedPrompt);
  html = html.trim();
  if (html.startsWith('```html')) {
    html = html.replace(/^```html\s*/, '').replace(/\s*```$/, '');
  }
  return html;
}

async function buildCampaign(offer: Offer, campaignId: string) {
  const campaignsDir = path.resolve(__dirname, '../../campaigns', campaignId);
  const htmlPath = path.join(campaignsDir, 'index.html');
  const configPath = path.join(campaignsDir, 'config.json');

  console.log(`\n--- Starting autonomous builder for campaign: ${campaignId} ---`);
  await fs.mkdir(campaignsDir, { recursive: true });

  const allGeos = offer.targetGeo;
  const currentGeo = campaignId.split('_').pop()?.toUpperCase() || 'US';
  const geoRouter = generateGeoRouterScript(currentGeo, allGeos);

  console.log('Generating HTML via Gemini API...');
  let htmlContent = await generateHTML(offer);
  
  let attempts = 0;
  let auditResult = auditTrackingLinks(htmlContent);
  while (!auditResult.passed && attempts < 3) {
    console.log(`[Quality Gate] Tracking audit failed (Attempt ${attempts + 1}). Triggering LLM fix loop...`);
    const fixPrompt = `You are an expert developer. The following HTML is missing required tracking parameters in its CTA links. 
Ensure all <a> tags (outbound links) contain 'click_id', 'sub1', 'sub2', 'sub_id' in their href URL.
Do not modify the rest of the design. Return ONLY the raw updated HTML without markdown blocks.

Errors found:
${auditResult.errors.join('\n')}

HTML:
${htmlContent}`;
    
    htmlContent = await generateContent(fixPrompt);
    htmlContent = htmlContent.trim();
    if (htmlContent.startsWith('\`\`\`html')) {
      htmlContent = htmlContent.replace(/^\`\`\`html\s*/, '').replace(/\s*\`\`\`$/, '');
    }
    
    auditResult = auditTrackingLinks(htmlContent);
    attempts++;
  }
  
  if (!auditResult.passed) {
    throw new Error('Quality Gate Failed: Tracking audit failed after 3 fix attempts.');
  }
  
  htmlContent = await injectSeoMetadata(htmlContent, offer);
  htmlContent = await optimizeHtml(htmlContent);

  // Inject Geo Router Script right before </body>
  if (geoRouter) {
    htmlContent = htmlContent.replace('</body>', `\n${geoRouter}\n</body>`);
  }
  
  // Inject Click Beacon Script (Default)
  const trackingBeacon = `
<script>
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a');
  links.forEach(a => {
    a.addEventListener('click', (e) => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const clickId = urlParams.get('click_id') || '';
        const variant = window.location.pathname.includes('/v2') ? 'v2' : 'v1';
        // Extract base campaign id without variant
        const baseCampaignId = "${campaignId}".split('/')[0];
        navigator.sendBeacon('http://localhost:8787/click?click_id=' + clickId + '&variant=' + variant + '&campaign_id=' + baseCampaignId);
      } catch(err) {}
    });
  });
});
</script>
  `;
  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', `\n${trackingBeacon}\n</body>`);
  } else {
    htmlContent += trackingBeacon;
  }
  
  // Inject Web3 Connect Skill (Overrides default beacon if applicable)
  htmlContent = injectWeb3Connect(htmlContent, offer, campaignId);

  console.log('Writing files...');
  await fs.writeFile(htmlPath, htmlContent);

  const config = {
    campaignId,
    offerId: offer.id,
    templateName: 'auto-gen-v1',
    trafficSource: 'direct',
    variantAngle: offer.variantAngle || 'default',
    buildTimestamp: new Date().toISOString()
  };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));

  console.log('Executing Git deployment...');
  const gitCmd = `git add "${campaignsDir}" && git commit -m "feat(auto): deploy ${campaignId}"`;
  try {
    const { stdout } = await execAsync(gitCmd, { cwd: path.resolve(__dirname, '../../') });
    console.log('Git deployment successful:', stdout);
    
    await remember('deployed_campaigns', campaignId, {
      offerId: offer.id,
      geo: offer.targetGeo,
      payout: offer.payout,
      buildTimestamp: new Date().toISOString()
    });
    console.log('Campaign metadata recorded in memory.');
  } catch (err: any) {
    if (err.stdout && err.stdout.includes('nothing to commit')) {
      console.log('No changes to commit for this campaign.');
    } else {
      throw err;
    }
  }
}

async function runAutonomousBuilder() {
  const args = process.argv.slice(2);
  const isBatch = args.includes('--batch');
  const isPush = args.includes('--push');
  
  try {
    if (isBatch) {
      console.log('Batch mode enabled. Reading offers.json...');
      const offersData = await fs.readFile(path.join(__dirname, 'offers.json'), 'utf8');
      const offers: Offer[] = JSON.parse(offersData);
      
      for (const offer of offers) {
        const campaignId = `cmp_${offer.id}`;
        await buildCampaign(offer, campaignId);
      }
    } else {
      // Parse single offer args
      const argMap = new Map<string, string>();
      args.forEach(arg => {
        if (arg.startsWith('--')) {
          const [key, value] = arg.slice(2).split('=');
          if (key && value) argMap.set(key, value);
        }
      });
      
      const baseOffer: Offer = {
        id: argMap.get('name') ? argMap.get('name')!.toLowerCase().replace(/\s+/g, '_') : 'off_smart_123',
        name: argMap.get('name') || 'E-commerce Smart Gadget 2.0',
        vertical: 'general',
        payout: argMap.get('payout') ? parseFloat(argMap.get('payout')!) : 40.0,
        targetGeo: argMap.get('geo') ? argMap.get('geo')!.split(',') : ['US'],
        affiliateUrlTemplate: argMap.get('url') || 'https://example-tracker.com/click?offer=smart123'
      };
      
      const variantsCount = argMap.get('variants') ? parseInt(argMap.get('variants')!) : 1;
      const angles = [
        'Social Proof / Storytelling angle (Focus on reviews and stories)',
        'Direct Hard-Offer / Discount angle (Direct sale, big discounts)',
        'Authority / Expert angle (Focus on endorsements and specs)'
      ];

      for (const geo of baseOffer.targetGeo) {
        const geoCampaignId = `cmp_${baseOffer.id}_${geo.toLowerCase()}`;
        
        if (variantsCount > 1) {
          // Generate split root index
          const splitRootHtml = `<!DOCTYPE html>
<html>
<head><title>Split Router</title></head>
<body>
<script>
  const variants = ${variantsCount};
  let v = localStorage.getItem('${geoCampaignId}_variant');
  if (!v) {
    v = 'v' + (Math.floor(Math.random() * variants) + 1);
    localStorage.setItem('${geoCampaignId}_variant', v);
  }
  window.location.href = './' + v + '/index.html' + window.location.search;
</script>
</body>
</html>`;
          const rootDir = path.resolve(__dirname, '../../campaigns', geoCampaignId);
          await fs.mkdir(rootDir, { recursive: true });
          await fs.writeFile(path.join(rootDir, 'index.html'), splitRootHtml);

          for (let i = 0; i < variantsCount; i++) {
            const variantOffer = { ...baseOffer, variantAngle: angles[i % angles.length] };
            const vCampaignId = `${geoCampaignId}/v${i + 1}`;
            await buildCampaign(variantOffer, vCampaignId);
            await new Promise(r => setTimeout(r, 15000)); // Delay to prevent 429
          }
        } else {
          await buildCampaign(baseOffer, geoCampaignId);
          await new Promise(r => setTimeout(r, 15000)); // Delay to prevent 429
        }
      }
    }

    if (isPush) {
      console.log('\nExecuting git push origin main...');
      const { stdout } = await execAsync('git push origin main', { cwd: path.resolve(__dirname, '../../') });
      console.log('Push successful:', stdout);
    }
    
    console.log('\n✅ Autonomous campaign engine executed successfully.');
  } catch (error) {
    console.error('❌ Autonomous engine failed:', error);
    process.exit(1);
  }
}

runAutonomousBuilder();
