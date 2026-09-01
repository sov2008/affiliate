import fs from 'fs';
import path from 'path';
import { ContentQueueRepository, ContentQueueItem } from '../db/queueRepository.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { LlmGatewayService } from '../services/llm-gateway.service.js';
import { PostingWorker, PostingResult, PostingOptions } from './postingWorker.js';
import { proxyRotator, ProxyConfig } from '../skills/proxy-rotator-skill.js';

export interface PlatformCooldownConfig {
  minDelayMs: number;
  maxDelayMs: number;
}

export interface DistributionSchedulerOptions {
  pollIntervalMs?: number;
  cooldownConfigs?: Record<string, PlatformCooldownConfig>;
  stateFilePath?: string;
  runsDir?: string;
}

export interface DispatchLogRecord {
  bundleId: string;
  itemId: string;
  campaignId: string;
  platform: string;
  profileId: string;
  proxyUsed: string;
  publishedUrl: string;
  durationMs: number;
  status: 'SUCCESS' | 'FAILED' | 'CAPTCHA_TRIGGERED' | 'ACCOUNT_FLAGGED' | 'SKIPPED_COOLDOWN' | 'WORKER_PAUSED';
  dispatchedAt: string;
  error?: string;
}

export interface DispatchCycleResult {
  dispatched: boolean;
  status: 'SUCCESS' | 'FAILED' | 'CAPTCHA_TRIGGERED' | 'ACCOUNT_FLAGGED' | 'NO_ITEMS' | 'COOLDOWN_ACTIVE' | 'WORKER_PAUSED' | 'ESTOP_HALTED';
  item?: ContentQueueItem;
  result?: PostingResult;
  log?: DispatchLogRecord;
  reason?: string;
  remainingCooldownMs?: number;
}

export interface SchedulerState {
  status: 'RUNNING' | 'STOPPED' | 'PAUSED' | 'CIRCUIT_BROKEN';
  lastCycleAt: string | null;
  totalDispatched: number;
  totalFailed: number;
  lastPlatformDispatch: Record<string, { timestamp: number; nextAllowedAt: number }>;
  circuitBreakerReason?: string;
}

/**
 * Box-Muller transform for Gaussian (normal distribution) randomized delays
 */
export function getGaussianDelay(minMs: number, maxMs: number): number {
  if (minMs >= maxMs) return minMs;
  const u1 = Math.max(1e-6, Math.random());
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  const mean = (minMs + maxMs) / 2;
  const stdDev = (maxMs - minMs) / 6;
  const val = mean + z0 * stdDev;
  return Math.max(minMs, Math.min(maxMs, Math.round(val)));
}

export class DistributionScheduler {
  private static instance: DistributionScheduler | null = null;
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private pollIntervalMs: number = 60000;
  private state: SchedulerState;
  private stateFilePath: string;
  private runsDir: string;

  // Platform Cooldown Defaults (Reddit: 45–90 min, Quora: 30–60 min)
  private cooldownConfigs: Record<string, PlatformCooldownConfig> = {
    reddit: {
      minDelayMs: 45 * 60 * 1000,
      maxDelayMs: 90 * 60 * 1000,
    },
    quora: {
      minDelayMs: 30 * 60 * 1000,
      maxDelayMs: 60 * 60 * 1000,
    },
    medium: {
      minDelayMs: 30 * 60 * 1000,
      maxDelayMs: 60 * 60 * 1000,
    },
    forum: {
      minDelayMs: 30 * 60 * 1000,
      maxDelayMs: 60 * 60 * 1000,
    },
    x: {
      minDelayMs: 30 * 60 * 1000,
      maxDelayMs: 60 * 60 * 1000,
    },
  };

  private constructor(options: DistributionSchedulerOptions = {}) {
    this.pollIntervalMs = options.pollIntervalMs || 60000;
    if (options.cooldownConfigs) {
      this.cooldownConfigs = { ...this.cooldownConfigs, ...options.cooldownConfigs };
    }

    this.runsDir = options.runsDir || path.resolve(process.cwd(), 'runs');

    const candidates = [
      path.resolve(process.cwd(), '.antigravity/distribution_scheduler_state.json'),
      path.resolve(process.cwd(), 'core/data/distribution_scheduler_state.json'),
      path.resolve(process.cwd(), 'data/distribution_scheduler_state.json'),
    ];

    this.stateFilePath = options.stateFilePath || candidates.find((p) => fs.existsSync(p)) || candidates[0];
    this.state = this.loadState();
  }

