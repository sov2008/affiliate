import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Platform, RawContext, GeneratedCreative, BundleArtifact } from '../types/pipeline.js';

export interface PerformanceMetrics {
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface GoldCatalogEntry {
  id: string;
  platform: Platform;
  niche: string;
  inputContext: RawContext;
  approvedCreative: GeneratedCreative;
  complianceScore: number;
  performanceMetrics: PerformanceMetrics;
  addedAt: string;
  updatedAt?: string;
  isPinned?: boolean;
}

export interface GoldCatalogStorage {
  version: string;
  updatedAt: string;
  entries: GoldCatalogEntry[];
}

export interface IngestOptions {
  force?: boolean;
  niche?: string;
  metrics?: Partial<PerformanceMetrics>;
}

export class GoldCatalogService {
  private static instance: GoldCatalogService | null = null;
  private readonly storageFilePath: string;
  private entries: GoldCatalogEntry[] = [];
  private readonly maxEntries = 50;
  private readonly minComplianceThreshold = 90;

  private constructor(customPath?: string) {
    if (customPath) {
      this.storageFilePath = customPath;
    } else {
      const candidates = [
        path.resolve(process.cwd(), 'data/gold_catalog.json'),
        path.resolve(process.cwd(), 'core/data/gold_catalog.json'),
      ];

      const existing = candidates.find((p) => fs.existsSync(p));
      if (existing) {
        this.storageFilePath = existing;
      } else {
        // Default to root data or current cwd data
        const rootDataDir = path.resolve(process.cwd(), 'data');
        this.storageFilePath = path.join(rootDataDir, 'gold_catalog.json');
      }
    }

    this.ensureDirectory();
    this.loadCatalog();
  }

