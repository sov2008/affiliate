import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { translateLandingPage } from '../skills/landing-cloner-translator-skill.js';
import { MabEngineService } from './mab-engine.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export type VerticalType = 'dating' | 'finance' | 'vpn' | 'crypto';

export interface ScaffoldConfig {
  offerId: string;
  vertical: VerticalType;
  targetGeos: string[]; // e.g. ['US', 'DE', 'FR', 'ES', 'IT', 'AU']
  basePayout: number;
  network?: 'mylead' | 'lospollos' | 'custom';
  customTrackingUrl?: string;
  baseHtmlTemplate?: string;
  dryRun?: boolean;
  autoCommitGit?: boolean;
}

export interface ScaffoldedCampaignInfo {
  campaignId: string;
  geo: string;
  language: string;
  path: string;
  variants: string[];
  trackingValidated: boolean;
  validationErrors?: string[];
}

export interface ScaffoldResult {
  success: boolean;
  offerId: string;
  vertical: VerticalType;
  basePayout: number;
  scaffoldedCampaigns: ScaffoldedCampaignInfo[];
  totalGeneratedVariants: number;
  deployedToMab: boolean;
  timestamp: string;
}

export class CampaignScaffolder {
  private static instance: CampaignScaffolder | null = null;
  private campaignsDir: string;

  private constructor(customCampaignsDir?: string) {
    if (customCampaignsDir) {
      this.campaignsDir = customCampaignsDir;
    } else {
      const candidates = [
        path.resolve(process.cwd(), 'campaigns'),
        path.resolve(process.cwd(), 'core/campaigns'),
        path.resolve(process.cwd(), '../campaigns'),
      ];
      const existing = candidates.find((p) => fs.existsSync(p));
      this.campaignsDir = existing || path.resolve(process.cwd(), 'campaigns');
    }

    if (!fs.existsSync(this.campaignsDir)) {
      try {
        fs.mkdirSync(this.campaignsDir, { recursive: true });
      } catch {}
    }
  }

