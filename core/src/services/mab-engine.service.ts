import fs from 'fs';
import path from 'path';
import { FinancialTelemetryMatcher, MetricAggregate } from '../server/telemetry-matcher.js';

export interface VariantMetrics {
  clicks: number;
  conversions: number;
  revenue: number;
  epc: number;
  cr: number;
}

export interface MabCampaignState {
  campaignId: string;
  winnerVariant: string;
  weights: Record<string, number>;
  variants: Record<string, VariantMetrics>;
  totalClicks: number;
  totalRevenue: number;
  totalConversions: number;
  confidenceMet: boolean;
  status: 'COLLECTING_SAMPLE' | 'OPTIMIZED' | 'TIE';
  lastOptimizedAt: string;
}

export interface MabState {
  version: string;
  updatedAt: string;
  epsilon: number;
  minConfidenceClicks: number;
  campaigns: Record<string, MabCampaignState>;
}

export interface MabOptimizationResult {
  campaignId: string;
  winner: string;
  weights: Record<string, number>;
  confidenceMet: boolean;
  routerUpdated: boolean;
  routerPath?: string;
  state: MabCampaignState;
}

export class MabEngineService {
  private static instance: MabEngineService | null = null;
  private readonly stateFilePath: string;
  private readonly campaignsDir: string;
  private readonly telemetryFilePath: string;
  private state: MabState;

  public readonly EPSILON: number = 0.15; // 15% exploration, 85% exploitation
  public readonly MIN_CONFIDENCE_CLICKS: number = 20;

  private constructor(options: { stateFilePath?: string; campaignsDir?: string; telemetryFilePath?: string } = {}) {
    const cwd = process.cwd();

    const stateCandidates = [
      path.resolve(cwd, 'data/mab_state.json'),
      path.resolve(cwd, 'core/data/mab_state.json'),
    ];
    this.stateFilePath =
      options.stateFilePath || stateCandidates.find((p) => fs.existsSync(p)) || stateCandidates[0];

    const campCandidates = [
      path.resolve(cwd, 'campaigns'),
      path.resolve(cwd, 'core/campaigns'),
      path.resolve(cwd, '../campaigns'),
    ];
    this.campaignsDir =
      options.campaignsDir || campCandidates.find((p) => fs.existsSync(p)) || campCandidates[0];

    const telemCandidates = [
      path.resolve(cwd, 'data/financial_telemetry.json'),
      path.resolve(cwd, 'core/data/financial_telemetry.json'),
    ];
    this.telemetryFilePath =
      options.telemetryFilePath || telemCandidates.find((p) => fs.existsSync(p)) || telemCandidates[0];

    this.state = this.loadState();
  }

  public static getInstance(options?: { stateFilePath?: string; campaignsDir?: string; telemetryFilePath?: string }): MabEngineService {
    if (!this.instance) {
      this.instance = new MabEngineService(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private ensureDir(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadState(): MabState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf8');
        return JSON.parse(raw);
      }
    } catch {}

    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      epsilon: this.EPSILON,
      minConfidenceClicks: this.MIN_CONFIDENCE_CLICKS,
      campaigns: {},
    };
  }