  public static getInstance(customPath?: string): GoldCatalogService {
    if (!this.instance || (customPath && this.instance.storageFilePath !== customPath)) {
      this.instance = new GoldCatalogService(customPath);
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

  /**
   * Loads catalog from disk into memory
   */
  public loadCatalog(): GoldCatalogEntry[] {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf8');
        const parsed = JSON.parse(raw) as GoldCatalogStorage | GoldCatalogEntry[];
        if (Array.isArray(parsed)) {
          this.entries = parsed;
        } else if (parsed && Array.isArray(parsed.entries)) {
          this.entries = parsed.entries;
        } else {
          this.entries = [];
        }
      } else {
        this.entries = [];
        this.saveCatalog();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[GoldCatalogService] Failed to load catalog from ${this.storageFilePath}: ${msg}`);
      this.entries = [];
    }

    return this.entries;
  }

  /**
   * Persists catalog to disk atomically
   */
  private saveCatalog(): void {
    try {
      this.ensureDirectory();
      const payload: GoldCatalogStorage = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        entries: this.entries,
      };

      const tmpPath = `${this.storageFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.storageFilePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[GoldCatalogService] Failed to save catalog: ${msg}`);
    }
  }

  /**
   * Calculates a composite ranking score for an entry based on verified performance metrics:
   * 1. Conversions (Highest weight)
   * 2. Revenue
   * 3. Compliance score
   * 4. Clicks
   */
  private calculateRankScore(entry: GoldCatalogEntry): number {
    const conv = entry.performanceMetrics?.conversions || 0;
    const rev = entry.performanceMetrics?.revenue || 0;
    const score = entry.complianceScore || 0;
    const clicks = entry.performanceMetrics?.clicks || 0;

    return conv * 10000 + rev * 100 + score * 10 + clicks * 0.1;
  }

  /**
   * Sorts entries by rank score descending and truncates to top 50
   * Pinned entries (isPinned === true) are given absolute highest priority
   */
  private pruneAndRank(): void {
    this.entries.sort((a, b) => {
      const aPinned = Boolean(a.isPinned);
      const bPinned = Boolean(b.isPinned);
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      const scoreDiff = this.calculateRankScore(b) - this.calculateRankScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }
  }

  /**
   * Manually pins or unpins an entry in the Gold Catalog
   */
  public pinEntry(id: string, isPinned: boolean = true): boolean {
    const entry = this.entries.find((e) => e.id === id);
    if (!entry) return false;
    entry.isPinned = isPinned;
    entry.updatedAt = new Date().toISOString();
    this.pruneAndRank();
    this.saveCatalog();
    return true;
  }

  /**
   * Manually removes an entry from the Gold Catalog
   */
  public deleteEntry(id: string): boolean {
    const initialLen = this.entries.length;
    this.entries = this.entries.filter((e) => e.id !== id);
    if (this.entries.length !== initialLen) {
      this.saveCatalog();
      return true;
    }
    return false;
  }

  /**
   * Extracts or infers niche from raw context metadata or topic
   */
  public extractNiche(context: RawContext): string {
    const meta = context.metadata || {};
    if (typeof meta.niche === 'string' && meta.niche.trim().length > 0) {
      return meta.niche.trim().toLowerCase();
    }
    if (typeof meta.vertical === 'string' && meta.vertical.trim().length > 0) {
      return meta.vertical.trim().toLowerCase();
    }
    if (typeof meta.campaign_id === 'string') {
      const cid = meta.campaign_id.toLowerCase();
      if (cid.includes('dating')) return 'dating';
      if (cid.includes('trading') || cid.includes('crypto')) return 'finance';
      if (cid.includes('vpn') || cid.includes('software')) return 'tech';
    }
    return 'general';
  }

  /**
   * Ingests an approved bundle if it passes qualification criteria:
   * - Operator approval with complianceScore >= 90 OR
   * - Performance metrics with conversions > 0
   */
  public ingestApprovedBundle(bundle: BundleArtifact, options: IngestOptions = {}): boolean {
    if (!bundle || !bundle.context || !bundle.creative) {
      return false;
    }

    const complianceScore = bundle.compliance?.score ?? 0;
    const initialMetrics: PerformanceMetrics = {
      clicks: options.metrics?.clicks ?? 0,
      conversions: options.metrics?.conversions ?? 0,
      revenue: options.metrics?.revenue ?? 0,
    };

    const hasConversions = initialMetrics.conversions > 0;
    const isQualifyingScore = complianceScore >= this.minComplianceThreshold;
    const isApproved = bundle.status === 'APPROVED' || bundle.status === 'COMPLIANT' || options.force;

    if (!hasConversions && !(isQualifyingScore && isApproved)) {
      return false;
    }

    const niche = options.niche || this.extractNiche(bundle.context);

    const entry: GoldCatalogEntry = {
      id: bundle.id || crypto.randomUUID(),
      platform: bundle.context.platform,
      niche,
      inputContext: bundle.context,
      approvedCreative: bundle.creative,
      complianceScore,
      performanceMetrics: initialMetrics,
      addedAt: new Date().toISOString(),
    };

    return this.upsertEntry(entry);
  }

  /**
   * Upserts an entry by deduplicating on inputContext.sourceUrl,
   * updating metrics and creative, and enforcing top 50 capacity.
   */
  public upsertEntry(entry: GoldCatalogEntry): boolean {
    if (!entry || !entry.inputContext || !entry.approvedCreative) {
      return false;
    }

    const sourceUrl = (entry.inputContext.sourceUrl || '').trim();
    const existingIndex = this.entries.findIndex(
      (e) => (e.inputContext.sourceUrl || '').trim() === sourceUrl && sourceUrl.length > 0
    );

    if (existingIndex >= 0) {
      const existing = this.entries[existingIndex];
      // Merge metrics and keep best compliance score / latest creative
      const updatedMetrics: PerformanceMetrics = {
        clicks: Math.max(existing.performanceMetrics?.clicks || 0, entry.performanceMetrics?.clicks || 0),
        conversions: Math.max(existing.performanceMetrics?.conversions || 0, entry.performanceMetrics?.conversions || 0),
        revenue: Math.max(existing.performanceMetrics?.revenue || 0, entry.performanceMetrics?.revenue || 0),
      };

      this.entries[existingIndex] = {
        ...existing,
        niche: entry.niche || existing.niche,
        approvedCreative: entry.approvedCreative || existing.approvedCreative,
        complianceScore: Math.max(existing.complianceScore, entry.complianceScore),
        performanceMetrics: updatedMetrics,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.entries.push(entry);
    }

    this.pruneAndRank();
    this.saveCatalog();
    return true;
  }

  /**
   * Records live conversions or click metrics against an existing or new catalog entry
   */
  public recordMetrics(sourceUrl: string, delta: Partial<PerformanceMetrics>): boolean {
    if (!sourceUrl) return false;
    const cleanUrl = sourceUrl.trim();
    const existing = this.entries.find((e) => (e.inputContext.sourceUrl || '').trim() === cleanUrl);

    if (!existing) {
      return false;
    }

    existing.performanceMetrics.clicks += delta.clicks || 0;
    existing.performanceMetrics.conversions += delta.conversions || 0;
    existing.performanceMetrics.revenue += delta.revenue || 0;
    existing.updatedAt = new Date().toISOString();

    this.pruneAndRank();
    this.saveCatalog();
    return true;
  }

  /**
   * Updates performance metrics by bundle ID or source URL when live conversions/payout occur.
   * If entry doesn't exist yet in the catalog, but has bundle artifact on disk, loads and ingests it.
   */
  public updatePerformance(bundleIdOrUrl: string, payout: number, deltaConversions: number = 1): boolean {
    if (!bundleIdOrUrl) return false;
    const target = bundleIdOrUrl.trim();

    const existing = this.entries.find(
      (e) => e.id === target || (e.inputContext.sourceUrl || '').trim() === target
    );

    if (existing) {
      existing.performanceMetrics.conversions = (existing.performanceMetrics.conversions || 0) + (deltaConversions || 1);
      existing.performanceMetrics.revenue = Number(((existing.performanceMetrics.revenue || 0) + (payout || 0)).toFixed(2));
      existing.updatedAt = new Date().toISOString();
      this.pruneAndRank();
      this.saveCatalog();
      return true;
    }

    // Try loading bundle from disk if id provided
    const candidateBundlePaths = [
      path.resolve(process.cwd(), `runs/${target}/bundle.json`),
      path.resolve(process.cwd(), `runs/pending/${target}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/${target}/bundle.json`),
      path.resolve(process.cwd(), `core/runs/pending/${target}/bundle.json`),
    ];

    for (const p of candidateBundlePaths) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, 'utf8');
          const bundle: BundleArtifact = JSON.parse(raw);
          if (bundle && bundle.context && bundle.creative) {
            return this.ingestApprovedBundle(bundle, {
              force: true,
              metrics: { conversions: deltaConversions, revenue: payout, clicks: 1 },
            });
          }
        } catch {}
      }
    }

    return false;
  }

  /**
   * Retrieves all entries
   */
  public getEntries(): GoldCatalogEntry[] {
    return [...this.entries];
  }

  /**
   * Retrieves entry count
   */
  public count(): number {
    return this.entries.length;
  }

  /**
   * Alias for count()
   */
  public getGoldSamplesCount(): number {
    return this.count();
  }

  /**
   * Formats top historical pairs (Context -> Creative) into a dynamic few-shot prompt
   * for CopywriterAgent system prompts.
   */
  public getFewShotExamples(platform: Platform, niche: string, limit = 3): string {
    this.loadCatalog();

    if (this.entries.length === 0) {
      return '';
    }

    const targetPlatform = platform.toLowerCase();
    const targetNiche = niche.toLowerCase();

    // 1. Filter matching platform
    const platformMatches = this.entries.filter(
      (e) => e.platform.toLowerCase() === targetPlatform
    );

    if (platformMatches.length === 0) {
      return '';
    }

    // 2. Prioritize exact niche match, fallback to platform top performers
    const nicheMatches = platformMatches.filter(
      (e) => (e.niche || '').toLowerCase() === targetNiche
    );

    const candidates = nicheMatches.length > 0 ? nicheMatches : platformMatches;

    // 3. Take top N highest-performing examples
    const selected = candidates.slice(0, Math.max(1, limit));

    if (selected.length === 0) {
      return '';
    }

    // 4. Format structured few-shot examples
    const formattedBlocks = selected.map((entry, idx) => {
      const conv = entry.performanceMetrics?.conversions || 0;
      const score = entry.complianceScore || 100;
      const pain = entry.inputContext.targetAudiencePain || 'General pain point';
      const topic = entry.inputContext.topicTitle || 'Discussion topic';
      const snippet = (entry.inputContext.sourceText || '').slice(0, 300).trim();

      return `--- GOLD EXAMPLE ${idx + 1} [${entry.platform.toUpperCase()} | Niche: ${entry.niche.toUpperCase()} | Score: ${score}/100 | Conversions: ${conv}] ---
[INPUT CONTEXT]
Platform: ${entry.platform.toUpperCase()}
Topic: "${topic}"
Audience Pain: "${pain}"
Source Context: "${snippet}"

[PROVEN HIGH-CONVERTING CREATIVE]
Headline: "${entry.approvedCreative.headline}"
Body:
${entry.approvedCreative.body}
Call To Action: "${entry.approvedCreative.callToAction}"
Image Prompt: "${entry.approvedCreative.generatedPrompt}"`;
    });

    return `\n\n### FEW-SHOT HIGH-PERFORMING HISTORICAL EXAMPLES:
Study and emulate the tone, conversational empathy, natural cadence, and native value structure of these top-converting approved creatives:

${formattedBlocks.join('\n\n')}

CRITICAL INSTRUCTION: Adapt these winning stylistic patterns and psychological hooks to the target topic while maintaining 100% uniqueness and zero synthetic tone.\n`;
  }
}
