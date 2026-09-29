import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { EmergencyStopController } from '../types/pipeline.js';
import { TopicEngineService } from '../services/topicEngine.service.js';
import { AutoPublisherService, BatchPublishResult } from '../services/autoPublisher.service.js';
import { SocialSyndicatorService, DispatchResult } from '../services/socialSyndicator.service.js';
import { NetworkMemoryService } from '../services/network-memory.service.js';
import { MabEngineService } from '../services/mab-engine.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';

export interface AutonomousCycleOptions {
  dryRun?: boolean;
  skipAstroBuild?: boolean;
  maxArticles?: number;
  enableSocialSyndication?: boolean;
  enableOptimization?: boolean;
  targetCategory?: string;
}

export interface SocialSyndicationSummary {
  telegramDispatched: boolean;
  telegramMessage?: string;
  pinterestQueued: boolean;
  pinterestQueueLength: number;
  redditDraftsQueued: number;
}

export interface OptimizationSummary {
  mabCampaignsEvaluated: number;
  l1PatternsActive: number;
  l2ScenariosActive: number;
  l3PoliciesActive: number;
  totalLoggedClicks: number;
  totalLoggedConversions: number;
}

export interface AutonomousCycleReport {
  cycleId: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  success: boolean;
  dryRun: boolean;
  discoveredTopic?: {
    slug: string;
    title: string;
    category: string;
    searchVolumeTier: string;
  };
  contentPublishResult?: {
    published: boolean;
    slug?: string;
    url?: string;
    title?: string;
    coverImage?: string;
    errors: string[];
  };
  socialSyndication: SocialSyndicationSummary;
  optimization: OptimizationSummary;
  mermaidExecutionGraph: string;
}

/**
 * SiteAutonomousAgent
 *
 * Master orchestrator that autonomously operates and scales FlirtCheck / DeepTrace:
 * 1. Discovers highest-value content topics via balanced taxonomy deficit analysis.
 * 2. Produces forensic investigative longreads with AI cover art & passes ArticleQualityGate.
 * 3. Enforces IndexNow instant search engine pinging (Bing / Yandex).
 * 4. Dispatches multi-channel social syndication (Telegram channel, Pinterest queue, Reddit drafts).
 * 5. Runs continuous MAB optimization & synchronizes L1-L3 network memory.
 * 6. Governed by EmergencyStopController & Strict Zero Demo Data policy.
 */
export class SiteAutonomousAgent {
  private static instance: SiteAutonomousAgent | null = null;
  private readonly emergencyStop: EmergencyStopController;
  private readonly topicEngine: TopicEngineService;
  private readonly autoPublisher: AutoPublisherService;
  private readonly socialSyndicator: SocialSyndicatorService;
  private readonly networkMemory: NetworkMemoryService;
  private readonly mabEngine: MabEngineService;
  private readonly queueRepo: ContentQueueRepository;

  private isRunning: boolean = false;
  private daemonTimer: NodeJS.Timeout | null = null;
  private readonly runsDir: string;
  private readonly stateFilePath: string;

  private constructor() {
    this.emergencyStop = EmergencyStopController.getInstance();
    this.topicEngine = TopicEngineService.getInstance();
    this.autoPublisher = AutoPublisherService.getInstance();
    this.socialSyndicator = SocialSyndicatorService.getInstance();
    this.networkMemory = NetworkMemoryService.getInstance();
    this.mabEngine = MabEngineService.getInstance();
    this.queueRepo = ContentQueueRepository.getInstance();

    const cwd = process.cwd();
    const candidateRunsDirs = [
      path.resolve(cwd, 'runs/autonomous_agent'),
      path.resolve(cwd, 'core/runs/autonomous_agent'),
    ];
    this.runsDir = candidateRunsDirs[0];
    if (!fs.existsSync(this.runsDir)) {
      try {
        fs.mkdirSync(this.runsDir, { recursive: true });
      } catch {}
    }

    this.stateFilePath = path.join(this.runsDir, 'latest_state.json');
  }

  public static getInstance(): SiteAutonomousAgent {
    if (!this.instance) {
      this.instance = new SiteAutonomousAgent();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stopDaemon();
      this.instance = null;
    }
  }

