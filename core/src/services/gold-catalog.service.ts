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

/**
 * Network-specific winning pattern entry, stored in isolated per-network chambers.
 */
export interface NetworkWinEntry {
  id: string;
  hook: string;
  body: string;
  callToAction: string;
  platform: Platform;
  niche: string;
  payout: number;
  conversions: number;
  addedAt: string;
  sourceUrl?: string;
  audiencePain?: string;
}

export interface NetworkWinStorage {
  version: string;
  updatedAt: string;
  network: string;
  entries: NetworkWinEntry[];
}

/**
 * Negative feedback entry: hooks/structures that attracted high clicks but zero conversions.
 * Used as anti-examples (DO NOT EMULATE) in copywriter prompt injection.
 */
export interface NegativeFeedbackEntry {
  id: string;
  hook: string;
  bodySnippet: string;
  platform: Platform;
  network: string;
  clicks: number;
  conversions: number;
  flaggedAt: string;
  reason: string;
}

export interface NegativeFeedbackStorage {
  version: string;
  updatedAt: string;
  entries: NegativeFeedbackEntry[];
}

export class GoldCatalogService {
  private static instance: GoldCatalogService | null = null;
  private readonly storageFilePath: string;
  private entries: GoldCatalogEntry[] = [];
  private readonly maxEntries = 50;
  private readonly minComplianceThreshold = 90;
  private readonly maxNetworkWins = 30;
  private readonly maxNegativeEntries = 20;
  private readonly negativeClickThreshold = 50;
  private readonly learningBaseDir: string;

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

    // Resolve learning directory (same level as gold_catalog.json)
    this.learningBaseDir = path.join(path.dirname(this.storageFilePath), 'learning');

    this.ensureDirectory();
    this.ensureLearningDirectory();
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

  private ensureLearningDirectory(): void {
    if (!fs.existsSync(this.learningBaseDir)) {
      fs.mkdirSync(this.learningBaseDir, { recursive: true });
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

  // ═══════════════════════════════════════════════════════════════════
  // NETWORK-SPECIFIC LEARNING CHAMBERS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Resolves the file path for a network-specific winning patterns chamber.
   */
  private getNetworkWinFilePath(network: string): string {
    const sanitized = network.toLowerCase().replace(/[^a-z0-9_]/g, '');
    return path.join(this.learningBaseDir, `${sanitized}_wins.json`);
  }

  /**
   * Resolves the file path for the structured negative feedback store.
   */
  private getNegativeFeedbackFilePath(): string {
    return path.join(this.learningBaseDir, 'negative_patterns_v2.json');
  }

  /**
   * Loads network-specific winning patterns from disk.
   */
  private loadNetworkWins(network: string): NetworkWinEntry[] {
    const filePath = this.getNetworkWinFilePath(network);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw) as NetworkWinStorage;
        if (parsed && Array.isArray(parsed.entries)) {
          return parsed.entries;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[GoldCatalogService] Failed to load network wins for ${network}: ${msg}`);
    }
    return [];
  }

  /**
   * Persists network-specific winning patterns atomically.
   */
  private saveNetworkWins(network: string, entries: NetworkWinEntry[]): void {
    try {
      this.ensureLearningDirectory();
      const filePath = this.getNetworkWinFilePath(network);
      const payload: NetworkWinStorage = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        network,
        entries,
      };
      const tmpPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tmpPath, filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[GoldCatalogService] Failed to save network wins for ${network}: ${msg}`);
    }
  }

