import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { LlmGatewayService } from './llm-gateway.service.js';
import { GoldCatalogService } from './gold-catalog.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';
import { FinancialTelemetryMatcher } from '../server/telemetry-matcher.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface WeeklyPerformanceStats {
  removalRate: number; // e.g. 0.08 = 8%
  avgComplianceScore: number; // 0..100
  epc: number; // earnings per click ($)
  cr: number; // conversion rate (%)
  avgUpvotes: number;
  totalPosts: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
}

export interface CalibrationResult {
  timestamp: string;
  actionTaken: 'STRICT_CONVERSATIONAL_ALIGNMENT' | 'CREATIVE_EXPANSION' | 'MAINTAIN_OPTIMAL';
  reason: string;
  previousTemperature: number;
  recommendedTemperature: number;
  activeWinningHooks: string[];
  blacklistedPhrasingStructures: string[];
  injectedConstraintsCount: number;
  updatedCopywriterPrompt: string;
  statsEvaluated: WeeklyPerformanceStats;
}

export interface StrategyMemoryData {
  version: string;
  lastCalibratedAt: string;
  removalRate: number;
  avgComplianceScore: number;
  currentEpc: number;
  recommendedTemperature: number;
  calibrationAction: string;
  activeWinningHooks: string[];
  blacklistedPhrasingStructures: string[];
  calibratedSystemPrompt: string;
  history: Array<{
    timestamp: string;
    action: string;
    removalRate: number;
    epc: number;
    temperature: number;
  }>;
}

export class PromptDriftCalibrator {
  private static instance: PromptDriftCalibrator | null = null;
  private strategyMemoryPath: string;
  private negativePatternsPath: string;
  private winningPatternsPath: string;

  private constructor(options: { strategyMemoryPath?: string; negativePatternsPath?: string; winningPatternsPath?: string } = {}) {
    const defaultMemoryCandidates = [
      path.resolve(process.cwd(), 'core/data/learning/strategy_memory.json'),
      path.resolve(process.cwd(), 'data/learning/strategy_memory.json'),
      path.resolve(process.cwd(), 'src/data/learning/strategy_memory.json'),
    ];

    const found = defaultMemoryCandidates.find((p) => fs.existsSync(p));
    this.strategyMemoryPath = options.strategyMemoryPath || found || defaultMemoryCandidates[0];
    this.negativePatternsPath = options.negativePatternsPath || path.resolve(process.cwd(), 'data/learning/negative_patterns.json');
    this.winningPatternsPath = options.winningPatternsPath || path.resolve(process.cwd(), 'core/data/learning/winning_patterns.json');

    const memDir = path.dirname(this.strategyMemoryPath);
    if (!fs.existsSync(memDir)) {
      try {
        fs.mkdirSync(memDir, { recursive: true });
      } catch {}
    }
  }