  public saveState(): void {
    try {
      this.ensureDir(this.stateFilePath);
      this.state.updatedAt = new Date().toISOString();
      const tmp = `${this.stateFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
      fs.renameSync(tmp, this.stateFilePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[MabEngineService] Failed to save state: ${msg}`);
    }
  }

  public getState(): MabState {
    return { ...this.state };
  }

  /**
   * Discovers available variants for a given campaign from disk
   */
  public discoverCampaignVariants(campaignId: string): string[] {
    const campPath = path.join(this.campaignsDir, campaignId);
    if (!fs.existsSync(campPath)) {
      return ['v1', 'v2'];
    }

    try {
      const entries = fs.readdirSync(campPath, { withFileTypes: true });
      const dirs = entries
        .filter((e) => e.isDirectory() && (e.name.startsWith('v') || e.name.startsWith('var')))
        .map((e) => e.name);

      return dirs.length > 0 ? dirs : ['v1', 'v2'];
    } catch {
      return ['v1', 'v2'];
    }
  }

  /**
   * Ingests financial telemetry and aggregates per-variant metrics
   */
  public getVariantMetrics(campaignId: string): Record<string, VariantMetrics> {
    const variants = this.discoverCampaignVariants(campaignId);
    const result: Record<string, VariantMetrics> = {};

    for (const v of variants) {
      result[v] = {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        epc: 0,
        cr: 0,
      };
    }

    // Try reading live telemetry matcher data
    try {
      const matcher = FinancialTelemetryMatcher.getInstance();
      const data = matcher.getData();

      // Check bundle matches for this campaign
      for (const [bundleId, bundleMetrics] of Object.entries<MetricAggregate>(data.bundles)) {
        if (bundleId.toLowerCase().includes(campaignId.toLowerCase())) {
          // Identify variant tag if present (e.g. bundle_cmp_trading_au_v1 or _v2)
          let matchedVariant = 'v1';
          for (const v of variants) {
            if (bundleId.toLowerCase().includes(`_${v.toLowerCase()}`) || bundleId.toLowerCase().endsWith(v.toLowerCase())) {
              matchedVariant = v;
              break;
            }
          }

          if (result[matchedVariant]) {
            result[matchedVariant].clicks += bundleMetrics.clicks || 0;
            result[matchedVariant].conversions += bundleMetrics.conversions || 0;
            result[matchedVariant].revenue += bundleMetrics.revenue || 0;
          }
        }
      }

      // Check recent postback events for sub3/bundle variant mappings
      for (const ev of data.recentEvents) {
        if (ev.campaignId === campaignId && ev.status !== 'rejected') {
          const bundleId = ev.bundleId || '';
          let matchedVariant = 'v1';
          for (const v of variants) {
            if (bundleId.toLowerCase().includes(`_${v.toLowerCase()}`) || bundleId.toLowerCase().endsWith(v.toLowerCase())) {
              matchedVariant = v;
              break;
            }
          }
          // Payout is already accounted in bundle metrics, but if bundle was missing:
          if (result[matchedVariant] && result[matchedVariant].conversions === 0 && result[matchedVariant].revenue === 0) {
            result[matchedVariant].conversions += 1;
            result[matchedVariant].revenue += ev.payout;
          }
        }
      }
    } catch {}

    // Calculate EPC and CR for each variant
    for (const v of variants) {
      const item = result[v];
      item.epc = item.clicks > 0 ? Number((item.revenue / item.clicks).toFixed(4)) : 0;
      item.cr = item.clicks > 0 ? Number(((item.conversions / item.clicks) * 100).toFixed(2)) : 0;
    }

    return result;
  }

  /**
   * Computes traffic allocation weights using Epsilon-Greedy with exploration floor & sample size check
   */
  public computeAllocation(
    campaignId: string,
    variantMetrics: Record<string, VariantMetrics>
  ): { weights: Record<string, number>; winner: string; confidenceMet: boolean; status: MabCampaignState['status'] } {
    const variantKeys = Object.keys(variantMetrics);
    if (variantKeys.length === 0) {
      return {
        weights: { v1: 50, v2: 50 },
        winner: 'v1',
        confidenceMet: false,
        status: 'COLLECTING_SAMPLE',
      };
    }

    if (variantKeys.length === 1) {
      return {
        weights: { [variantKeys[0]]: 100 },
        winner: variantKeys[0],
        confidenceMet: true,
        status: 'OPTIMIZED',
      };
    }

    const totalClicks = Object.values(variantMetrics).reduce((acc, curr) => acc + curr.clicks, 0);

    // Rule: If total clicks across variants or variant has < MIN_CONFIDENCE_CLICKS (20), maintain equal split
    const hasEnoughClicks = totalClicks >= this.MIN_CONFIDENCE_CLICKS && Object.values(variantMetrics).some((v) => v.clicks >= 5);

    if (!hasEnoughClicks) {
      const equalWeight = Math.floor(100 / variantKeys.length);
      const weights: Record<string, number> = {};
      let remaining = 100;

      for (let i = 0; i < variantKeys.length; i++) {
        if (i === variantKeys.length - 1) {
          weights[variantKeys[i]] = remaining;
        } else {
          weights[variantKeys[i]] = equalWeight;
          remaining -= equalWeight;
        }
      }

      return {
        weights,
        winner: variantKeys[0],
        confidenceMet: false,
        status: 'COLLECTING_SAMPLE',
      };
    }

    // Identify highest-EPC winner
    let bestVariant = variantKeys[0];
    let maxEpc = variantMetrics[bestVariant].epc;
    let isTie = true;

    for (let i = 1; i < variantKeys.length; i++) {
      const vk = variantKeys[i];
      const curEpc = variantMetrics[vk].epc;

      if (curEpc > maxEpc) {
        maxEpc = curEpc;
        bestVariant = vk;
        isTie = false;
      } else if (curEpc < maxEpc) {
        isTie = false;
      }
    }

    if (isTie && maxEpc === 0) {
      const equalWeight = Math.floor(100 / variantKeys.length);
      const weights: Record<string, number> = {};
      let remaining = 100;

      for (let i = 0; i < variantKeys.length; i++) {
        if (i === variantKeys.length - 1) {
          weights[variantKeys[i]] = remaining;
        } else {
          weights[variantKeys[i]] = equalWeight;
          remaining -= equalWeight;
        }
      }

      return {
        weights,
        winner: variantKeys[0],
        confidenceMet: false,
        status: 'TIE',
      };
    }

    // Epsilon-Greedy allocation: 85% Exploitation (dominant winner), 15% Exploration (challengers)
    const exploitationWeight = Math.round((1 - this.EPSILON) * 100); // 85%
    const explorationWeight = 100 - exploitationWeight; // 15%
    const challengerKeys = variantKeys.filter((v) => v !== bestVariant);

    const weights: Record<string, number> = {};
    weights[bestVariant] = exploitationWeight;

    if (challengerKeys.length > 0) {
      const perChallenger = Math.floor(explorationWeight / challengerKeys.length);
      let remChallenger = explorationWeight;

      for (let i = 0; i < challengerKeys.length; i++) {
        const ck = challengerKeys[i];
        if (i === challengerKeys.length - 1) {
          weights[ck] = remChallenger;
        } else {
          weights[ck] = perChallenger;
          remChallenger -= perChallenger;
        }
      }
    }

    return {
      weights,
      winner: bestVariant,
      confidenceMet: true,
      status: 'OPTIMIZED',
    };
  }

  /**
   * Generates optimized client-side split router HTML
   */
  public generateRouterHtml(campaignId: string, weights: Record<string, number>): string {
    const weightsJson = JSON.stringify(weights);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Affiliate Split Router // MAB Engine</title>
</head>
<body style="background:#0b0f17;color:#94a3b8;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;">
    <div style="font-size:14px;color:#38bdf8;margin-bottom:8px;">⚡ Multi-Armed Bandit Dynamic Routing...</div>
    <div style="font-size:11px;color:#64748b;">Redirecting to high-converting variant</div>
  </div>
  <script>
    (function() {
      try {
        var weights = ${weightsJson};
        var stored = localStorage.getItem('${campaignId}_variant');
        if (stored && weights[stored] !== undefined) {
          window.location.replace('./' + stored + '/index.html' + window.location.search);
          return;
        }

        var rand = Math.random() * 100;
        var cumulative = 0;
        var chosen = Object.keys(weights)[0] || 'v1';

        for (var v in weights) {
          cumulative += weights[v];
          if (rand < cumulative) {
            chosen = v;
            break;
          }
        }

        localStorage.setItem('${campaignId}_variant', chosen);
        window.location.replace('./' + chosen + '/index.html' + window.location.search);
      } catch (err) {
        window.location.replace('./v1/index.html' + window.location.search);
      }
    })();
  </script>
</body>
</html>
<!-- MAB Optimized: ${new Date().toISOString()} -->
`;
  }

  /**
   * Optimizes a single active campaign: evaluates metrics, computes weights, writes split router and saves state
   */
  public async optimizeCampaign(
    campaignId: string,
    options: { dryRun?: boolean; customMetrics?: Record<string, VariantMetrics> } = {}
  ): Promise<MabOptimizationResult> {
    const variants = options.customMetrics || this.getVariantMetrics(campaignId);
    const { weights, winner, confidenceMet, status } = this.computeAllocation(campaignId, variants);

    const totalClicks = Object.values(variants).reduce((acc, curr) => acc + curr.clicks, 0);
    const totalRevenue = Object.values(variants).reduce((acc, curr) => acc + curr.revenue, 0);
    const totalConversions = Object.values(variants).reduce((acc, curr) => acc + curr.conversions, 0);

    const campaignState: MabCampaignState = {
      campaignId,
      winnerVariant: winner,
      weights,
      variants,
      totalClicks,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalConversions,
      confidenceMet,
      status,
      lastOptimizedAt: new Date().toISOString(),
    };

    this.state.campaigns[campaignId] = campaignState;

    let routerUpdated = false;
    let routerPath: string | undefined;

    if (!options.dryRun) {
      const campDir = path.join(this.campaignsDir, campaignId);
      if (fs.existsSync(campDir)) {
        routerPath = path.join(campDir, 'index.html');
        const routerHtml = this.generateRouterHtml(campaignId, weights);
        fs.writeFileSync(routerPath, routerHtml, 'utf8');
        routerUpdated = true;
      }
      this.saveState();
    }

    return {
      campaignId,
      winner,
      weights,
      confidenceMet,
      routerUpdated,
      routerPath,
      state: campaignState,
    };
  }

  /**
   * Optimizes all campaigns found in campaigns/ directory
   */
  public async optimizeAllCampaigns(options: { dryRun?: boolean } = {}): Promise<Record<string, MabOptimizationResult>> {
    const defaultCampaigns = ['cmp_trading_au', 'cmp_lospollos_dating', 'cmp_vpn_us', 'cmp_elite_de'];
    const results: Record<string, MabOptimizationResult> = {};

    let discoveredCampaigns = defaultCampaigns;
    if (fs.existsSync(this.campaignsDir)) {
      try {
        const entries = fs.readdirSync(this.campaignsDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory() && e.name.startsWith('cmp_')).map((e) => e.name);
        if (dirs.length > 0) {
          discoveredCampaigns = Array.from(new Set([...defaultCampaigns, ...dirs]));
        }
      } catch {}
    }

    for (const cid of discoveredCampaigns) {
      results[cid] = await this.optimizeCampaign(cid, options);
    }

    return results;
  }
}

export const mabEngineService = MabEngineService.getInstance();
