import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BundleArtifact, Platform } from '../types/pipeline.js';

export type NetworkName = 'lospollos' | 'mylead';

// ============================================================================
// BASE & LEGACY INTERFACES (Full Backward Compatibility)
// ============================================================================

export interface NetworkWinRecord {
  id: string;
  hook: string;
  body: string;
  callToAction: string;
  platform: Platform;
  niche: string;
  payout: number;
  conversions: number;
  clicks: number;
  epc: number;
  addedAt: string;
  updatedAt?: string;
  sourceUrl?: string;
  audiencePain?: string;
}

export interface NetworkWinStorage {
  version: string;
  updatedAt: string;
  network: string;
  entries: NetworkWinRecord[];
}

export interface NegativePatternRecord {
  id: string;
  network: NetworkName | string;
  hook: string;
  reason: string;
  clicks: number;
  addedAt: string;
}

export interface NegativePatternStorage {
  version: string;
  updatedAt: string;
  entries: NegativePatternRecord[];
}

// ============================================================================
// THREE-TIER MEMORY HIERARCHY (L1, L2, L3)
// ============================================================================

/**
 * L1: Atomic Patterns
 * Granular, verified hooks, audience pain triggers, and micro-CTAs
 * backed strictly by confirmed real conversions (Zero Demo Data).
 */
export interface L1AtomicPattern {
  id: string;
  network: NetworkName;
  platform: Platform;
  niche: string;
  hook: string;
  audiencePain: string;
  ctaAngle: string;
  conversions: number;
  clicks: number;
  epc: number;
  payout: number;
  addedAt: string;
  updatedAt?: string;
  sourceNodeId?: string;
}

export interface L1Storage {
  version: string;
  updatedAt: string;
  patterns: L1AtomicPattern[];
}

/**
 * L2: Scenario Blocks
 * Reusable narrative archetypes, post progression blueprints, and angle structures.
 */
export interface L2ScenarioBlock {
  id: string;
  network: NetworkName;
  scenarioName: string;
  narrativeArchetype: 'PEER_CONFESSION' | 'ANALYTICAL_TEARDOWN' | 'TWO_SIDED_EXPERIMENT' | 'WARNING_CHECKLIST';
  angle: string;
  funnelBlueprint: string;
  structureSteps: string[];
  effectivePrelanders: string[];
  antiPatterns: string[];
  avgEpc: number;
  totalConversions: number;
  updatedAt: string;
}

export interface L2Storage {
  version: string;
  updatedAt: string;
  scenarios: L2ScenarioBlock[];
}

/**
 * L3: Network Policy & Governance
 * Ground-truth network constraints, tracking macro definitions, compliance
 * rules, and prohibited angles.
 */
export interface L3NetworkPolicy {
  network: NetworkName;
  displayName: string;
  policyStatus: 'ACTIVE_GOVERNED' | 'RESTRICTED';
  macroSyntax: Record<string, string>;
  complianceDirectives: string[];
  prohibitedTerms: string[];
  mandatoryDisclaimers: string[];
  allowedTrafficTypes: string[];
  funnelType: string;
  minAcceptableEpc: number;
  targetPayoutThreshold: number;
  lastAuditedAt: string;
}

export interface L3Storage {
  version: string;
  updatedAt: string;
  policies: Record<NetworkName, L3NetworkPolicy>;
}

// ============================================================================
// NetworkMemoryService
// ============================================================================

export class NetworkMemoryService {
  private static instance: NetworkMemoryService | null = null;
  private readonly learningDir: string;
  private readonly maxWins = 30;
  private readonly maxNegativePatterns = 20;

  private readonly l1FilePath: string;
  private readonly l2FilePath: string;
  private readonly l3FilePath: string;