  public static getInstance(options?: { strategyMemoryPath?: string; negativePatternsPath?: string; winningPatternsPath?: string }): PromptDriftCalibrator {
    if (!this.instance) {
      this.instance = new PromptDriftCalibrator(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Loads current strategy memory from disk or default
   */
  public getStrategyMemory(): StrategyMemoryData {
    if (fs.existsSync(this.strategyMemoryPath)) {
      try {
        const raw = fs.readFileSync(this.strategyMemoryPath, 'utf8');
        return JSON.parse(raw);
      } catch {}
    }

    return {
      version: '2.0.0',
      lastCalibratedAt: new Date().toISOString(),
      removalRate: 0.0,
      avgComplianceScore: 95.0,
      currentEpc: 0.0,
      recommendedTemperature: 0.4,
      calibrationAction: 'INITIAL_BASELINE',
      activeWinningHooks: [
        'Tested this quantitative configuration across several test nodes last week...',
        'From an infrastructure and algorithmic latency standpoint, here is the breakdown...',
        'When looking at risk-reversal models on high-volatility pairs, the key bottleneck is...',
      ],
      blacklistedPhrasingStructures: [
        'guaranteed profit',
        '100% win rate',
        'get rich quick',
        'free money instant',
        'act now before it is banned',
      ],
      calibratedSystemPrompt: '',
      history: [],
    };
  }

  /**
   * Ingests and aggregates live stats from telemetry, queue, and health monitor
   */
  public ingestWeeklyStats(customStats?: Partial<WeeklyPerformanceStats>): WeeklyPerformanceStats {
    if (customStats && customStats.removalRate !== undefined) {
      return {
        removalRate: customStats.removalRate,
        avgComplianceScore: customStats.avgComplianceScore ?? 95,
        epc: customStats.epc ?? 2.5,
        cr: customStats.cr ?? 4.0,
        avgUpvotes: customStats.avgUpvotes ?? 8,
        totalPosts: customStats.totalPosts ?? 50,
        totalClicks: customStats.totalClicks ?? 200,
        totalConversions: customStats.totalConversions ?? 8,
        totalRevenue: customStats.totalRevenue ?? 500,
      };
    }

    const repo = ContentQueueRepository.getInstance();
    const dispatched = repo.listDispatched(Date.now() - 7 * 24 * 3600 * 1000);
    const totalPosts = dispatched.length;

    let removedPosts = 0;
    let totalScore = 0;
    let totalUpvotes = 0;

    for (const it of dispatched) {
      if (it.health_status === 'SHADOWBANNED_OR_REMOVED') {
        removedPosts++;
      }
      totalScore += (100 - (it.risk_score || 0) * 10);
      totalUpvotes += (it.live_upvotes || 0);
    }

    const removalRate = totalPosts > 0 ? removedPosts / totalPosts : 0.0;
    const avgComplianceScore = totalPosts > 0 ? totalScore / totalPosts : 95.0;
    const avgUpvotes = totalPosts > 0 ? totalUpvotes / totalPosts : 0;

    // Financial telemetry
    const matcher = FinancialTelemetryMatcher.getInstance();
    const summary = matcher.getTelemetrySummary();
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    for (const c of Object.values(summary.campaigns)) {
      totalClicks += c.clicks;
      totalConversions += c.conversions;
      totalRevenue += c.revenue;
    }

    const epc = totalClicks > 0 ? totalRevenue / totalClicks : 0.0;
    const cr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0.0;

    return {
      removalRate,
      avgComplianceScore,
      epc,
      cr,
      avgUpvotes,
      totalPosts,
      totalClicks,
      totalConversions,
      totalRevenue,
    };
  }

  /**
   * Pulls blacklisted phrases from negative_patterns.json
   */
  private loadBlacklistedPhrases(): string[] {
    const base = [
      'guaranteed profit',
      '100% win rate',
      'get rich quick',
      'free money instant',
      'buy now limited time',
    ];

    if (fs.existsSync(this.negativePatternsPath)) {
      try {
        const list = JSON.parse(fs.readFileSync(this.negativePatternsPath, 'utf8'));
        if (Array.isArray(list)) {
          for (const item of list) {
            if (item.bannedKeywords && Array.isArray(item.bannedKeywords)) {
              for (const kw of item.bannedKeywords) {
                if (kw && !base.includes(kw)) base.push(kw);
              }
            }
          }
        }
      } catch {}
    }

    return Array.from(new Set(base));
  }

  /**
   * Pulls winning hooks from Gold Catalog & winning_patterns.json
   */
  private loadWinningHooks(): string[] {
    const hooks: string[] = [];

    const goldCatalog = GoldCatalogService.getInstance();
    const entries = goldCatalog.getEntries();
    for (const e of entries.slice(0, 5)) {
      if (e.approvedCreative?.headline) {
        hooks.push(e.approvedCreative.headline);
      }
    }

    if (hooks.length === 0) {
      hooks.push(
        'Tested this quantitative configuration across several test nodes last week...',
        'From an infrastructure and algorithmic latency standpoint, here is the breakdown...',
        'When looking at risk-reversal models on high-volatility pairs, the key bottleneck is...'
      );
    }

    return hooks;
  }

  /**
   * Performs dynamic prompt drift calibration across AI agents
   */
  public async calibrate(customStats?: Partial<WeeklyPerformanceStats>): Promise<CalibrationResult> {
    const stats = this.ingestWeeklyStats(customStats);
    const memory = this.getStrategyMemory();
    const prevTemp = memory.recommendedTemperature || 0.4;
    const gateway = LlmGatewayService.getInstance();
    gateway.loadRegistry();

    const copywriterAgent = gateway.getAgent('agent-context-copywriter-02');
    const blacklistedPhrases = this.loadBlacklistedPhrases();
    const activeWinningHooks = this.loadWinningHooks();

    let actionTaken: CalibrationResult['actionTaken'] = 'MAINTAIN_OPTIMAL';
    let reason = '';
    let newTemp = 0.4;
    let calibratedPrompt = copywriterAgent?.systemPrompt || '';

    // =====================================================================
    // CALIBRATION LOGIC
    // =====================================================================

    // CONDITION 1: Removal Rate > 5% (0.05) -> Stricter Anti-Detect & Lower Temp
    if (stats.removalRate > 0.05) {
      actionTaken = 'STRICT_CONVERSATIONAL_ALIGNMENT';
      newTemp = 0.25;
      reason = `Elevated post removal rate (${(stats.removalRate * 100).toFixed(1)}% > 5.0%). Injected strict anti-detect conversational constraints and lowered temperature to 0.25.`;

      const strictConstraints = `
STRICT ANTI-DETECT & STEALTH CONSTRAINTS (CALIBRATION ACTIVE):
- Removal rate threshold exceeded (${(stats.removalRate * 100).toFixed(1)}%).
- NEVER make direct claims of profit, return on investment, or commercial guarantees.
- FORBIDDEN PHRASING STRUCTURES: ${blacklistedPhrases.slice(0, 8).join(', ')}.
- ALWAYS frame the content as technical peer discussion, personal testing retrospectives, or educational breakdown.
- Maintain subtle conversational closing adhering strictly to Reddit Rule 9 and community norms.
      `.trim();

      calibratedPrompt = `Elite organic social copywriter and anti-detect engineer. Generates deeply relatable, conversational, peer-to-peer posts.\n\n${strictConstraints}`;
    }
    // CONDITION 2: Over-Compliance with EPC Drop (Pass rate 100% / high compliance, but low EPC < $1.50)
    else if (stats.avgComplianceScore >= 95.0 && (stats.epc < 1.50 || (stats.totalClicks > 50 && stats.epc === 0))) {
      actionTaken = 'CREATIVE_EXPANSION';
      newTemp = 0.65;
      reason = `High compliance (${stats.avgComplianceScore.toFixed(1)}/100) but low EPC ($${stats.epc.toFixed(2)}). Increased creative variance (temperature 0.65) and injected top-converting Gold Catalog angles.`;

      const creativeExpansion = `
CREATIVE EXPANSION & HIGH-CONVERTING ANGLES (CALIBRATION ACTIVE):
- High compliance detected. Expand narrative curiosity gaps and contrastive hooks to boost CTR and EPC.
- TOP CONVERTING GOLD PATTERNS:
${activeWinningHooks.map((h, i) => `  ${i + 1}. "${h}"`).join('\n')}
- Use authentic storytelling, contrarian proof, and reduced friction transitions.
      `.trim();

      calibratedPrompt = `Elite organic social copywriter and conversion growth engineer.\n\n${creativeExpansion}`;
    }
    // CONDITION 3: Optimal Performance
    else {
      actionTaken = 'MAINTAIN_OPTIMAL';
      newTemp = 0.40;
      reason = `Healthy metrics: Removal Rate ${(stats.removalRate * 100).toFixed(1)}% <= 5%, EPC $${stats.epc.toFixed(2)}, Compliance ${stats.avgComplianceScore.toFixed(1)}. Maintaining balanced operational temperature.`;
    }

    // Update Agent in Registry
    if (copywriterAgent) {
      gateway.updateAgent('agent-context-copywriter-02', {
        systemPrompt: calibratedPrompt,
      });
    }

    // Persist to Strategy Memory
    const timestamp = new Date().toISOString();
    const updatedMemory: StrategyMemoryData = {
      version: '2.1.0',
      lastCalibratedAt: timestamp,
      removalRate: stats.removalRate,
      avgComplianceScore: stats.avgComplianceScore,
      currentEpc: stats.epc,
      recommendedTemperature: newTemp,
      calibrationAction: actionTaken,
      activeWinningHooks,
      blacklistedPhrasingStructures: blacklistedPhrases,
      calibratedSystemPrompt: calibratedPrompt,
      history: [
        {
          timestamp,
          action: actionTaken,
          removalRate: stats.removalRate,
          epc: stats.epc,
          temperature: newTemp,
        },
        ...(memory.history || []).slice(0, 19),
      ],
    };

    try {
      fs.writeFileSync(this.strategyMemoryPath, JSON.stringify(updatedMemory, null, 2), 'utf8');
      console.log(`\n🎯 [PromptDriftCalibrator] Calibrated strategy memory persisted -> ${this.strategyMemoryPath}`);
    } catch {}

    return {
      timestamp,
      actionTaken,
      reason,
      previousTemperature: prevTemp,
      recommendedTemperature: newTemp,
      activeWinningHooks,
      blacklistedPhrasingStructures: blacklistedPhrases,
      injectedConstraintsCount: blacklistedPhrases.length,
      updatedCopywriterPrompt: calibratedPrompt,
      statsEvaluated: stats,
    };
  }
}

export const promptDriftCalibrator = PromptDriftCalibrator.getInstance();

// Standalone CLI Runner Execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('prompt-drift-calibrator.service.ts') ||
    process.argv[1].endsWith('prompt-drift-calibrator.service.js'))
) {
  console.log('\n🚀 [CLI] Running Prompt Drift & AI Alignment Calibration Loop...');
  const calibrator = PromptDriftCalibrator.getInstance();

  calibrator
    .calibrate()
    .then((res) => {
      console.log('\n================================================================');
      console.log(`🎯 Calibration Result: [${res.actionTaken}] Temp: ${res.recommendedTemperature}`);
      console.log(`📝 Reason: ${res.reason}`);
      console.log('================================================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ [Calibration Error]', err);
      process.exit(1);
    });
}