  public static getInstance(customCampaignsDir?: string): CampaignScaffolder {
    if (!this.instance) {
      this.instance = new CampaignScaffolder(customCampaignsDir);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Validates tracking macros, analytics scripts, and CTA links
   */
  public validateTracking(html: string): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Check for CTA link
    if (!html.includes('href=') || (!html.includes('id="ctaLink"') && !html.includes("id='ctaLink'") && !html.includes('class="cta-btn') && !html.includes('ctaLink'))) {
      errors.push('Missing CTA anchor tag or id="ctaLink"');
    }

    // 2. Check for click_id or tracking query macro
    const hasClickId = html.includes('{click_id}') || html.includes('click_id=') || html.includes('ml_sub') || html.includes('s1=');
    if (!hasClickId) {
      errors.push('Missing tracking macro ({click_id}, ml_sub, or s1)');
    }

    // 3. Check for sub1 or sub2 macro
    const hasSubMacro = html.includes('{sub1}') || html.includes('sub1=') || html.includes('ml_sub1') || html.includes('sub2=');
    if (!hasSubMacro) {
      errors.push('Missing sub-parameter macro ({sub1}, sub1, or ml_sub1)');
    }

    // 4. Check for Umami analytics snippet
    const hasAnalytics = html.includes('/api/analytics/script.js') || html.includes('data-website-id');
    if (!hasAnalytics) {
      errors.push('Missing Umami analytics script tag');
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }

  /**
   * Generates tailored base HTML for vertical and variant
   */
  public generateBaseTemplate(
    vertical: VerticalType,
    variant: 'v1' | 'v2',
    geo: string,
    payout: number,
    offerId: string,
    network: string = 'mylead'
  ): string {
    const trackingHost = network === 'lospollos' ? 'https://trk.lospollos.com/smartlink' : 'https://postback-engine.sov7.workers.dev/click';
    const trackingUrl = `${trackingHost}?click_id={click_id}&sub1={sub1}&sub2=${offerId}&geo=${geo}&city={city}&device={device}`;
    const campaignId = `cmp_${offerId}_${geo.toLowerCase()}`;

    if (vertical === 'crypto' || vertical === 'finance') {
      if (variant === 'v1') {
        return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Institutional Automated Trading & Arbitrage Platform 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="/api/analytics/script.js" data-website-id="${campaignId}" data-auto-track="true"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
  <div class="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Verified Quantitative Protocol</span>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">GEO: ${geo}</span>
    </div>
    
    <div class="space-y-3">
      <h1 class="text-2xl font-extrabold text-white leading-tight">
        Next-Generation Algorithmic Execution System
      </h1>
      <p class="text-sm text-slate-300 leading-relaxed">
        Access institutional-grade liquidity and low-latency algorithmic trade execution. Verified 94.8% risk-reversal across high-volatility pairs.
      </p>
    </div>

    <div class="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2 text-xs text-slate-400">
      <div class="flex justify-between">
        <span>Estimated Daily Yield:</span>
        <strong class="text-emerald-400 font-mono">+2.4% — +4.8%</strong>
      </div>
      <div class="flex justify-between">
        <span>Execution Latency:</span>
        <strong class="text-sky-300 font-mono">&lt; 12ms</strong>
      </div>
      <div class="flex justify-between">
        <span>Security Standard:</span>
        <strong class="text-slate-200">ISO/IEC 27001 Certified</strong>
      </div>
    </div>

    <a id="ctaLink" href="${trackingUrl}" class="block w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-center rounded-xl transition duration-200 shadow-lg shadow-sky-950/50 text-base">
      Unlock Instant Access &rarr;
    </a>

    <p class="text-[11px] text-slate-500 text-center">
      Past performance does not guarantee future results. Capital at risk. Available in ${geo}.
    </p>
  </div>
</body>
</html>`;
      } else {
        // v2: 2-Step Quiz Reduced Friction Prelander
        return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quick Qualification Quiz // Quantitative Access</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="/api/analytics/script.js" data-website-id="${campaignId}" data-auto-track="true"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1 of 2: Eligibility Check</span>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40">${geo} Region</span>
    </div>

    <div class="space-y-2">
      <h1 class="text-xl font-bold text-white">Do you currently trade crypto or equities?</h1>
      <p class="text-xs text-slate-400">Answer 2 simple questions to qualify for private beta allocation.</p>
    </div>

    <div class="space-y-2.5">
      <button onclick="document.getElementById('ctaBlock').classList.remove('hidden')" class="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-sm font-medium transition flex items-center justify-between">
        <span>Yes, actively trading weekly</span>
        <span class="text-sky-400">&rarr;</span>
      </button>
      <button onclick="document.getElementById('ctaBlock').classList.remove('hidden')" class="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-left rounded-xl border border-slate-700 text-sm font-medium transition flex items-center justify-between">
        <span>Beginner looking for automated solutions</span>
        <span class="text-sky-400">&rarr;</span>
      </button>
    </div>

    <div id="ctaBlock" class="pt-2 border-t border-slate-800 space-y-3">
      <div class="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300">
        ✓ <strong>Congratulations!</strong> Your region (${geo}) is eligible for 0% commission onboarding.
      </div>
      <a id="ctaLink" href="${trackingUrl}" class="block w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-center rounded-xl transition duration-200 shadow-lg text-base">
        Claim Your Offer Now &rarr;
      </a>
    </div>
  </div>
</body>
</html>`;
      }
    } else if (vertical === 'dating') {
      return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exclusive Social & Dating Network 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="/api/analytics/script.js" data-website-id="${campaignId}" data-auto-track="true"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-rose-900/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/40 uppercase">
      Live Profiles in ${geo}
    </span>
    <h1 class="text-2xl font-extrabold text-white">Find Verified Connections Near You</h1>
    <p class="text-sm text-slate-300">
      Private, secure matching platform. Confirm your age to view verified profiles in your area.
    </p>
    <a id="ctaLink" href="${trackingUrl}" class="block w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold rounded-xl transition duration-200 shadow-lg text-base">
      Unlock Instant Access &rarr;
    </a>
  </div>
</body>
</html>`;
    } else {
      // Default / VPN / Tech
      return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>High-Speed Secure Tunnel & Privacy Suite 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="/api/analytics/script.js" data-website-id="${campaignId}" data-auto-track="true"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">Zero-Log Privacy Protocol</span>
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-500/40">${geo} Server</span>
    </div>
    <h1 class="text-2xl font-extrabold text-white">Protect Your Connection & Data</h1>
    <p class="text-sm text-slate-300">Military-grade AES-256 encryption. Bypass geo-restrictions with 10Gbps dedicated nodes.</p>
    <a id="ctaLink" href="${trackingUrl}" class="block w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-center rounded-xl transition duration-200 shadow-lg text-base">
      Claim Your Offer Now &rarr;
    </a>
  </div>
</body>
</html>`;
    }
  }

  /**
   * Scaffolds campaigns across multiple target GEOs with localized variants and MAB routers
   */
  public async scaffoldMultiGeo(config: ScaffoldConfig): Promise<ScaffoldResult> {
    const offerId = config.offerId || 'crypto_generic';
    const vertical = config.vertical || 'crypto';
    const targetGeos = (config.targetGeos && config.targetGeos.length > 0) ? config.targetGeos : ['US', 'DE', 'AU'];
    const basePayout = config.basePayout || 100.0;
    const isDryRun = config.dryRun ?? false;

    console.log(`\n🏗️ [CampaignScaffolder] Starting Multi-GEO campaign scaffolding...`);
    console.log(`   📦 Offer ID: ${offerId} | Vertical: ${vertical} | Base Payout: $${basePayout}`);
    console.log(`   🌍 Target GEOs: [${targetGeos.join(', ')}]`);

    const scaffoldedCampaigns: ScaffoldedCampaignInfo[] = [];
    let totalGeneratedVariants = 0;

    for (const geo of targetGeos) {
      const normGeo = geo.trim().toUpperCase();
      const campaignId = `cmp_${offerId}_${normGeo.toLowerCase()}`;
      const campDir = path.join(this.campaignsDir, campaignId);
      const v1Dir = path.join(campDir, 'v1');
      const v2Dir = path.join(campDir, 'v2');

      if (!isDryRun) {
        fs.mkdirSync(v1Dir, { recursive: true });
        fs.mkdirSync(v2Dir, { recursive: true });
      }

      // 1. Generate base templates
      const baseV1Html = this.generateBaseTemplate(vertical, 'v1', normGeo, basePayout, offerId, config.network);
      const baseV2Html = this.generateBaseTemplate(vertical, 'v2', normGeo, basePayout, offerId, config.network);

      // 2. Localize for Target GEO
      const translationV1 = await translateLandingPage(baseV1Html, normGeo, { dryRun: isDryRun, vertical });
      const translationV2 = await translateLandingPage(baseV2Html, normGeo, { dryRun: isDryRun, vertical });

      const finalV1Html = translationV1.cleanedHtml;
      const finalV2Html = translationV2.cleanedHtml;

      // 3. Validate Tracking Macros
      const val1 = this.validateTracking(finalV1Html);
      const val2 = this.validateTracking(finalV2Html);
      const allErrors = [...val1.errors, ...val2.errors];
      const trackingValidated = val1.passed && val2.passed;

      if (!isDryRun) {
        fs.writeFileSync(path.join(v1Dir, 'index.html'), finalV1Html, 'utf8');
        fs.writeFileSync(path.join(v2Dir, 'index.html'), finalV2Html, 'utf8');

        // 4. Generate Client-Side MAB Split Router (50/50 initial)
        const mab = MabEngineService.getInstance();
        const routerHtml = mab.generateRouterHtml(campaignId, { v1: 50, v2: 50 });
        fs.writeFileSync(path.join(campDir, 'index.html'), routerHtml, 'utf8');

        // Register in MAB state
        const state = mab.getState();
        if (!state.campaigns[campaignId]) {
          state.campaigns[campaignId] = {
            campaignId,
            winnerVariant: 'v1',
            weights: { v1: 50, v2: 50 },
            variants: {
              v1: { clicks: 0, conversions: 0, revenue: 0, epc: 0, cr: 0 },
              v2: { clicks: 0, conversions: 0, revenue: 0, epc: 0, cr: 0 },
            },
            totalClicks: 0,
            totalRevenue: 0,
            totalConversions: 0,
            confidenceMet: false,
            status: 'COLLECTING_SAMPLE',
            lastOptimizedAt: new Date().toISOString(),
          };
          mab.saveState();
        }
      }

      totalGeneratedVariants += 2;
      scaffoldedCampaigns.push({
        campaignId,
        geo: normGeo,
        language: translationV1.targetLang,
        path: campDir,
        variants: ['v1', 'v2'],
        trackingValidated,
        validationErrors: allErrors.length > 0 ? allErrors : undefined,
      });

      console.log(`   ✅ [${normGeo}] Scaffolded ${campaignId} (v1 + v2 + MAB Router). Tracking: ${trackingValidated ? 'VALID' : 'INVALID'}`);
    }

    return {
      success: true,
      offerId,
      vertical,
      basePayout,
      scaffoldedCampaigns,
      totalGeneratedVariants,
      deployedToMab: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export const campaignScaffolder = CampaignScaffolder.getInstance();

// Standalone CLI Runner Execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('campaign-scaffolder.service.ts') ||
    process.argv[1].endsWith('campaign-scaffolder.service.js'))
) {
  const args = process.argv.slice(2);
  const parsedArgs: Record<string, string> = {};

  for (const a of args) {
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=');
      parsedArgs[k] = v || 'true';
    }
  }

  const offerId = parsedArgs.offer || parsedArgs.offerId || 'crypto_web3';
  const vertical = (parsedArgs.vertical || 'crypto') as VerticalType;
  const geos = (parsedArgs.geos || parsedArgs.geo || 'US,DE,AU').split(',').map((s) => s.trim().toUpperCase());
  const payout = parseFloat(parsedArgs.payout || '120.0');

  console.log(`\n🚀 [CLI] Executing Multi-GEO Campaign Scaffolding...`);
  const scaffolder = CampaignScaffolder.getInstance();

  scaffolder
    .scaffoldMultiGeo({
      offerId,
      vertical,
      targetGeos: geos,
      basePayout: payout,
    })
    .then((result) => {
      console.log('\n================================================================');
      console.log(`🎉 Scaffolding Complete! Created ${result.scaffoldedCampaigns.length} campaigns (${result.totalGeneratedVariants} variants)`);
      console.log('================================================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ [Scaffolder CLI Error]', err);
      process.exit(1);
    });
}
