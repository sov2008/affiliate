import fs from 'fs';
import path from 'path';
import { GoldCatalogService } from '../services/gold-catalog.service.js';
import { LlmGatewayService } from '../services/llm-gateway.service.js';
import { MabEngineService, VariantMetrics } from '../services/mab-engine.service.js';
import { Platform } from '../types/pipeline.js';

export interface VariantEvaluationResult {
  campaignId: string;
  variant: string;
  metrics: VariantMetrics;
  status: 'OPTIMAL' | 'STALE_UNDERPERFORMING' | 'COLLECTING_DATA';
  reason?: string;
}

export interface EvolutionResult {
  campaignId: string;
  underperformingVariant: string;
  newVariant: string;
  angleConcept: string;
  htmlPath?: string;
  trackingValidated: boolean;
  validationErrors?: string[];
  mabUpdated: boolean;
  status: 'EVOLVED' | 'SKIPPED' | 'FAILED';
  error?: string;
  timestamp: string;
}

export class VariantEvolutionAgent {
  private static instance: VariantEvolutionAgent | null = null;
  private readonly campaignsDir: string;

  private constructor(customCampaignsDir?: string) {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, 'campaigns'),
      path.resolve(cwd, 'core/campaigns'),
      path.resolve(cwd, '../campaigns'),
    ];
    this.campaignsDir =
      customCampaignsDir || candidates.find((p) => fs.existsSync(p)) || candidates[0];
  }

  public static getInstance(customCampaignsDir?: string): VariantEvolutionAgent {
    if (!this.instance) {
      this.instance = new VariantEvolutionAgent(customCampaignsDir);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Evaluates if a variant should trigger evolution
   */
  public evaluateVariant(
    campaignId: string,
    variant: string,
    metrics: VariantMetrics,
    campaignMetrics: { epc: number; totalClicks: number }
  ): VariantEvaluationResult {
    // 1. Trigger A: >= 50 clicks with 0 conversions
    if (metrics.clicks >= 50 && metrics.conversions === 0) {
      return {
        campaignId,
        variant,
        metrics,
        status: 'STALE_UNDERPERFORMING',
        reason: `Zero conversions after ${metrics.clicks} clicks (Threshold: >= 50 clicks)`,
      };
    }

    // 2. Trigger B: EPC falls 50% below campaign average (with minimum 20 clicks sample)
    if (
      campaignMetrics.totalClicks >= 20 &&
      campaignMetrics.epc > 0 &&
      metrics.clicks >= 20 &&
      metrics.epc < campaignMetrics.epc * 0.5
    ) {
      const dropPct = Math.round(((campaignMetrics.epc - metrics.epc) / campaignMetrics.epc) * 100);
      return {
        campaignId,
        variant,
        metrics,
        status: 'STALE_UNDERPERFORMING',
        reason: `Variant EPC ($${metrics.epc.toFixed(2)}) is ${dropPct}% below campaign average ($${campaignMetrics.epc.toFixed(2)})`,
      };
    }

    // 3. Collecting sample
    if (metrics.clicks < 20) {
      return {
        campaignId,
        variant,
        metrics,
        status: 'COLLECTING_DATA',
        reason: `Sample size gathering (${metrics.clicks}/20 clicks)`,
      };
    }

    return {
      campaignId,
      variant,
      metrics,
      status: 'OPTIMAL',
    };
  }

  /**
   * Scans campaign and returns evaluation for all its variants
   */
  public evaluateCampaign(campaignId: string): VariantEvaluationResult[] {
    const mab = MabEngineService.getInstance({ campaignsDir: this.campaignsDir });
    const variantMetrics = mab.getVariantMetrics(campaignId);

    const totalClicks = Object.values(variantMetrics).reduce((a, b) => a + b.clicks, 0);
    const totalRev = Object.values(variantMetrics).reduce((a, b) => a + b.revenue, 0);
    const campaignEpc = totalClicks > 0 ? totalRev / totalClicks : 0;

    const results: VariantEvaluationResult[] = [];
    for (const [v, metrics] of Object.entries(variantMetrics)) {
      results.push(this.evaluateVariant(campaignId, v, metrics, { epc: campaignEpc, totalClicks }));
    }

    return results;
  }

  /**
   * Determines the next variant tag (e.g. v1, v2 -> v3)
   */
  public getNextVariantTag(campaignId: string): string {
    const campDir = path.join(this.campaignsDir, campaignId);
    if (!fs.existsSync(campDir)) {
      return 'v2';
    }

    try {
      const entries = fs.readdirSync(campDir, { withFileTypes: true });
      const variantNumbers = entries
        .filter((e) => e.isDirectory() && /^v\d+$/i.test(e.name))
        .map((e) => parseInt(e.name.replace(/^v/i, ''), 10))
        .filter((n) => !isNaN(n));

      if (variantNumbers.length === 0) {
        return 'v2';
      }

      const maxNum = Math.max(...variantNumbers);
      return `v${maxNum + 1}`;
    } catch {
      return 'v3';
    }
  }

  /**
   * Validates tracking macros and CTA links in generated HTML
   */
  public validateTracking(html: string): { passed: boolean; errors: string[] } {
    const errors: string[] = [];

    const hasClickId = html.includes('click_id') || html.includes('clk_') || html.includes('{click_id}');
    const hasSub1 = html.includes('sub1') || html.includes('s1=') || html.includes('ml_sub1');
    const hasCta = html.includes('id="ctaLink"') || html.includes('id="ctaButton"') || /<a\s+[^>]*href=/i.test(html);

    if (!hasClickId && !hasSub1) {
      errors.push('HTML is missing click tracking parameter references (click_id / sub1 / ml_sub1)');
    }

    if (!hasCta) {
      errors.push('HTML contains no clickable CTA action links (<a href=...)');
    }

    return {
      passed: errors.length === 0,
      errors,
    };
  }

  /**
   * Synthesizes a new challenger prelander variant
   */
  public async synthesizeChallenger(
    campaignId: string,
    underperformingVariant: string = 'v1',
    options: {
      dryRun?: boolean;
      force?: boolean;
      angleConcept?: string;
      niche?: string;
    } = {}
  ): Promise<EvolutionResult> {
    const timestamp = new Date().toISOString();
    const nextTag = this.getNextVariantTag(campaignId);
    const campDir = path.join(this.campaignsDir, campaignId);

    console.log(
      `\x1b[36m[VariantEvolutionAgent]\x1b[0m Synthesizing challenger \x1b[32m${nextTag}\x1b[0m for ${campaignId} (Mutating ${underperformingVariant})...`
    );

    // 1. Pull winning few-shot patterns from Gold Catalog
    const goldCatalog = GoldCatalogService.getInstance();
    const platform = (campaignId.includes('reddit') ? 'reddit' : campaignId.includes('quora') ? 'quora' : 'reddit') as Platform;
    const niche = options.niche || (campaignId.includes('trading') ? 'crypto' : campaignId.includes('dating') ? 'dating' : 'technology');
    const fewShotContext = goldCatalog.getFewShotExamples(platform, niche, 2);

    // 2. Read base HTML template from underperforming or v1 variant
    let baseHtml = '';
    const baseCandidates = [
      path.join(campDir, underperformingVariant, 'index.html'),
      path.join(campDir, 'v1', 'index.html'),
      path.join(campDir, 'index.html'),
    ];

    for (const p of baseCandidates) {
      if (fs.existsSync(p)) {
        baseHtml = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (!baseHtml) {
      baseHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Exclusive Access 2026</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
    <h1 class="text-2xl font-bold text-sky-400">Next-Gen Verification System</h1>
    <p class="text-sm text-slate-400">Complete the quick 2-step verification below to activate instant access.</p>
    <a id="ctaLink" href="https://trk.network.com/?click_id={click_id}&sub1={sub1}" class="block w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 font-bold rounded-xl text-white">
      Unlock Instant Access &rarr;
    </a>
  </div>
</body>
</html>`;
    }

    // 3. Synthesize mutated content with LLM Gateway
    const angleConcept = options.angleConcept || 'Contrarian Curiosity & 2-Step Friction Reduction';
    const gateway = LlmGatewayService.getInstance();

    let evolvedHtml = '';
    try {
      const systemPrompt = `You are a Principal Conversion Rate Optimization (CRO) & Affiliate Copywriting AI.
Your task is to mutate and upgrade an underperforming affiliate prelander HTML into a high-converting challenger variant (${nextTag}).

MUTATION PROTOCOL:
1. RADICAL HOOK SHIFT:
   - Implement a bold, contrarian angle, curiosity gap, or urgent localized social proof.
2. FRICTION REDUCTION:
   - Streamline interactive elements (e.g. reduce quiz steps from 3 to 2, add sticky high-contrast CTA bar with micro-copy).
3. STRICT TRACKING PRESERVATION:
   - NEVER strip or break tracking macros or parameters ('click_id', 'sub1', 'ml_sub1', 'ml_sub2', 'ml_sub3', 's1').
   - Keep all existing redirect/click event handlers intact.
4. Output ONLY the complete, valid standalone HTML document with zero markdown formatting or explanations.`;

      const userPrompt = `Campaign ID: ${campaignId}
Underperforming Variant: ${underperformingVariant}
Target Challenger: ${nextTag}
Angle Concept: ${angleConcept}
Niche: ${niche}

GOLD CATALOG HIGH-CONVERTING PATTERNS:
${fewShotContext || 'Focus on high authority, risk reversal, and low cognitive load.'}

BASE HTML TO MUTATE:
${baseHtml.slice(0, 3000)}`;

      const inferenceResult = await gateway.executeInference('agent-context-copywriter-02', {
        systemPrompt,
        userPrompt,
        temperature: 0.7,
      });

      evolvedHtml = (inferenceResult.rawText || '')
        .replace(/^```html\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[VariantEvolutionAgent] LLM mutation failed: ${msg}. Using heuristic template synthesizer.`);
    }

    // Heuristic fallback if LLM synthesis returned empty or invalid HTML
    if (!evolvedHtml || !evolvedHtml.includes('<html') || !evolvedHtml.includes('</html>')) {
      evolvedHtml = baseHtml
        .replace(
          /<h1([^>]*)>([\s\S]*?)<\/h1>/i,
          `<h1$1>⚠️ Stop Making This Fatal Mistake in 2026 (Verified Method)</h1>`
        )
        .replace(
          /<title>([\s\S]*?)<\/title>/i,
          `<title>Contrarian Protocol 2026 // Direct Access</title>`
        );

      // Inject enhanced sticky CTA if not already present
      if (!evolvedHtml.includes('sticky-cta-banner') && evolvedHtml.includes('</body>')) {
        const stickyBanner = `
  <!-- Evolution Synthesizer: Friction-Reduced Sticky CTA Bar -->
  <div id="sticky-cta-banner" class="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-sky-500/30 p-3 z-50 flex items-center justify-between max-w-md mx-auto">
    <div class="text-[11px] text-slate-300 font-mono">
      <span class="text-emerald-400 font-bold">⚡ 94.8% Match</span> • Instant Access
    </div>
    <a id="ctaLinkSticky" href="#" onclick="document.getElementById('ctaLink')?.click(); return false;" class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-white text-xs font-bold rounded-lg shadow-lg">
      Claim Spot &rarr;
    </a>
  </div>`;
        evolvedHtml = evolvedHtml.replace('</body>', `${stickyBanner}\n</body>`);
      }
    }

    // 4. Tracking Validation
    const validation = this.validateTracking(evolvedHtml);
    if (!validation.passed) {
      console.warn(
        `[VariantEvolutionAgent] Tracking validation warning for ${nextTag}: ${validation.errors.join(', ')}`
      );
    }

    let targetFilePath: string | undefined;
    let mabUpdated = false;

    // 5. Scaffold file and sync MAB router
    if (!options.dryRun) {
      const targetDir = path.join(campDir, nextTag);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      targetFilePath = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFilePath, evolvedHtml, 'utf8');
      console.log(`\x1b[32m[VariantEvolutionAgent]\x1b[0m Successfully deployed challenger to ${targetFilePath}`);

      // Sync with MAB traffic router
      try {
        const mab = MabEngineService.getInstance({ campaignsDir: this.campaignsDir });
        await mab.optimizeCampaign(campaignId);
        mabUpdated = true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[VariantEvolutionAgent] MAB router update notice: ${msg}`);
      }
    }

    return {
      campaignId,
      underperformingVariant,
      newVariant: nextTag,
      angleConcept,
      htmlPath: targetFilePath,
      trackingValidated: validation.passed,
      validationErrors: validation.errors.length > 0 ? validation.errors : undefined,
      mabUpdated,
      status: 'EVOLVED',
      timestamp,
    };
  }

  /**
   * Scans all campaigns, identifies underperforming variants, and synthesizes challengers
   */
  public async scanAndEvolve(options: { dryRun?: boolean } = {}): Promise<EvolutionResult[]> {
    const results: EvolutionResult[] = [];
    const defaultCampaigns = ['cmp_trading_au', 'cmp_lospollos_dating', 'cmp_vpn_us', 'cmp_elite_de'];

    let campaigns = defaultCampaigns;
    if (fs.existsSync(this.campaignsDir)) {
      try {
        const entries = fs.readdirSync(this.campaignsDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory() && e.name.startsWith('cmp_')).map((e) => e.name);
        if (dirs.length > 0) {
          campaigns = Array.from(new Set([...defaultCampaigns, ...dirs]));
        }
      } catch {}
    }

    for (const cid of campaigns) {
      const evaluations = this.evaluateCampaign(cid);
      for (const ev of evaluations) {
        if (ev.status === 'STALE_UNDERPERFORMING') {
          console.log(`\x1b[33m[VariantEvolutionAgent]\x1b[0m Variant ${ev.variant} in ${cid} flagged: ${ev.reason}`);
          const evo = await this.synthesizeChallenger(cid, ev.variant, options);
          results.push(evo);
        }
      }
    }

    return results;
  }
}

export const variantEvolutionAgent = VariantEvolutionAgent.getInstance();
