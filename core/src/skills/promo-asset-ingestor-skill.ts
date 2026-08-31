import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { injectMicroClickstream } from './micro-clickstream-skill';
import { injectDynamicCreatives } from './dynamic-creative-injector-skill';
import { remember, recall } from '../memory-engine';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const POSTBACK_WORKER_URL = process.env.POSTBACK_WORKER_URL || 'https://postback-engine.sov7.workers.dev';

export interface PromoIngestParams {
  campaignId: string;
  promoType: 'url' | 'zip' | 'raw_html';
  sourceUrl?: string;
  customHtml?: string;
  variantName?: string;
  targetGeo?: string;
}

export interface PromoIngestResult {
  campaignId: string;
  variantName: string;
  outputPath: string;
  sanitizedHtml: string;
  extractedHooks: {
    title: string;
    headlines: string[];
    descriptions: string[];
  };
  sanitizedTrackersCount: number;
  assetsProcessedCount: number;
  timestamp: string;
}

/**
 * 1. Sanitizes 3rd party spy and tracking scripts (FB Pixel, GTM, TikTok, RedTrack, Voluum, etc.)
 */
export function sanitizeHtml(html: string): { cleanedHtml: string; removedCount: number } {
  let cleaned = html;
  let count = 0;

  // 1. Remove all <script> tags containing known pixel/tracker footprints
  cleaned = cleaned.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, body) => {
    const isTracker = /fbq|connect\.facebook\.net|gtm\.js|googletagmanager|google-analytics|gtag|analytics\.tiktok|mc\.yandex|voluum|redtrack|keitaro|hotjar/i.test(match);
    if (isTracker) {
      count++;
      return '';
    }
    return match;
  });

  // 2. Remove tracker noscripts and iframes
  cleaned = cleaned.replace(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gi, (match) => {
    if (/facebook\.com\/tr|googletagmanager/i.test(match)) {
      count++;
      return '';
    }
    return match;
  });

  // 3. Strip generic spy tracker comments
  cleaned = cleaned.replace(/<!--\s*(spy|tracking|pixel|gtm|facebook)[\s\S]*?-->/gi, '');

  return { cleanedHtml: cleaned, removedCount: count };
}

/**
 * 2. Replaces all outbound CTA links with standard affiliate routing
 */
export function replaceCtaOutboundLinks(html: string, campaignId: string, variant: string): string {
  const targetCta = `${POSTBACK_WORKER_URL}/click?click_id=[ml_sub1]&campaign_id=${campaignId}&variant=${variant}&ml_sub1=[ml_sub1]&ml_sub2=${campaignId}&ml_sub3=${variant}`;
  
  // Replace <a href="...">
  let refactored = html.replace(/<a\b([^>]*?)href=(["'])(?:https?:\/\/[^"']+|#[^"']*|\/[^"']*)(["'])([^>]*?)>/gi, (match, before, q1, q2, after) => {
    // Preserve local in-page jump anchors if explicitly desired
    if (before.includes('data-ignore-cta') || after.includes('data-ignore-cta')) return match;
    return `<a${before}href="${targetCta}" id="ctaLink"${after}>`;
  });

  // Ensure click_id parameter resolution script is included
  const paramScript = `
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      var params = new URLSearchParams(window.location.search);
      var clk = params.get('click_id') || params.get('gclid') || params.get('s1') || 'clk_' + Math.random().toString(36).substring(2, 9);
      document.querySelectorAll('a[href*="[ml_sub1]"]').forEach(function(a) {
        a.href = a.href.replace(/\\[ml_sub1\\]/g, clk);
      });
    });
  </script>`;

  if (!refactored.includes('a[href*="[ml_sub1]"]')) {
    refactored = refactored.replace('</body>', `${paramScript}\n</body>`);
  }

  return refactored;
}

/**
 * 3. Extracts Headlines, Titles, and Descriptions from raw HTML
 */
export function extractTextHooks(html: string): { title: string; headlines: string[]; descriptions: string[] } {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : 'Official Promo Landing';

  const headlines: string[] = [];
  const h1Matches = html.matchAll(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/gi);
  for (const m of h1Matches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text && text.length > 5 && text.length < 120 && !headlines.includes(text)) {
      headlines.push(text);
    }
  }

  const descriptions: string[] = [];
  const pMatches = html.matchAll(/<p[^>]*>(.*?)<\/p>/gi);
  for (const m of pMatches) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text && text.length > 20 && text.length < 300 && !descriptions.includes(text)) {
      descriptions.push(text);
    }
  }

  return {
    title,
    headlines: headlines.slice(0, 5),
    descriptions: descriptions.slice(0, 3)
  };
}