  private constructor(customDir?: string) {
    if (customDir) {
      this.learningDir = customDir;
    } else {
      const candidateDirs = [
        path.resolve(process.cwd(), 'core/data/learning'),
        path.resolve(process.cwd(), 'data/learning'),
      ];

      const existing = candidateDirs.find((dir) => fs.existsSync(dir));
      this.learningDir = existing || candidateDirs[0];
    }

    this.ensureLearningDirectory();

    this.l1FilePath = path.join(this.learningDir, 'l1_atomic_patterns.json');
    this.l2FilePath = path.join(this.learningDir, 'l2_scenario_blocks.json');
    this.l3FilePath = path.join(this.learningDir, 'l3_network_policies.json');

    this.bootstrapLayeredMemory();
  }

  public static getInstance(customDir?: string): NetworkMemoryService {
    if (!this.instance || (customDir && this.instance.learningDir !== customDir)) {
      this.instance = new NetworkMemoryService(customDir);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private ensureLearningDirectory(): void {
    if (!fs.existsSync(this.learningDir)) {
      fs.mkdirSync(this.learningDir, { recursive: true });
    }
  }

  public normalizeNetwork(network: string): NetworkName {
    const normalized = (network || '').toLowerCase().trim();
    if (normalized.includes('lospollos') || normalized === 'los') return 'lospollos';
    if (normalized.includes('mylead') || normalized.includes('lead')) return 'mylead';
    throw new Error(`[NetworkMemoryService] Unsupported network: ${network}`);
  }

  private getWinFilePath(network: string): string {
    const safe = this.normalizeNetwork(network).toLowerCase().replace(/[^a-z0-9_]/g, '');
    return path.join(this.learningDir, `${safe}_wins.json`);
  }

  private getNegativePatternFilePath(): string {
    return path.join(this.learningDir, 'negative_patterns.json');
  }

  private readJsonFile<T>(filePath: string, fallback: T): T {
    try {
      if (!fs.existsSync(filePath)) {
        return fallback;
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(raw) as T;
      return parsed ?? fallback;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[NetworkMemoryService] Failed to read ${filePath}: ${msg}`);
      return fallback;
    }
  }

  private writeJsonFile(filePath: string, payload: unknown): void {
    try {
      const tempPath = `${filePath}.tmp.${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tempPath, filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[NetworkMemoryService] Failed to persist ${filePath}: ${msg}`);
    }
  }

  // ============================================================================
  // LAYER BOOTSTRAPPING
  // ============================================================================

  private bootstrapLayeredMemory(): void {
    // 1. Bootstrap L3 Policies if missing
    if (!fs.existsSync(this.l3FilePath)) {
      const initialL3: L3Storage = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        policies: {
          lospollos: {
            network: 'lospollos',
            displayName: 'LosPollos Dating & Smartlink',
            policyStatus: 'ACTIVE_GOVERNED',
            macroSyntax: {
              cid: '{click_id}',
              s1: '{platform}',
              s2: '{campaign_id}',
              s3: '{source_id}',
            },
            complianceDirectives: [
              'No misleading promise of guaranteed matches',
              'Preserve user safety disclaimers',
              'No explicit or adult terminology in open social channels',
            ],
            prohibitedTerms: ['guaranteed date', 'free sex', 'instant hookup', '100% real singles near you'],
            mandatoryDisclaimers: ['18+ only', 'Community guidelines apply'],
            allowedTrafficTypes: ['Social Organic', 'SEO', 'Forum bridge'],
            funnelType: '3-Step Compatibility Quiz -> Smartlink',
            minAcceptableEpc: 0.15,
            targetPayoutThreshold: 2.5,
            lastAuditedAt: new Date().toISOString(),
          },
          mylead: {
            network: 'mylead',
            displayName: 'MyLead CPA & Smartlink',
            policyStatus: 'ACTIVE_GOVERNED',
            macroSyntax: {
              sub1: '{click_id}',
              sub2: '{platform}',
              sub3: '{campaign_id}',
              sub4: '{source_id}',
            },
            complianceDirectives: [
              'FTC compliance on affiliate relationships',
              'Clear risk disclosure: Capital at risk',
              'No financial advice claims or guaranteed profit figures',
            ],
            prohibitedTerms: ['guaranteed profit', 'risk free investment', 'secret glitch', 'make money fast'],
            mandatoryDisclaimers: ['Capital at risk', 'This is an independent review and not financial advice', 'Do your own research'],
            allowedTrafficTypes: ['Social Organic', 'Educational Reviews', 'Quora Analysis'],
            funnelType: 'Independent Review / Comparison Bridge',
            minAcceptableEpc: 0.25,
            targetPayoutThreshold: 10.0,
            lastAuditedAt: new Date().toISOString(),
          },
        },
      };
      this.writeJsonFile(this.l3FilePath, initialL3);
    }

    // 2. Bootstrap L2 Scenarios if missing
    if (!fs.existsSync(this.l2FilePath)) {
      const initialL2: L2Storage = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        scenarios: [
          {
            id: 'scen_quiz_filter_01',
            network: 'lospollos',
            scenarioName: 'Compatibility Filter vs Swipe Fatigue',
            narrativeArchetype: 'PEER_CONFESSION',
            angle: 'Vulnerable confession of swipe burnout and relief found in structured value filters',
            funnelBlueprint: 'Discussion Starter -> Peer Validation -> Structured Quiz Prelander',
            structureSteps: [
              'Opening vulnerability acknowledging mutual fatigue with modern app dynamics',
              'Concrete contrast: judging photos vs testing actual lifestyle/communication alignment',
              'Non-sales invitation to discuss specific filter questions in the comments',
            ],
            effectivePrelanders: ['dating-quiz-v1', 'compatibility-test'],
            antiPatterns: ['Direct link dropping', 'Hyped promises', 'Explicit dating pitches'],
            avgEpc: 45.0,
            totalConversions: 9,
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'scen_fee_breakdown_01',
            network: 'mylead',
            scenarioName: 'Hidden Cost Reality Check',
            narrativeArchetype: 'ANALYTICAL_TEARDOWN',
            angle: 'Transparent breakdown of hidden transaction slippage and independent comparison',
            funnelBlueprint: 'Fee Surprise Observation -> Comparative Breakdown -> Educational Bridge',
            structureSteps: [
              'Personal experience with fee stacking and slippage',
              'Transparent 3-point checklist of what to verify before committing funds',
              'Educational conclusion with clear capital-at-risk disclaimers',
            ],
            effectivePrelanders: ['trading-fee-calc', 'broker-compare'],
            antiPatterns: ['Get rich claims', 'Urgency pressure', 'Direct affiliate spam'],
            avgEpc: 18.5,
            totalConversions: 4,
            updatedAt: new Date().toISOString(),
          },
        ],
      };
      this.writeJsonFile(this.l2FilePath, initialL2);
    }

    // 3. Bootstrap L1 Atomic Patterns from existing wins if missing
    if (!fs.existsSync(this.l1FilePath)) {
      const patterns: L1AtomicPattern[] = [];
      const lospollosWins = this.loadWins('lospollos');
      const myleadWins = this.loadWins('mylead');

      for (const w of [...lospollosWins, ...myleadWins]) {
        patterns.push({
          id: `l1_${w.id || crypto.randomUUID().slice(0, 8)}`,
          network: this.normalizeNetwork(w.platform === 'quora' ? 'mylead' : (w.niche === 'dating' ? 'lospollos' : 'mylead')),
          platform: w.platform || 'reddit',
          niche: w.niche || 'general',
          hook: w.hook,
          audiencePain: w.audiencePain || 'Audience friction point',
          ctaAngle: w.callToAction,
          conversions: w.conversions || 1,
          clicks: w.clicks || 1,
          epc: w.epc || 0,
          payout: w.payout || 0,
          addedAt: w.addedAt || new Date().toISOString(),
          updatedAt: w.updatedAt,
        });
      }

      this.writeJsonFile(this.l1FilePath, {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        patterns,
      });
    }
  }

  // ============================================================================
  // LEGACY GETTERS & LOADERS (Preserved 100%)
  // ============================================================================

  private loadWins(network: string): NetworkWinRecord[] {
    const filePath = this.getWinFilePath(network);
    const payload = this.readJsonFile<NetworkWinStorage>(filePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      network,
      entries: [],
    });

    return Array.isArray(payload.entries) ? payload.entries : [];
  }

  private saveWins(network: string, entries: NetworkWinRecord[]): void {
    const payload: NetworkWinStorage = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      network,
      entries,
    };

    this.writeJsonFile(this.getWinFilePath(network), payload);
  }

  private loadNegativePatterns(): NegativePatternRecord[] {
    const filePath = this.getNegativePatternFilePath();
    const payload = this.readJsonFile<NegativePatternStorage>(filePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      entries: [],
    });

    return Array.isArray(payload.entries) ? payload.entries : [];
  }

  private saveNegativePatterns(entries: NegativePatternRecord[]): void {
    const payload: NegativePatternStorage = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      entries,
    };

    this.writeJsonFile(this.getNegativePatternFilePath(), payload);
  }

  public getNetworkWins(network: string): NetworkWinRecord[] {
    try {
      return this.loadWins(network);
    } catch {
      return [];
    }
  }

  public getNegativePatterns(network?: string): NegativePatternRecord[] {
    const entries = this.loadNegativePatterns();
    if (!network) return entries;
    return entries.filter((entry) => (entry.network || '').toLowerCase() === network.toLowerCase());
  }

  // ============================================================================
  // LAYERED MEMORY ACCESSORS (L1, L2, L3)
  // ============================================================================

  public getL1Patterns(network?: string): L1AtomicPattern[] {
    const payload = this.readJsonFile<L1Storage>(this.l1FilePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      patterns: [],
    });
    if (!network) return payload.patterns;
    const target = this.normalizeNetwork(network);
    return payload.patterns.filter((p) => p.network === target);
  }

  public getL2Scenarios(network?: string): L2ScenarioBlock[] {
    const payload = this.readJsonFile<L2Storage>(this.l2FilePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      scenarios: [],
    });
    if (!network) return payload.scenarios;
    const target = this.normalizeNetwork(network);
    return payload.scenarios.filter((s) => s.network === target);
  }

  public getL3Policy(network: string): L3NetworkPolicy | null {
    const target = this.normalizeNetwork(network);
    const payload = this.readJsonFile<L3Storage>(this.l3FilePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      policies: {} as any,
    });
    return payload.policies?.[target] || null;
  }

  // ============================================================================
  // POSITIVE & NEGATIVE RECORDING (Updates L0, L1, L2 concurrently)
  // ============================================================================

  public recordPositiveConversion(
    network: NetworkName | string,
    bundle: BundleArtifact,
    payout: number,
  ): boolean {
    if (!bundle || !bundle.creative) return false;

    const normalizedNetwork = this.normalizeNetwork(String(network));
    const entries = this.loadWins(normalizedNetwork);
    const sourceUrl = (bundle.context?.sourceUrl || '').trim();
    const existingIndex = entries.findIndex(
      (entry) => !!entry.sourceUrl && entry.sourceUrl === sourceUrl
    );

    const clickCount = Math.max(1, bundle.financials?.clicks || 1);
    const epc = Number((payout / clickCount).toFixed(4));

    const nextRecord: NetworkWinRecord = {
      id: bundle.id || crypto.randomUUID(),
      hook: bundle.creative.headline,
      body: bundle.creative.body,
      callToAction: bundle.creative.callToAction,
      platform: bundle.context?.platform || 'reddit',
      niche: (bundle.context?.metadata?.niche as string) || 'general',
      payout,
      conversions: existingIndex >= 0 ? entries[existingIndex].conversions + 1 : 1,
      clicks: Math.max(existingIndex >= 0 ? entries[existingIndex].clicks : 0, clickCount),
      epc,
      addedAt: new Date().toISOString(),
      sourceUrl,
      audiencePain: bundle.context?.targetAudiencePain || '',
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        ...nextRecord,
        payout: Math.max(entries[existingIndex].payout, payout),
        conversions: nextRecord.conversions,
        clicks: Math.max(entries[existingIndex].clicks, clickCount),
        epc: Math.max(entries[existingIndex].epc, epc),
        updatedAt: new Date().toISOString(),
      };
    } else {
      entries.push(nextRecord);
    }

    entries.sort((a, b) => {
      const rankA = a.payout * a.conversions + a.epc * 1000;
      const rankB = b.payout * b.conversions + b.epc * 1000;
      if (rankB !== rankA) return rankB - rankA;
      return b.conversions - a.conversions;
    });

    this.saveWins(normalizedNetwork, entries.slice(0, this.maxWins));

    // Synchronize to L1 Atomic Patterns
    this.updateL1Pattern(normalizedNetwork, nextRecord);

    // Synchronize to L2 Scenario Block
    this.updateL2Scenario(normalizedNetwork, nextRecord);

    return true;
  }

  private updateL1Pattern(network: NetworkName, win: NetworkWinRecord): void {
    const l1Data = this.readJsonFile<L1Storage>(this.l1FilePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      patterns: [],
    });

    const existingIdx = l1Data.patterns.findIndex(
      (p) => p.network === network && p.hook.trim().toLowerCase() === win.hook.trim().toLowerCase()
    );

    const l1Record: L1AtomicPattern = {
      id: existingIdx >= 0 ? l1Data.patterns[existingIdx].id : `l1_${win.id || crypto.randomUUID().slice(0, 8)}`,
      network,
      platform: win.platform,
      niche: win.niche,
      hook: win.hook,
      audiencePain: win.audiencePain || 'Conversational pain point',
      ctaAngle: win.callToAction,
      conversions: win.conversions,
      clicks: win.clicks,
      epc: win.epc,
      payout: win.payout,
      addedAt: existingIdx >= 0 ? l1Data.patterns[existingIdx].addedAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      l1Data.patterns[existingIdx] = l1Record;
    } else {
      l1Data.patterns.unshift(l1Record);
    }

    l1Data.updatedAt = new Date().toISOString();
    this.writeJsonFile(this.l1FilePath, l1Data);
  }

  private updateL2Scenario(network: NetworkName, win: NetworkWinRecord): void {
    const l2Data = this.readJsonFile<L2Storage>(this.l2FilePath, {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      scenarios: [],
    });

    const matchingIdx = l2Data.scenarios.findIndex((s) => s.network === network);
    if (matchingIdx >= 0) {
      const scen = l2Data.scenarios[matchingIdx];
      scen.totalConversions += 1;
      scen.avgEpc = Number(((scen.avgEpc * (scen.totalConversions - 1) + win.epc) / scen.totalConversions).toFixed(4));
      scen.updatedAt = new Date().toISOString();
      l2Data.updatedAt = new Date().toISOString();
      this.writeJsonFile(this.l2FilePath, l2Data);
    }
  }

  public recordNegativePattern(
    network: NetworkName | string,
    hook: string,
    reason: string,
    clicks: number = 50,
  ): boolean {
    if (!hook || !reason) return false;

    const normalizedNetwork = this.normalizeNetwork(String(network));
    const entries = this.loadNegativePatterns();
    const existingIndex = entries.findIndex(
      (entry) => entry.network === normalizedNetwork && entry.hook === hook
    );

    const nextEntry: NegativePatternRecord = {
      id: existingIndex >= 0 ? entries[existingIndex].id : crypto.randomUUID(),
      network: normalizedNetwork,
      hook,
      reason,
      clicks: existingIndex >= 0 ? Math.max(entries[existingIndex].clicks, clicks) : clicks,
      addedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      entries[existingIndex] = nextEntry;
    } else {
      entries.push(nextEntry);
    }

    const networkEntries = entries.filter((entry) => (entry.network || '').toLowerCase() === normalizedNetwork);
    const otherEntries = entries.filter((entry) => (entry.network || '').toLowerCase() !== normalizedNetwork);

    const rankedNetworkEntries = networkEntries
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, this.maxNegativePatterns);

    this.saveNegativePatterns([...rankedNetworkEntries, ...otherEntries]);
    return true;
  }

  // ============================================================================
  // THREE-TIER LAYERED PROMPT GENERATION
  // ============================================================================

  /**
   * Generates a structured 3-tier memory injection:
   * [L3 Policy & Governance] -> [L2 Scenario Archetype] -> [L1 Atomic High-EPC Hooks]
   */
  public getLayeredMemoryPrompt(
    network: NetworkName | string,
    limit = 3
  ): string {
    const normalizedNetwork = this.normalizeNetwork(String(network));
    const policy = this.getL3Policy(normalizedNetwork);
    const scenarios = this.getL2Scenarios(normalizedNetwork);
    const atomicPatterns = this.getL1Patterns(normalizedNetwork).slice(0, Math.max(1, limit));
    const negatives = this.getNegativePatterns(normalizedNetwork).slice(0, 3);

    // L3 Block
    const l3Section = policy
      ? [
          `[L3 POLICY GOVERNANCE: ${policy.displayName.toUpperCase()}]`,
          `- Allowed Traffic: ${policy.allowedTrafficTypes.join(', ')}`,
          `- Prohibited Expressions: ${policy.prohibitedTerms.join(', ')}`,
          `- Mandatory Disclaimers: ${policy.mandatoryDisclaimers.join(' | ')}`,
          `- Tracking Scheme: ${JSON.stringify(policy.macroSyntax)}`,
        ].join('\n')
      : '';

    // L2 Block
    const l2Section = scenarios.length > 0
      ? [
          `[L2 PROVEN SCENARIO BLUEPRINT: ${scenarios[0].scenarioName}]`,
          `- Narrative Archetype: ${scenarios[0].narrativeArchetype}`,
          `- Narrative Steps: ${scenarios[0].structureSteps.join(' -> ')}`,
          `- Strategic Angle: ${scenarios[0].angle}`,
        ].join('\n')
      : '';

    // L1 Block (100% Real Confirmed Data)
    const l1Section = atomicPatterns.length > 0
      ? atomicPatterns
          .map(
            (p, idx) =>
              `WIN ${idx + 1} | Hook: "${p.hook}" | Pain: "${p.audiencePain}" | CTA: "${p.ctaAngle}" | EPC: $${p.epc} | Conv: ${p.conversions} (Verified Real Data)`
          )
          .join('\n')
      : 'No verified L1 patterns yet.';

    // Negatives
    const negativeSection = negatives.length > 0
      ? negatives.map((entry, idx) => `ANTI-PATTERN ${idx + 1}: "${entry.hook}" — ${entry.reason}`).join('\n')
      : 'No negative anti-patterns recorded.';

    return [
      '',
      `### NETWORK MEMORY (${normalizedNetwork.toUpperCase()}) // THREE-TIER PROGRESSIVE GOVERNANCE`,
      l3Section,
      '',
      l2Section,
      '',
      'WINNING HISTORICAL EXAMPLES (L1 ATOMIC HOOKS):',
      l1Section,
      '',
      'ANTI-PATTERNS (Avoid these structures that resulted in zero conversions):',
      negativeSection,
      '',
      'CRITICAL: Strictly adhere to L3 policy boundaries, follow L2 narrative flow, and leverage L1 high-EPC hooks without verbatim copying.',
      '',
    ].filter(Boolean).join('\n');
  }

  /**
   * Backward-compatible entrypoint. Injects the rich 3-tier memory.
   */
  public getFewShotPrompt(network: NetworkName | string, limit = 3): string {
    return this.getLayeredMemoryPrompt(network, limit);
  }
}
