import dotenv from 'dotenv';
import path from 'path';
import { ScoutRedditWorker } from './workers/scout-reddit.worker.js';
import { DripRetentionWorker } from './workers/drip-retention.worker.js';
import { ScoutQuoraWorker } from './workers/scout-quora.worker.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface CoreSchedulerOptions {
  redditIntervalMs?: number;
  dripIntervalMs?: number;
  quoraIntervalMs?: number;
}

export class CoreScheduler {
  private static instance: CoreScheduler | null = null;
  private redditIntervalMs: number;
  private dripIntervalMs: number;
  private quoraIntervalMs: number;
  private redditTimer: NodeJS.Timeout | null = null;
  private dripTimer: NodeJS.Timeout | null = null;
  private quoraTimer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private lastRedditRunAt: number = 0;
  private lastDripRunAt: number = 0;
  private lastQuoraRunAt: number = 0;
  private redditRunCount: number = 0;
  private dripRunCount: number = 0;
  private quoraRunCount: number = 0;

  private constructor(options: CoreSchedulerOptions = {}) {
    // 15 minutes by default: 15 * 60 * 1000 ms
    this.redditIntervalMs = options.redditIntervalMs || 15 * 60 * 1000;
    // 10 minutes by default: 10 * 60 * 1000 ms
    this.dripIntervalMs = options.dripIntervalMs || 10 * 60 * 1000;
    // 30 minutes by default: 30 * 60 * 1000 ms
    this.quoraIntervalMs = options.quoraIntervalMs || 30 * 60 * 1000;
  }

  public static getInstance(options?: CoreSchedulerOptions): CoreScheduler {
    if (!this.instance) {
      this.instance = new CoreScheduler(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stop();
      this.instance = null;
    }
  }

  /**
   * Starts all scheduled automation jobs
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log(
      `\x1b[32m[CoreScheduler] Core scheduler started. Scout Reddit: ${this.redditIntervalMs / 60000}m, Drip: ${this.dripIntervalMs / 60000}m, Scout Quora: ${this.quoraIntervalMs / 60000}m.\x1b[0m`
    );

    // Initial scout run after 5s warmup
    setTimeout(() => {
      this.triggerRedditScout().catch((err) => {
        console.error('[CoreScheduler] Initial Scout Run Error:', err);
      });
    }, 5000);

    // Periodic 15-minute Reddit scout interval
    this.redditTimer = setInterval(() => {
      this.triggerRedditScout().catch((err) => {
        console.error('[CoreScheduler] Periodic Scout Run Error:', err);
      });
    }, this.redditIntervalMs);

    // Initial drip retention run after 12s warmup
    setTimeout(() => {
      this.triggerDripRetention().catch((err) => {
        console.error('[CoreScheduler] Initial Drip Run Error:', err);
      });
    }, 12000);

    // Periodic 10-minute Drip retention interval
    this.dripTimer = setInterval(() => {
      this.triggerDripRetention().catch((err) => {
        console.error('[CoreScheduler] Periodic Drip Run Error:', err);
      });
    }, this.dripIntervalMs);

    // Initial Quora scout run after 18s warmup
    setTimeout(() => {
      this.triggerQuoraScout().catch((err) => {
        console.error('[CoreScheduler] Initial Quora Run Error:', err);
      });
    }, 18000);

    // Periodic 30-minute Quora scout interval
    this.quoraTimer = setInterval(() => {
      this.triggerQuoraScout().catch((err) => {
        console.error('[CoreScheduler] Periodic Quora Run Error:', err);
      });
    }, this.quoraIntervalMs);
  }

  public async triggerRedditScout(): Promise<{ scanned: number; matched: number; alerted: number }> {
    this.lastRedditRunAt = Date.now();
    this.redditRunCount++;
    const worker = ScoutRedditWorker.getInstance();
    return await worker.runScoutCycle();
  }

  public async triggerDripRetention(): Promise<any> {
    this.lastDripRunAt = Date.now();
    this.dripRunCount++;
    const worker = DripRetentionWorker.getInstance();
    return await worker.runCycle();
  }

  public async triggerQuoraScout(): Promise<any> {
    this.lastQuoraRunAt = Date.now();
    this.quoraRunCount++;
    const worker = ScoutQuoraWorker.getInstance();
    return await worker.runCycle();
  }

  public stop(): void {
    if (this.redditTimer) {
      clearInterval(this.redditTimer);
      this.redditTimer = null;
    }
    if (this.dripTimer) {
      clearInterval(this.dripTimer);
      this.dripTimer = null;
    }
    if (this.quoraTimer) {
      clearInterval(this.quoraTimer);
      this.quoraTimer = null;
    }
    this.isRunning = false;
    console.log(`\x1b[33m[CoreScheduler] Core scheduler stopped.\x1b[0m`);
  }

  public getStatus(): {
    isRunning: boolean;
    redditIntervalMinutes: number;
    dripIntervalMinutes: number;
    lastRedditRunAt: number;
    lastDripRunAt: number;
    redditRunCount: number;
    dripRunCount: number;
  } {
    return {
      isRunning: this.isRunning,
      redditIntervalMinutes: Math.round(this.redditIntervalMs / 60000),
      dripIntervalMinutes: Math.round(this.dripIntervalMs / 60000),
      lastRedditRunAt: this.lastRedditRunAt,
      lastDripRunAt: this.lastDripRunAt,
      redditRunCount: this.redditRunCount,
      dripRunCount: this.dripRunCount,
    };
  }
}

export const coreScheduler = CoreScheduler.getInstance();

// Standalone runner execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('scheduler.ts') || process.argv[1].endsWith('scheduler.js'))
) {
  console.log('\n🚀 Starting Core Automation Scheduler...');
  const scheduler = CoreScheduler.getInstance();
  scheduler.start();

  process.on('SIGINT', () => {
    console.log('\n[SIGINT] Shutting down scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n[SIGTERM] Shutting down scheduler gracefully...');
    scheduler.stop();
    process.exit(0);
  });
}