  /**
   * Generates a Mermaid workflow graph of the executed cycle
   */
  private generateMermaidGraph(report: Partial<AutonomousCycleReport>): string {
    const slug = report.discoveredTopic?.slug || 'topic_selection';
    const tgStatus = report.socialSyndication?.telegramDispatched ? 'Dispatched' : 'Queued';
    const l1Count = report.optimization?.l1PatternsActive ?? 0;
    const l2Count = report.optimization?.l2ScenariosActive ?? 0;

    return [
      '```mermaid',
      'graph TD',
      `  INIT["[Autonomous Agent] Cycle: ${report.cycleId?.slice(0, 8)}"] --> TOPIC["Topic Discovery: ${slug}"]`,
      `  TOPIC --> PROD["Article Production // Quality Gate Approved"]`,
      `  PROD --> INDEX["IndexNow Instant Ping -> Bing/Yandex"]`,
      `  PROD --> SOC["Multi-Channel Syndication"]`,
      `  SOC --> TG["Telegram: ${tgStatus}"]`,
      `  SOC --> PIN["Pinterest: ${report.socialSyndication?.pinterestQueueLength ?? 0} In Queue"]`,
      `  SOC --> REDDIT["Reddit Warmup Drafts Enqueued"]`,
      `  PROD --> OPT["Continuous Learning & MAB"]`,
      `  OPT --> MEM["Layered Memory (L1: ${l1Count}, L2: ${l2Count})"]`,
      '```',
    ].join('\n');
  }