/**
 * Main Pipeline Ingestor
 */
export async function ingestPromoAssets(params: PromoIngestParams): Promise<PromoIngestResult> {
  const { campaignId, promoType, sourceUrl, customHtml, variantName = 'v_promo' } = params;
  console.log(`📥 [Promo Asset Ingestor Skill] Ingesting promo materials for: ${campaignId} (${variantName})...`);

  let rawHtml = customHtml || '';

  // 1. Ingest via URL if provided
  if (promoType === 'url' && sourceUrl) {
    console.log(`   Fetching remote page from: ${sourceUrl}...`);
    try {
      const resp = await fetch(sourceUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      rawHtml = await resp.text();
    } catch (err: any) {
      console.warn(`   ⚠️ Fetch error: ${err.message}. Using structured fallback template.`);
      rawHtml = `<!DOCTYPE html><html><head><title>Special Promo Offer</title></head><body><h1>Exclusive Verified Offer</h1><p>Claim your reward now with instant confirmation.</p><a href="https://example.com/click">Claim Now</a></body></html>`;
    }
  }

  if (!rawHtml) {
    rawHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Official Promo Offer</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-slate-950 text-white min-h-screen flex flex-col justify-center items-center p-6"><div class="max-w-md w-full p-6 bg-slate-900 rounded-2xl border border-slate-800 text-center space-y-4"><h1>Exclusive Verified Offer</h1><p>Join thousands of verified members in {city}. Limited availability for {date}.</p><a href="https://example.com" class="block w-full py-3 bg-emerald-600 rounded-xl font-bold">ACCESS NOW</a></div></body></html>`;
  }

  // 2. HTML Sanitization
  const { cleanedHtml, removedCount } = sanitizeHtml(rawHtml);
  console.log(`   🧹 Sanitized ${removedCount} third-party tracking scripts/pixels.`);

  // 3. Outbound CTA Replacement
  let processedHtml = replaceCtaOutboundLinks(cleanedHtml, campaignId, variantName);

  // 4. Inject Dynamic Tokens ({city}, {date}, {country}, {device})
  processedHtml = injectDynamicCreatives(processedHtml);

  // 5. Inject Micro-Clickstream Telemetry Beacon
  processedHtml = injectMicroClickstream(processedHtml, campaignId, variantName);

  // 6. Extract Text & Copy Hooks
  const hooks = extractTextHooks(processedHtml);

  // 7. Write to campaign folder
  const targetDir = path.resolve(__dirname, `../../../campaigns/${campaignId}/${variantName}`);
  await fs.mkdir(targetDir, { recursive: true });
  const assetsDir = path.resolve(__dirname, `../../../campaigns/${campaignId}/assets`);
  await fs.mkdir(assetsDir, { recursive: true });

  const outputPath = path.join(targetDir, 'index.html');
  await fs.writeFile(outputPath, processedHtml, 'utf8');
  console.log(`   ✅ Processed pre-lander saved to: ${outputPath}`);

  // 8. Update Memory with extracted hooks
  const memory = await recall('deployed_campaigns');
  if (memory && memory[campaignId]) {
    memory[campaignId].extractedHooks = hooks;
    await remember('deployed_campaigns', campaignId, memory[campaignId]);
  }

  return {
    campaignId,
    variantName,
    outputPath,
    sanitizedHtml: processedHtml,
    extractedHooks: hooks,
    sanitizedTrackersCount: removedCount,
    assetsProcessedCount: 1,
    timestamp: new Date().toISOString()
  };
}

if (require.main === module) {
  const sampleHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Mock Forex & Crypto Robot Official</title>
    <!-- Spy Pixel -->
    <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};}(window,document,'script');fbq('init', '123456789');</script>
    <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXX"></script>
  </head>
  <body>
    <h1>Automated Market Precision System 2026</h1>
    <p>Discover real-time algorithmic trades generated for your regional market.</p>
    <a href="https://network-affiliate.com/offer?aff_id=999">START TRADING TODAY</a>
  </body>
  </html>`;

  ingestPromoAssets({
    campaignId: 'cmp_trading_au',
    promoType: 'raw_html',
    customHtml: sampleHtml,
    variantName: 'v_promo'
  }).then(res => {
    console.log('\n📦 Ingestion Summary:\n', JSON.stringify({
      campaignId: res.campaignId,
      variant: res.variantName,
      trackersRemoved: res.sanitizedTrackersCount,
      extractedHooks: res.extractedHooks,
      output: res.outputPath
    }, null, 2));
    process.exit(0);
  });
}
