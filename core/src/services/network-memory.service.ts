import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { BundleArtifact, Platform } from '../types/pipeline.js';

export type NetworkName = 'lospollos' | 'mylead';

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

export class NetworkMemoryService {
  private static instance: NetworkMemoryService | null = null;
  private readonly learningDir: string;
  private readonly maxWins = 30;
  private readonly maxNegativePatterns = 20;

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

  private normalizeNetwork(network: string): NetworkName {
    const normalized = (network || '').toLowerCase().trim();
    if (normalized === 'lospollos') return 'lospollos';
    if (normalized === 'mylead') return 'mylead';
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
      const tempPath = `${filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf8');
      fs.renameSync(tempPath, filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[NetworkMemoryService] Failed to persist ${filePath}: ${msg}`);
    }
  }

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
      niche: bundle.context?.metadata?.niche as string || 'general',
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
    return true;
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

  public getFewShotPrompt(network: NetworkName | string, limit = 3): string {
    const normalizedNetwork = this.normalizeNetwork(String(network));
    const wins = this.getNetworkWins(normalizedNetwork).slice(0, Math.max(1, limit));
    const negatives = this.getNegativePatterns(normalizedNetwork).slice(0, 3);

    if (wins.length === 0 && negatives.length === 0) {
      return '';
    }

    const winSection = wins.length > 0
      ? wins.map((entry, idx) => {
          return `WIN ${idx + 1} | Hook: "${entry.hook}" | CTA: "${entry.callToAction}" | Body: "${entry.body.slice(0, 220)}" | Payout: $${entry.payout} | Conversions: ${entry.conversions} | EPC: $${entry.epc}`;
        }).join('\n')
      : 'No successful historical wins recorded yet for this network.';

    const negativeSection = negatives.length > 0
      ? negatives.map((entry, idx) => `ANTI-PATTERN ${idx + 1}: "${entry.hook}" — ${entry.reason}`).join('\n')
      : 'No negative patterns recorded yet for this network.';

    return `\n\n### NETWORK MEMORY (${normalizedNetwork.toUpperCase()})\nWINNING HISTORICAL EXAMPLES:\n${winSection}\n\nANTI-PATTERNS (Avoid these structures that resulted in zero conversions):\n${negativeSection}\nCRITICAL: Use the winning patterns as soft guidance while avoiding all listed anti-patterns and strongly preserving platform-native authenticity.\n`;
  }
}
