import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BundleArtifact, Platform } from '../types/pipeline.js';
import { GoldCatalogService } from '../services/gold-catalog.service.js';

export interface PostbackEvent {
  clickId: string;
  transactionId: string;
  bundleId?: string;
  campaignId: string;
  platform: Platform;
  payout: number;
  currency: string;
  status: 'lead' | 'sale' | 'rejected';
  receivedAt: string;
}

export interface MetricAggregate {
  clicks: number;
  conversions: number;
  revenue: number;
  epc: number; // Earnings Per Click ($)
  cr: number; // Conversion Rate (%)
  lastConversionAt?: string;
}

export interface FinancialTelemetryData {
  version: string;
  updatedAt: string;
  dedupKeys: string[];
  campaigns: Record<string, MetricAggregate>;
  bundles: Record<string, MetricAggregate>;
  recentEvents: PostbackEvent[];
}

export interface ProcessPostbackResult {
  success: boolean;
  duplicate: boolean;
  event: PostbackEvent;
  bundleUpdated: boolean;
  bundleFinancials?: BundleArtifact['financials'];
  metrics: {
    bundle?: MetricAggregate;
    campaign?: MetricAggregate;
  };
  durationMs: number;
}

export class FinancialTelemetryMatcher {
  private static instance: FinancialTelemetryMatcher | null = null;
  private readonly storageFilePath: string;
  private dedupSet: Set<string> = new Set();
  private data: FinancialTelemetryData;

  private constructor(customPath?: string) {
    if (customPath) {
      this.storageFilePath = customPath;
    } else {
      const candidates = [
        path.resolve(process.cwd(), 'data/financial_telemetry.json'),
        path.resolve(process.cwd(), 'core/data/financial_telemetry.json'),
      ];

      const existing = candidates.find((p) => fs.existsSync(p));
      if (existing) {
        this.storageFilePath = existing;
      } else {
        const defaultDir = path.resolve(process.cwd(), 'data');
        this.storageFilePath = path.join(defaultDir, 'financial_telemetry.json');
      }
    }

    this.ensureDirectory();
    this.data = this.loadData();
    for (const k of this.data.dedupKeys) {
      this.dedupSet.add(k);
    }
  }