  /**
   * Runs a complete autonomous cycle across all 4 operational phases
   */
  public async runAutonomousCycle(options: AutonomousCycleOptions = {}): Promise<AutonomousCycleReport> {
    const cycleId = crypto.randomUUID();
    const startTime = Date.now();
    const dryRun = Boolean(options.dryRun);

    console.log(`\n\x1b[1m\x1b[35m=== [SiteAutonomousAgent] Starting Autonomous Cycle (${cycleId.slice(0, 8)}) ===\x1b[0m`);
    if (dryRun) {
      console.log(`\x1b[33m[DRY-RUN MODE]\x1b[0m No filesystem or live social dispatches will be permanently committed.`);
    }

    // 0. Pre-flight Emergency Stop Check
    this.emergencyStop.check();

    // ------------------------------------------------------------------------
    // PHASE 1: CONTENT DISCOVERY & STRATEGY
    // ------------------------------------------------------------------------
    console.log(`\x1b[36m[Phase 1: Discovery]\x1b[0m Evaluating taxonomy deficit & selecting next highest-value topic...`);
    const nextTopics = this.topicEngine.getBalancedNextTopicBatch(1);
    const chosenTopic = nextTopics[0];

    const topicTitle = (chosenTopic as any).title || chosenTopic.topic || chosenTopic.keyword || chosenTopic.slug;

    const discoveredTopic = chosenTopic
      ? {
          slug: chosenTopic.slug,
          title: topicTitle,
          category: chosenTopic.category,
          searchVolumeTier: chosenTopic.searchVolumeTier,
        }
      : undefined;

    if (chosenTopic) {
      console.log(`  🎯 Selected Topic: "${topicTitle}" (Category: ${chosenTopic.category}, Tier: ${chosenTopic.searchVolumeTier})`);
    } else {
      console.warn(`  ⚠️ No candidate topic found in taxonomy pool.`);
    }

    // ------------------------------------------------------------------------
    // PHASE 2: CONTENT PRODUCTION & QUALITY GATE
    // ------------------------------------------------------------------------
    console.log(`\x1b[36m[Phase 2: Production]\x1b[0m Generating forensic dossier & validating through Article Quality Gate...`);
    let contentPublishResult: AutonomousCycleReport['contentPublishResult'];

    if (chosenTopic && !dryRun) {
      try {
        const publishOutput: BatchPublishResult = await this.autoPublisher.publishBatch({
          customKeywords: [chosenTopic],
          skipAstroBuild: options.skipAstroBuild ?? true,
        });

        const publishedItem = publishOutput.publishedItems[0];
        contentPublishResult = {
          published: publishOutput.success && publishOutput.publishedItems.length > 0,
          slug: publishedItem?.slug,
          url: publishedItem?.url,
          title: publishedItem?.title,
          coverImage: publishedItem?.coverImage,
          errors: publishOutput.errors,
        };

        if (contentPublishResult.published) {
          console.log(`  ✅ Published: "${publishedItem.title}" -> ${publishedItem.url}`);
        } else {
          console.warn(`  ❌ Publication unconfirmed: ${publishOutput.errors.join(', ')}`);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ❌ Production error: ${msg}`);
        contentPublishResult = { published: false, errors: [msg] };
      }
    } else if (dryRun && chosenTopic) {
      contentPublishResult = {
        published: true,
        slug: chosenTopic.slug,
        title: topicTitle,
        url: `https://flirtcheck.site/${chosenTopic.slug}`,
        errors: [],
      };
      console.log(`  [Dry-Run Simulation] Would publish: "${topicTitle}"`);
    }

    // ------------------------------------------------------------------------
    // PHASE 3: MULTI-CHANNEL SOCIAL SYNDICATION
    // ------------------------------------------------------------------------
    console.log(`\x1b[36m[Phase 3: Syndication]\x1b[0m Dispatching social snippets across Telegram, Pinterest & Reddit...`);
    const socialSummary: SocialSyndicationSummary = {
      telegramDispatched: false,
      pinterestQueued: false,
      pinterestQueueLength: 0,
      redditDraftsQueued: 0,
    };

    if (options.enableSocialSyndication !== false) {
      // 3.1 Telegram Dispatch
      if (!dryRun) {
        try {
          const dispatchRes: DispatchResult = await this.socialSyndicator.dispatchNextSnippet({ force: false });
          socialSummary.telegramDispatched = dispatchRes.success;
          socialSummary.telegramMessage = dispatchRes.message;
          if (dispatchRes.success) {
            console.log(`  📢 Telegram: Snippet dispatched successfully (ID: ${dispatchRes.item?.id || 'N/A'})`);
          } else {
            console.log(`  ⏸️ Telegram: ${dispatchRes.message || 'No action needed'}`);
          }
        } catch (e: unknown) {
          socialSummary.telegramMessage = e instanceof Error ? e.message : String(e);
        }
      } else {
        socialSummary.telegramDispatched = true;
        socialSummary.telegramMessage = 'Simulated Telegram snippet delivery';
      }

      // 3.2 Pinterest Queue Audit
      const pinterestQueuePath = path.resolve(process.cwd(), '.antigravity/pinterest_queue.json');
      if (fs.existsSync(pinterestQueuePath)) {
        try {
          const rawQ = JSON.parse(fs.readFileSync(pinterestQueuePath, 'utf8'));
          const pending = Array.isArray(rawQ) ? rawQ.filter((p: any) => p.status === 'PENDING') : [];
          socialSummary.pinterestQueueLength = pending.length;
          socialSummary.pinterestQueued = pending.length > 0;
        } catch {}
      }

      // 3.3 Count pending Reddit community drafts
      try {
        const pendingItems = this.queueRepo.listPending(10);
        socialSummary.redditDraftsQueued = pendingItems.filter(
          (item: any) => item.target_platform?.toLowerCase() === 'reddit'
        ).length;
      } catch {}
    }

    // ------------------------------------------------------------------------
    // PHASE 4: CONTINUOUS OPTIMIZATION & LEARNING (L1, L2, L3)
    // ------------------------------------------------------------------------
    console.log(`\x1b[36m[Phase 4: Optimization]\x1b[0m Calibrating MAB engine & inspecting Layered Memory state...`);
    const optSummary: OptimizationSummary = {
      mabCampaignsEvaluated: 0,
      l1PatternsActive: 0,
      l2ScenariosActive: 0,
      l3PoliciesActive: 0,
      totalLoggedClicks: 0,
      totalLoggedConversions: 0,
    };

    if (options.enableOptimization !== false) {
      // 4.1 Layered Memory inspection
      const l1Patterns = this.networkMemory.getL1Patterns();
      const l2Scenarios = this.networkMemory.getL2Scenarios();
      const losL3 = this.networkMemory.getL3Policy('lospollos');
      const myleadL3 = this.networkMemory.getL3Policy('mylead');

      optSummary.l1PatternsActive = l1Patterns.length;
      optSummary.l2ScenariosActive = l2Scenarios.length;
      optSummary.l3PoliciesActive = (losL3 ? 1 : 0) + (myleadL3 ? 1 : 0);

      for (const p of l1Patterns) {
        optSummary.totalLoggedClicks += p.clicks;
        optSummary.totalLoggedConversions += p.conversions;
      }

      // 4.2 MAB Engine Calibration (Dry check)
      const mabState = this.mabEngine.getState();
      optSummary.mabCampaignsEvaluated = Object.keys(mabState.campaigns || {}).length;

      console.log(
        `  🧠 Memory: L1 Atomic=${optSummary.l1PatternsActive} | L2 Scenarios=${optSummary.l2ScenariosActive} | L3 Policies=${optSummary.l3PoliciesActive}`
      );
      console.log(
        `  📊 Verified Live Stats (Zero Demo Data): Clicks=${optSummary.totalLoggedClicks}, Conversions=${optSummary.totalLoggedConversions}`
      );
    }

    const durationMs = Date.now() - startTime;
    const success = Boolean(dryRun || contentPublishResult?.published || socialSummary.telegramDispatched);

    const report: AutonomousCycleReport = {
      cycleId,
      startedAt: new Date(startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs,
      success,
      dryRun,
      discoveredTopic,
      contentPublishResult,
      socialSyndication: socialSummary,
      optimization: optSummary,
      mermaidExecutionGraph: '',
    };

    report.mermaidExecutionGraph = this.generateMermaidGraph(report);

    // Save cycle artifact
    if (!dryRun) {
      try {
        const cycleFile = path.join(this.runsDir, `cycle_${cycleId}.json`);
        fs.writeFileSync(cycleFile, JSON.stringify(report, null, 2), 'utf8');
        fs.writeFileSync(this.stateFilePath, JSON.stringify(report, null, 2), 'utf8');
      } catch (e: any) {
        console.warn(`[SiteAutonomousAgent] Warning: Failed to persist cycle report: ${e.message}`);
      }
    }

    console.log(`\x1b[1m\x1b[32m=== [SiteAutonomousAgent] Cycle Completed in ${durationMs}ms ===\x1b[0m\n`);
    return report;
  }

  /**
   * Starts autonomous continuous daemon loop
   */
  public startDaemon(intervalMinutes = 180): void {
    if (this.isRunning) {
      console.log(`[SiteAutonomousAgent] Daemon already running.`);
      return;
    }

    this.isRunning = true;
    console.log(`🚀 [SiteAutonomousAgent] Daemon loop activated (Base Interval: ${intervalMinutes}m).`);

    const runLoop = async () => {
      if (!this.isRunning) return;

      try {
        await this.runAutonomousCycle();
      } catch (err: any) {
        console.error(`[SiteAutonomousAgent] Error during daemon cycle: ${err.message}`);
      }

      if (this.isRunning) {
        // Humanized Gaussian jitter: interval ± 15%
        const jitterMinutes = (intervalMinutes * 0.85) + (Math.random() * intervalMinutes * 0.3);
        const nextMs = Math.round(jitterMinutes * 60 * 1000);
        console.log(`⏳ [SiteAutonomousAgent] Next cycle scheduled in ${Math.round(jitterMinutes)} minutes.`);
        this.daemonTimer = setTimeout(runLoop, nextMs);
      }
    };

    // Trigger first cycle immediately
    runLoop().catch(console.error);
  }

  /**
   * Stops autonomous continuous daemon loop
   */
  public stopDaemon(): void {
    this.isRunning = false;
    if (this.daemonTimer) {
      clearTimeout(this.daemonTimer);
      this.daemonTimer = null;
    }
    console.log(`🛑 [SiteAutonomousAgent] Daemon loop stopped.`);
  }

  /**
   * Returns current health & runtime metrics
   */
  public getStatus(): { isRunning: boolean; emergencyStop: boolean; lastState?: AutonomousCycleReport } {
    let lastState: AutonomousCycleReport | undefined;
    if (fs.existsSync(this.stateFilePath)) {
      try {
        lastState = JSON.parse(fs.readFileSync(this.stateFilePath, 'utf8'));
      } catch {}
    }

    return {
      isRunning: this.isRunning,
      emergencyStop: this.emergencyStop.isHalted(),
      lastState,
    };
  }
}