  /**
   * Loads structured negative feedback entries from disk.
   */
  private loadNegativeFeedback(): NegativeFeedbackEntry[] {
    const filePath = this.getNegativeFeedbackFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw) as NegativeFeedbackStorage;
        if (parsed && Array.isArray(parsed.entries)) {
          return parsed.entries;
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[GoldCatalogService] Failed to load negative feedback: ${msg}`);
    }
    return [];
  }

  /**
   * Persists structured negative feedback entries atomically.
   */
  private saveNegativeFeedback(entries: NegativeFeedbackEntry[]): void {
    try {
      this.ensureLearningDirectory();
      const filePath = this.getNegativeFeedbackFilePath();
      const payload: NegativeFeedbackStorage = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        entries,
      };
      const tmpPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tmpPath, filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[GoldCatalogService] Failed to save negative feedback: ${msg}`);
    }
  }

  /**
   * Records a winning pattern into the network-specific chamber when a postback
   * with payout > 0 arrives. Deduplicates by sourceUrl, ranks by payout descending,
   * and enforces max capacity (30 per network).
   */
  public recordNetworkWin(
    network: string,
    bundle: BundleArtifact,
    payout: number
  ): boolean {
    if (!bundle || !bundle.creative || !network) return false;

    const normalizedNetwork = network.toLowerCase().trim();
    const entries = this.loadNetworkWins(normalizedNetwork);

    const sourceUrl = (bundle.context?.sourceUrl || '').trim();
    const existingIdx = entries.findIndex(
      (e) => (e.sourceUrl || '') === sourceUrl && sourceUrl.length > 0
    );

    const newEntry: NetworkWinEntry = {
      id: bundle.id || crypto.randomUUID(),
      hook: bundle.creative.headline,
      body: bundle.creative.body,
      callToAction: bundle.creative.callToAction,
      platform: bundle.context?.platform || 'reddit',
      niche: this.extractNiche(bundle.context),
      payout,
      conversions: (existingIdx >= 0 ? entries[existingIdx].conversions : 0) + 1,
      addedAt: new Date().toISOString(),
      sourceUrl,
      audiencePain: bundle.context?.targetAudiencePain || '',
    };

    if (existingIdx >= 0) {
      // Merge: keep higher payout, increment conversions
      entries[existingIdx] = {
        ...entries[existingIdx],
        payout: Math.max(entries[existingIdx].payout, payout),
        conversions: newEntry.conversions,
        hook: bundle.creative.headline,
        body: bundle.creative.body,
        callToAction: bundle.creative.callToAction,
        addedAt: new Date().toISOString(),
      };
    } else {
      entries.push(newEntry);
    }

    // Rank by payout desc, then conversions desc
    entries.sort((a, b) => {
      const payoutDiff = b.payout - a.payout;
      if (payoutDiff !== 0) return payoutDiff;
      return b.conversions - a.conversions;
    });

    // Enforce capacity
    const pruned = entries.slice(0, this.maxNetworkWins);
    this.saveNetworkWins(normalizedNetwork, pruned);

    console.log(
      `\x1b[32m[GoldCatalogService]\x1b[0m Recorded network win for "${normalizedNetwork}": "${bundle.creative.headline.slice(0, 50)}..." (payout: $${payout})`
    );
    return true;
  }

  /**
   * Records a negative feedback entry when a bundle reaches the click threshold
   * with zero conversions. Deduplicates by bundle ID, enforces max capacity per network.
   */
  public recordNegativeFeedback(
    network: string,
    bundleId: string,
    clicks: number
  ): boolean {
    if (!bundleId || !network) return false;

    const normalizedNetwork = network.toLowerCase().trim();
    const entries = this.loadNegativeFeedback();

    // Dedup: don't re-record same bundle
    if (entries.some((e) => e.id === bundleId)) {
      return false;
    }

    // Resolve bundle from disk to extract creative
    const bundle = this.loadBundleFromDisk(bundleId);
    if (!bundle || !bundle.creative) {
      return false;
    }

    const entry: NegativeFeedbackEntry = {
      id: bundleId,
      hook: bundle.creative.headline,
      bodySnippet: (bundle.creative.body || '').slice(0, 300),
      platform: bundle.context?.platform || 'reddit',
      network: normalizedNetwork,
      clicks,
      conversions: 0,
      flaggedAt: new Date().toISOString(),
      reason: `High engagement (${clicks} clicks) with zero conversions — likely clickbait without actionable funnel value.`,
    };

    entries.push(entry);

    // Keep only most recent entries per network, enforce global cap
    const networkEntries = entries.filter((e) => e.network === normalizedNetwork);
    const otherEntries = entries.filter((e) => e.network !== normalizedNetwork);

    const prunedNetwork = networkEntries
      .sort((a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime())
      .slice(0, this.maxNegativeEntries);

    this.saveNegativeFeedback([...prunedNetwork, ...otherEntries]);

    console.warn(
      `\x1b[33m[GoldCatalogService]\x1b[0m Negative feedback recorded for "${normalizedNetwork}": "${bundle.creative.headline.slice(0, 50)}..." (${clicks} clicks, 0 conversions)`
    );
    return true;
  }

  /**
   * Loads a BundleArtifact from disk by bundle ID.
   */
  private loadBundleFromDisk(bundleId: string): BundleArtifact | null {
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
          return JSON.parse(raw) as BundleArtifact;
        } catch {}
      }
    }
    return null;
  }

  /**
   * Formats top winning patterns from a specific network's chamber into a
   * structured few-shot prompt section for CopywriterAgent injection.
   */
  public getNetworkFewShotExamples(
    network: string,
    platform: Platform,
    niche: string,
    limit = 3
  ): string {
    const normalizedNetwork = network.toLowerCase().trim();
    const entries = this.loadNetworkWins(normalizedNetwork);

    if (entries.length === 0) {
      return '';
    }

    const targetPlatform = platform.toLowerCase();
    const targetNiche = niche.toLowerCase();

    // Prioritize: same platform+niche > same platform > all
    const nicheMatches = entries.filter(
      (e) => e.platform.toLowerCase() === targetPlatform && (e.niche || '').toLowerCase() === targetNiche
    );
    const platformMatches = entries.filter(
      (e) => e.platform.toLowerCase() === targetPlatform
    );

    const candidates = nicheMatches.length > 0
      ? nicheMatches
      : platformMatches.length > 0
        ? platformMatches
        : entries;

    const selected = candidates.slice(0, Math.max(1, limit));

    if (selected.length === 0) {
      return '';
    }

    const formattedBlocks = selected.map((entry, idx) => {
      return `--- ${normalizedNetwork.toUpperCase()} WIN ${idx + 1} [${entry.platform.toUpperCase()} | Payout: $${entry.payout} | Conversions: ${entry.conversions}] ---
[WINNING HOOK]: "${entry.hook}"
[BODY]:
${entry.body.slice(0, 500)}
[CTA]: "${entry.callToAction}"
[AUDIENCE PAIN]: "${entry.audiencePain || 'Not specified'}"`;
    });

    return `\n\n### NETWORK-SPECIFIC WINNING PATTERNS (${normalizedNetwork.toUpperCase()}):
These hooks and structures have PROVEN conversions on the ${normalizedNetwork.toUpperCase()} network. Emulate their tone, psychological triggers, and structural patterns:

${formattedBlocks.join('\n\n')}

CRITICAL: Adapt these proven patterns to the current topic. Do NOT copy verbatim.\n`;
  }

  /**
   * Formats negative feedback entries for a specific network into an anti-example
   * prompt section. These patterns MUST NOT be emulated.
   */
  public getNegativeFeedbackExamples(
    network: string,
    platform: Platform,
    limit = 2
  ): string {
    const normalizedNetwork = network.toLowerCase().trim();
    const allEntries = this.loadNegativeFeedback();

    // Filter by network and optionally platform
    const networkEntries = allEntries.filter((e) => e.network === normalizedNetwork);

    if (networkEntries.length === 0) {
      return '';
    }

    const targetPlatform = platform.toLowerCase();
    const platformMatches = networkEntries.filter(
      (e) => e.platform.toLowerCase() === targetPlatform
    );

    const candidates = platformMatches.length > 0 ? platformMatches : networkEntries;
    const selected = candidates.slice(0, Math.max(1, limit));

    const formattedBlocks = selected.map((entry, idx) => {
      return `--- FAILED PATTERN ${idx + 1} [${entry.platform.toUpperCase()} | ${entry.clicks} clicks | 0 conversions] ---
Hook: "${entry.hook}"
Structure: "${entry.bodySnippet.slice(0, 200)}..."
Reason: ${entry.reason}`;
    });

    return `\n\n### ⚠️ ANTI-PATTERNS (DO NOT EMULATE):
The following hooks and structures have been tested on ${normalizedNetwork.toUpperCase()} and FAILED (high clicks, zero conversions).
You MUST NOT replicate these patterns, tones, or structural approaches:

${formattedBlocks.join('\n\n')}

CRITICAL: These patterns attract attention but fail to convert. Avoid similar hooks, framings, and CTA structures.\n`;
  }

  /**
   * Returns the negative click threshold used for feedback detection.
   */
  public getNegativeClickThreshold(): number {
    return this.negativeClickThreshold;
  }
}