  public static getInstance(customPath?: string): FinancialTelemetryMatcher {
    if (!this.instance || (customPath && this.instance.storageFilePath !== customPath)) {
      this.instance = new FinancialTelemetryMatcher(customPath);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private ensureDirectory(): void {
    const dir = path.dirname(this.storageFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): FinancialTelemetryData {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf8');
        const parsed = JSON.parse(raw) as FinancialTelemetryData;
        if (parsed && typeof parsed === 'object') {
          return {
            version: parsed.version || '1.0.0',
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            dedupKeys: Array.isArray(parsed.dedupKeys) ? parsed.dedupKeys : [],
            campaigns: parsed.campaigns || {},
            bundles: parsed.bundles || {},
            recentEvents: Array.isArray(parsed.recentEvents) ? parsed.recentEvents : [],
          };
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[FinancialTelemetryMatcher] Warning loading telemetry data: ${msg}`);
    }

    return {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      dedupKeys: [],
      campaigns: {},
      bundles: {},
      recentEvents: [],
    };
  }

  private saveData(): void {
    try {
      this.ensureDirectory();
      this.data.updatedAt = new Date().toISOString();
      this.data.dedupKeys = Array.from(this.dedupSet).slice(-2000); // Keep last 2000 dedup keys
      this.data.recentEvents = this.data.recentEvents.slice(-100); // Keep last 100 events

      const tmpPath = `${this.storageFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.storageFilePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[FinancialTelemetryMatcher] Failed to persist telemetry: ${msg}`);
    }
  }

  /**
   * Generates a deterministic deduplication key
   */
  private generateDedupKey(event: PostbackEvent): string {
    if (event.transactionId && event.transactionId.trim().length > 0) {
      return `tx_${event.transactionId.trim()}`;
    }
    if (event.clickId && event.clickId.trim().length > 0) {
      return `clk_${event.clickId.trim()}_${event.status}_${event.payout}`;
    }
    return `ev_${crypto.createHash('md5').update(JSON.stringify(event)).digest('hex')}`;
  }

  /**
   * Resolves the CPA network name from a bundle's context.metadata.network field.
   * Falls back to campaignId-based heuristic if metadata is unavailable.
   */
  private resolveNetworkFromBundle(bundleId: string, campaignId?: string): string {
    // Try loading bundle from disk to read context.metadata.network
    const candidates = [
      path.resolve(process.cwd(), `runs/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `runs/pending/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/pending/${bundleId}/bundle.json`),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');
          const bundle: BundleArtifact = JSON.parse(raw);
          const network = (bundle.context?.metadata?.network as string || '').toLowerCase().trim();
          if (network) return network;
        } catch {}
      }
    }

    // Fallback: infer from campaignId
    if (campaignId) {
      const cid = campaignId.toLowerCase();
      if (cid.includes('dating') || cid.includes('social') || cid.includes('lospollos') || cid.includes('quiz')) {
        return 'lospollos';
      }
    }

    return 'mylead'; // Default fallback
  }

  /**
   * Processes a live CPA postback event with deduplication,
   * bundle financial enrichment, metrics calculation, GoldCatalog trigger,
   * and network-specific positive/negative feedback loops.
   */
  public processPostback(rawEvent: Partial<PostbackEvent>): ProcessPostbackResult {
    const startTime = performance.now();

    const event: PostbackEvent = {
      clickId: (rawEvent.clickId || '').trim(),
      transactionId: (rawEvent.transactionId || rawEvent.clickId || '').trim(),
      bundleId: (rawEvent.bundleId || '').trim() || undefined,
      campaignId: (rawEvent.campaignId || 'cmp_organic_v1').trim(),
      platform: rawEvent.platform || 'reddit',
      payout: Math.max(0, Number(rawEvent.payout || 0)),
      currency: (rawEvent.currency || 'USD').toUpperCase(),
      status: rawEvent.status === 'rejected' ? 'rejected' : rawEvent.status === 'sale' ? 'sale' : 'lead',
      receivedAt: rawEvent.receivedAt || new Date().toISOString(),
    };

    const dedupKey = this.generateDedupKey(event);

    // 1. Deduplication check
    if (this.dedupSet.has(dedupKey)) {
      const durationMs = Number((performance.now() - startTime).toFixed(2));
      return {
        success: true,
        duplicate: true,
        event,
        bundleUpdated: false,
        metrics: {
          bundle: event.bundleId ? this.data.bundles[event.bundleId] : undefined,
          campaign: this.data.campaigns[event.campaignId],
        },
        durationMs,
      };
    }

    // Mark as processed
    this.dedupSet.add(dedupKey);
    this.data.recentEvents.push(event);

    const isSuccessful = event.status !== 'rejected';
    const convDelta = isSuccessful ? 1 : 0;
    const revDelta = isSuccessful ? event.payout : 0;

    // 2. Update Campaign Metrics Aggregate
    const camp = this.data.campaigns[event.campaignId] || {
      clicks: 0,
      conversions: 0,
      revenue: 0,
      epc: 0,
      cr: 0,
    };

    camp.clicks = Math.max(camp.clicks, camp.conversions + convDelta, 1);
    camp.conversions += convDelta;
    camp.revenue = Number((camp.revenue + revDelta).toFixed(2));
    camp.epc = camp.clicks > 0 ? Number((camp.revenue / camp.clicks).toFixed(2)) : camp.revenue;
    camp.cr = camp.clicks > 0 ? Number(((camp.conversions / camp.clicks) * 100).toFixed(2)) : 0;
    if (isSuccessful) {
      camp.lastConversionAt = event.receivedAt;
    }
    this.data.campaigns[event.campaignId] = camp;

    // 3. Update Bundle Metrics Aggregate & Bundle.json on disk
    let bundleUpdated = false;
    let updatedFinancials: BundleArtifact['financials'];

    if (event.bundleId) {
      const bMetrics = this.data.bundles[event.bundleId] || {
        clicks: 0,
        conversions: 0,
        revenue: 0,
        epc: 0,
        cr: 0,
      };

      bMetrics.clicks = Math.max(bMetrics.clicks, bMetrics.conversions + convDelta, 1);
      bMetrics.conversions += convDelta;
      bMetrics.revenue = Number((bMetrics.revenue + revDelta).toFixed(2));
      bMetrics.epc = bMetrics.clicks > 0 ? Number((bMetrics.revenue / bMetrics.clicks).toFixed(2)) : bMetrics.revenue;
      bMetrics.cr = bMetrics.clicks > 0 ? Number(((bMetrics.conversions / bMetrics.clicks) * 100).toFixed(2)) : 0;
      if (isSuccessful) {
        bMetrics.lastConversionAt = event.receivedAt;
      }
      this.data.bundles[event.bundleId] = bMetrics;

      // Update /runs/{bundleId}/bundle.json
      const bundleResult = this.updateBundleFinancialsOnDisk(event.bundleId, {
        clicks: bMetrics.clicks,
        conversions: bMetrics.conversions,
        totalPayout: bMetrics.revenue,
        lastConversionAt: event.receivedAt,
        currency: event.currency,
        epc: bMetrics.epc,
        cr: bMetrics.cr,
      });

      bundleUpdated = bundleResult.updated;
      updatedFinancials = bundleResult.financials;

      // 4. Ingest/Update Gold Catalog if payout > 0 or conversion achieved
      if (event.payout > 0 || isSuccessful) {
        try {
          GoldCatalogService.getInstance().updatePerformance(event.bundleId, event.payout, convDelta);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[FinancialTelemetryMatcher] GoldCatalog update notice: ${msg}`);
        }
      }

      // 4a. Network-specific positive feedback: record winning pattern
      if (event.payout > 0 && isSuccessful) {
        try {
          const network = this.resolveNetworkFromBundle(event.bundleId, event.campaignId);
          // Load full bundle from disk for the win record
          const bundleCandidates = [
            path.resolve(process.cwd(), `runs/${event.bundleId}/bundle.json`),
            path.resolve(process.cwd(), `runs/pending/${event.bundleId}/bundle.json`),
            path.resolve(process.cwd(), `core/runs/${event.bundleId}/bundle.json`),
            path.resolve(process.cwd(), `core/runs/pending/${event.bundleId}/bundle.json`),
          ];

          for (const bp of bundleCandidates) {
            if (fs.existsSync(bp)) {
              try {
                const bundleRaw = fs.readFileSync(bp, 'utf8');
                const bundleData: BundleArtifact = JSON.parse(bundleRaw);
                if (bundleData && bundleData.creative) {
                  GoldCatalogService.getInstance().recordNetworkWin(network, bundleData, event.payout);
                  break;
                }
              } catch {}
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[FinancialTelemetryMatcher] Network win recording notice: ${msg}`);
        }
      }

      // 4b. Negative feedback detection: high clicks with zero conversions
      const negThreshold = GoldCatalogService.getInstance().getNegativeClickThreshold();
      if (bMetrics.clicks >= negThreshold && bMetrics.conversions === 0) {
        try {
          const network = this.resolveNetworkFromBundle(event.bundleId, event.campaignId);
          GoldCatalogService.getInstance().recordNegativeFeedback(
            network, event.bundleId, bMetrics.clicks
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[FinancialTelemetryMatcher] Negative feedback recording notice: ${msg}`);
        }
      }
    }

    // 5. Persist telemetry store
    this.saveData();

    const durationMs = Number((performance.now() - startTime).toFixed(2));
    return {
      success: true,
      duplicate: false,
      event,
      bundleUpdated,
      bundleFinancials: updatedFinancials,
      metrics: {
        bundle: event.bundleId ? this.data.bundles[event.bundleId] : undefined,
        campaign: this.data.campaigns[event.campaignId],
      },
      durationMs,
    };
  }

  /**
   * Reads and updates the financials block in /runs/{bundle_id}/bundle.json
   */
  private updateBundleFinancialsOnDisk(
    bundleId: string,
    financials: BundleArtifact['financials']
  ): { updated: boolean; financials?: BundleArtifact['financials'] } {
    if (!bundleId) return { updated: false };

    const candidates = [
      path.resolve(process.cwd(), `runs/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `runs/pending/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/${bundleId}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/pending/${bundleId}/bundle.json`),
    ];

    let found = false;
    let targetFinancials = financials;

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');
          const bundle: BundleArtifact = JSON.parse(raw);
          bundle.financials = {
            clicks: financials?.clicks ?? bundle.financials?.clicks ?? 0,
            conversions: financials?.conversions ?? bundle.financials?.conversions ?? 0,
            totalPayout: financials?.totalPayout ?? bundle.financials?.totalPayout ?? 0,
            lastConversionAt: financials?.lastConversionAt ?? bundle.financials?.lastConversionAt ?? new Date().toISOString(),
            currency: financials?.currency ?? bundle.financials?.currency ?? 'USD',
            epc: financials?.epc ?? bundle.financials?.epc ?? 0,
            cr: financials?.cr ?? bundle.financials?.cr ?? 0,
          };
          targetFinancials = bundle.financials;

          const tmp = `${p}.tmp.${Date.now()}`;
          fs.writeFileSync(tmp, JSON.stringify(bundle, null, 2), 'utf8');
          fs.renameSync(tmp, p);
          found = true;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(`[FinancialTelemetryMatcher] Failed updating bundle ${p}: ${msg}`);
        }
      }
    }

    return { updated: found, financials: targetFinancials };
  }

  /**
   * Retrieves summary telemetry stats
   */
  public getTelemetrySummary(): {
    campaignsCount: number;
    bundlesTracked: number;
    totalTransactions: number;
    campaigns: Record<string, MetricAggregate>;
    bundles: Record<string, MetricAggregate>;
  } {
    return {
      campaignsCount: Object.keys(this.data.campaigns).length,
      bundlesTracked: Object.keys(this.data.bundles).length,
      totalTransactions: this.dedupSet.size,
      campaigns: this.data.campaigns,
      bundles: this.data.bundles,
    };
  }

  /**
   * Retrieves full telemetry data
   */
  public getData(): FinancialTelemetryData {
    return {
      version: this.data.version,
      updatedAt: this.data.updatedAt,
      dedupKeys: [...this.data.dedupKeys],
      campaigns: { ...this.data.campaigns },
      bundles: { ...this.data.bundles },
      recentEvents: [...this.data.recentEvents],
    };
  }
}