  public static getInstance(options?: DistributionSchedulerOptions): DistributionScheduler {
    if (!this.instance) {
      this.instance = new DistributionScheduler(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stop();
      this.instance = null;
    }
  }

  private ensureStateDir(): void {
    const dir = path.dirname(this.stateFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadState(): SchedulerState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        return {
          status: parsed.status || 'STOPPED',
          lastCycleAt: parsed.lastCycleAt || null,
          totalDispatched: parsed.totalDispatched || 0,
          totalFailed: parsed.totalFailed || 0,
          lastPlatformDispatch: parsed.lastPlatformDispatch || {},
          circuitBreakerReason: parsed.circuitBreakerReason,
        };
      }
    } catch {}

    return {
      status: 'STOPPED',
      lastCycleAt: null,
      totalDispatched: 0,
      totalFailed: 0,
      lastPlatformDispatch: {},
    };
  }

  private saveState(): void {
    try {
      this.ensureStateDir();
      const tmp = `${this.stateFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
      fs.renameSync(tmp, this.stateFilePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[DistributionScheduler] Failed saving state: ${msg}`);
    }
  }

  /**
   * Sets custom cooldown intervals (e.g. for testing)
   */
  public setCooldownConfig(platform: string, config: PlatformCooldownConfig): void {
    this.cooldownConfigs[platform.toLowerCase()] = config;
  }

  /**
   * Checks if platform cooldown has elapsed
   */
  public canDispatchPlatform(platform: string): { allowed: boolean; remainingCooldownMs: number } {
    const platKey = platform.toLowerCase();
    const last = this.state.lastPlatformDispatch[platKey];
    if (!last || !last.nextAllowedAt) {
      return { allowed: true, remainingCooldownMs: 0 };
    }

    const now = Date.now();
    if (now >= last.nextAllowedAt) {
      return { allowed: true, remainingCooldownMs: 0 };
    }

    return {
      allowed: false,
      remainingCooldownMs: last.nextAllowedAt - now,
    };
  }

  /**
   * Updates last dispatch timestamp and calculates next Gaussian randomized delay
   */
  private recordDispatch(platform: string): void {
    const platKey = platform.toLowerCase();
    const config = this.cooldownConfigs[platKey] || { minDelayMs: 30 * 60 * 1000, maxDelayMs: 60 * 60 * 1000 };
    const delay = getGaussianDelay(config.minDelayMs, config.maxDelayMs);
    const now = Date.now();

    this.state.lastPlatformDispatch[platKey] = {
      timestamp: now,
      nextAllowedAt: now + delay,
    };
    this.saveState();
  }

  /**
   * Evaluates errors for CAPTCHA challenges or Account Flags
   */
  public detectCircuitBreakerTrigger(errorMsg: string): 'CAPTCHA_TRIGGERED' | 'ACCOUNT_FLAGGED' | null {
    const msg = (errorMsg || '').toLowerCase();
    if (
      msg.includes('captcha') ||
      msg.includes('cloudflare') ||
      msg.includes('recaptcha') ||
      msg.includes('hcaptcha') ||
      msg.includes('turnstile') ||
      msg.includes('challenge required')
    ) {
      return 'CAPTCHA_TRIGGERED';
    }

    if (
      msg.includes('account flagged') ||
      msg.includes('shadowban') ||
      msg.includes('suspended') ||
      msg.includes('banned') ||
      msg.includes('rate limit exceeded') ||
      msg.includes('account_flagged')
    ) {
      return 'ACCOUNT_FLAGGED';
    }

    return null;
  }

  /**
   * Saves detailed dispatch log in /runs/{bundle_id}/dispatch_log.json
   */
  private saveDispatchLog(bundleId: string, record: DispatchLogRecord): void {
    const targetDirs = [
      path.join(this.runsDir, bundleId),
      path.join(this.runsDir, 'pending', bundleId),
    ];

    for (const dir of targetDirs) {
      if (fs.existsSync(dir)) {
        try {
          const logFile = path.join(dir, 'dispatch_log.json');
          fs.writeFileSync(logFile, JSON.stringify(record, null, 2), 'utf8');
        } catch {}
      }
    }
  }

  /**
   * Alias for runCycle()
   */
  public async tick(options: { dryRun?: boolean; forcePlatform?: string } = {}): Promise<DispatchCycleResult> {
    return this.runCycle(options);
  }

  /**
   * Executes a single automated distribution cycle with circuit breakers and anti-detect proxying
   */
  public async runCycle(options: { dryRun?: boolean; forcePlatform?: string } = {}): Promise<DispatchCycleResult> {
    this.state.lastCycleAt = new Date().toISOString();

    // 1. Safety Check: Global E-STOP
    const eStop = EmergencyStopController.getInstance();
    if (eStop.isHalted()) {
      console.warn('\x1b[41m\x1b[37m[DistributionScheduler]\x1b[0m Pipeline is HALTED by Emergency Stop. Skipping dispatch.');
      return {
        dispatched: false,
        status: 'ESTOP_HALTED',
        reason: 'Emergency Stop active',
      };
    }

    // 2. Safety Check: Distribution Worker Agent Configuration
    const gateway = LlmGatewayService.getInstance();
    gateway.loadRegistry();
    const workerConfig = gateway.getAgent('agent-distribution-worker-04');

    if (workerConfig?.isPaused) {
      console.warn(
        `\x1b[33m[DistributionScheduler]\x1b[0m Distribution Worker (${workerConfig.name}) is PAUSED. Dispatch cycle skipped without global E-STOP.`
      );
      this.state.status = 'PAUSED';
      this.saveState();
      return {
        dispatched: false,
        status: 'WORKER_PAUSED',
        reason: 'Agent distribution worker is paused in registry',
      };
    }

    // 3. Inspect SQLite Queue for APPROVED Items
    const repo = ContentQueueRepository.getInstance();
    const approvedItems = repo.listApproved();

    if (approvedItems.length === 0) {
      return {
        dispatched: false,
        status: 'NO_ITEMS',
        reason: 'No APPROVED items in queue',
      };
    }

    // 4. Find first item whose platform cooldown has elapsed
    let candidateItem: ContentQueueItem | null = null;
    let remainingCooldownMs = 0;

    for (const item of approvedItems) {
      if (options.forcePlatform && item.target_platform !== options.forcePlatform) {
        continue;
      }

      const cooldown = this.canDispatchPlatform(item.target_platform);
      if (cooldown.allowed) {
        candidateItem = item;
        break;
      } else {
        remainingCooldownMs = cooldown.remainingCooldownMs;
      }
    }

    if (!candidateItem) {
      const minsLeft = (remainingCooldownMs / 60000).toFixed(1);
      console.log(`\x1b[33m[DistributionScheduler]\x1b[0m Platform cooldown active. Next dispatch allowed in ${minsLeft}m.`);
      return {
        dispatched: false,
        status: 'COOLDOWN_ACTIVE',
        reason: `Platform cooldown active (remaining: ${minsLeft}m)`,
        remainingCooldownMs,
      };
    }

    // 5. Attach Geo-Targeted Residential Proxy via ProxyRotator
    proxyRotator.reloadProxies();
    let targetGeo: string | undefined;
    const campMatch = candidateItem.campaign_id.toLowerCase().match(/_(us|au|de|uk|gb|ca|fr|es|it)/i);
    if (campMatch && campMatch[1]) {
      targetGeo = campMatch[1].toLowerCase() === 'gb' ? 'UK' : campMatch[1].toUpperCase();
    }

    const selectedProxy: ProxyConfig | undefined = targetGeo
      ? proxyRotator.getProxyForGeo(targetGeo, true)
      : proxyRotator.getNextProxy();
    const proxyDescription = selectedProxy ? `${selectedProxy.server}${selectedProxy.geo ? ` [${selectedProxy.geo}]` : ''}` : 'DIRECT_CONNECTION';

    console.log(
      `\x1b[36m[DistributionScheduler]\x1b[0m Dispatching item [${candidateItem.id.slice(0, 8)}] to ${candidateItem.target_platform.toUpperCase()} (Geo: ${targetGeo || 'GLOBAL'}) using proxy: \x1b[32m${proxyDescription}\x1b[0m`
    );

    // 6. Execute Dispatch via PostingWorker
    let postingResult: PostingResult;
    try {
      if (options.dryRun) {
        postingResult = {
          success: true,
          itemId: candidateItem.id,
          platform: candidateItem.target_platform,
          publishedUrl: `https://${candidateItem.target_platform}.com/r/community/comments/mock_post_${Date.now()}`,
          postId: `mock_${Date.now()}`,
          profileId: `profile_${candidateItem.target_platform}_${candidateItem.network}`,
          durationMs: 120,
        };
      } else {
        postingResult = await PostingWorker.dispatchItem(candidateItem, {
          proxy: selectedProxy,
          headless: true,
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      postingResult = {
        success: false,
        itemId: candidateItem.id,
        platform: candidateItem.target_platform,
        publishedUrl: '',
        postId: '',
        profileId: `profile_${candidateItem.target_platform}_${candidateItem.network}`,
        durationMs: 50,
        error: errorMsg,
      };
    }

    // 7. Check for Circuit Breaker Triggers (CAPTCHA / Account Flags)
    let logStatus: DispatchLogRecord['status'] = postingResult.success ? 'SUCCESS' : 'FAILED';
    if (!postingResult.success && postingResult.error) {
      const cbTrigger = this.detectCircuitBreakerTrigger(postingResult.error);
      if (cbTrigger) {
        logStatus = cbTrigger;
        this.state.status = 'CIRCUIT_BROKEN';
        this.state.circuitBreakerReason = `${cbTrigger}: ${postingResult.error}`;

        // Automatically pause worker in registry
        gateway.updateAgent('agent-distribution-worker-04', { isPaused: true });
        console.error(
          `\x1b[41m\x1b[37m[CIRCUIT BREAKER ACTIVATED]\x1b[0m Distribution Worker paused due to ${cbTrigger}: ${postingResult.error}`
        );

        // Alert Telegram
        try {
          const { sendTelegramMessage } = await import('../skills/telegram-commander-skill.js');
          await sendTelegramMessage(
            `🚨 <b>[CIRCUIT BREAKER ALERT]</b>\n━━━━━━━━━━━━━━━━━━\nPlatform: <code>${candidateItem.target_platform.toUpperCase()}</code>\nCampaign: <code>${candidateItem.campaign_id}</code>\nTrigger: <code>${cbTrigger}</code>\nError: ${postingResult.error || 'Challenge detected'}\nAction: <b>Distribution Worker Auto-Paused</b>\n━━━━━━━━━━━━━━━━━━`
          );
        } catch {}
      }
    }

    // 8. Record Dispatch Cooldown and State
    if (postingResult.success) {
      repo.markDispatched(candidateItem.id, postingResult.publishedUrl);
      this.recordDispatch(candidateItem.target_platform);
      this.state.totalDispatched++;
    } else {
      repo.updateStatus(candidateItem.id, 'FAILED');
      this.state.totalFailed++;
    }
    this.saveState();

    // 9. Write Dispatch Audit Log
    const logRecord: DispatchLogRecord = {
      bundleId: candidateItem.id,
      itemId: candidateItem.id,
      campaignId: candidateItem.campaign_id,
      platform: candidateItem.target_platform,
      profileId: postingResult.profileId,
      proxyUsed: proxyDescription,
      publishedUrl: postingResult.publishedUrl,
      durationMs: postingResult.durationMs,
      status: logStatus,
      dispatchedAt: new Date().toISOString(),
      error: postingResult.error,
    };

    this.saveDispatchLog(candidateItem.id, logRecord);

    return {
      dispatched: postingResult.success,
      status: logStatus,
      item: candidateItem,
      result: postingResult,
      log: logRecord,
    };
  }

  /**
   * Starts autonomous periodic distribution loop
   */
  public start(pollIntervalMs?: number): void {
    if (this.isRunning) return;

    if (pollIntervalMs) {
      this.pollIntervalMs = pollIntervalMs;
    }

    this.isRunning = true;
    this.state.status = 'RUNNING';
    this.saveState();

    console.log(
      `\x1b[32m[DistributionScheduler] Autonomous distribution scheduler STARTED (Interval: ${this.pollIntervalMs / 1000}s).\x1b[0m`
    );

    // Initial immediate cycle
    this.runCycle().catch((err) => {
      console.error('[DistributionScheduler Cycle Error]', err);
    });

    this.timer = setInterval(() => {
      this.runCycle().catch((err) => {
        console.error('[DistributionScheduler Cycle Error]', err);
      });
    }, this.pollIntervalMs);
  }

  /**
   * Stops the distribution loop
   */
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    this.state.status = 'STOPPED';
    this.saveState();
    console.log(`\x1b[33m[DistributionScheduler] Scheduler STOPPED.\x1b[0m`);
  }

  /**
   * Retrieves live diagnostic state
   */
  public getStatus(): SchedulerState & { isRunning: boolean; pollIntervalMs: number } {
    return {
      ...this.state,
      isRunning: this.isRunning,
      pollIntervalMs: this.pollIntervalMs,
    };
  }
}

// Standalone CLI Runner Execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('distribution-scheduler.ts') ||
    process.argv[1].endsWith('distribution-scheduler.js'))
) {
  console.log('\n🚀 Starting Autonomous Stealth Distribution Scheduler standalone runner...');
  const scheduler = DistributionScheduler.getInstance();
  scheduler.start();

  process.on('SIGINT', () => {
    console.log('\n[SIGINT] Shutting down distribution scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[SIGTERM] Shutting down distribution scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}
