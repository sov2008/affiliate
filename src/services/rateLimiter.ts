import { DatabaseSync } from 'node:sqlite';
import { resolveDatabasePath } from '../db/caseRepository';

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
  currentUsage: number;
  limit: number;
}

export const DEFAULT_WINDOW_SECONDS = 86400; // 24 hours sliding window
export const DEFAULT_MAX_FREE_SCANS = 3;

export class RateLimiterService {
  private db: DatabaseSync;
  private windowSeconds: number;
  private maxScans: number;

  constructor(
    customDbPath?: string,
    customMaxScans?: number,
    customWindowSeconds?: number
  ) {
    const dbPath = resolveDatabasePath(customDbPath);
    this.db = new DatabaseSync(dbPath);
    this.windowSeconds = customWindowSeconds ?? DEFAULT_WINDOW_SECONDS;
    this.maxScans =
      customMaxScans ??
      (process.env.MAX_FREE_DAILY_SCANS
        ? parseInt(process.env.MAX_FREE_DAILY_SCANS, 10)
        : DEFAULT_MAX_FREE_SCANS);

    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS deeptrace_rate_limits (
        client_ip TEXT NOT NULL,
        window_start INTEGER NOT NULL,
        request_count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (client_ip, window_start)
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON deeptrace_rate_limits(window_start);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON deeptrace_rate_limits(client_ip);
    `);
  }

  /**
   * Evaluates current IP usage within sliding window
   */
  public checkLimit(ip: string): RateLimitStatus {
    const normalizedIp = ip.trim().toLowerCase();
    const now = Math.floor(Date.now() / 1000);
    const windowThreshold = now - this.windowSeconds;

    const stmt = this.db.prepare(`
      SELECT 
        COALESCE(SUM(request_count), 0) AS total,
        MIN(window_start) AS oldest_window
      FROM deeptrace_rate_limits
      WHERE client_ip = ? AND window_start > ?
    `);

    const row = stmt.get(normalizedIp, windowThreshold) as any;
    const currentUsage = Number(row?.total || 0);
    const allowed = currentUsage < this.maxScans;
    const remaining = Math.max(0, this.maxScans - currentUsage);

    let resetInSeconds = this.windowSeconds;
    if (row?.oldest_window) {
      const oldestTime = Number(row.oldest_window);
      resetInSeconds = Math.max(1, oldestTime + this.windowSeconds - now);
    }

    return {
      allowed,
      remaining,
      resetInSeconds,
      currentUsage,
      limit: this.maxScans
    };
  }

  /**
   * Records successful analysis execution against the client IP
   */
  public recordUsage(ip: string, customTimestamp?: number): void {
    const normalizedIp = ip.trim().toLowerCase();
    const windowStart = customTimestamp ?? Math.floor(Date.now() / 1000);

    const stmt = this.db.prepare(`
      INSERT INTO deeptrace_rate_limits (client_ip, window_start, request_count)
      VALUES (?, ?, 1)
      ON CONFLICT(client_ip, window_start) DO UPDATE SET
        request_count = request_count + 1
    `);

    stmt.run(normalizedIp, windowStart);
  }

  /**
   * Housekeeping routine: purge records outside active sliding windows
   */
  public cleanExpiredWindows(thresholdTimestamp?: number): number {
    const now = Math.floor(Date.now() / 1000);
    const threshold = thresholdTimestamp ?? (now - this.windowSeconds);

    const stmt = this.db.prepare(`
      DELETE FROM deeptrace_rate_limits
      WHERE window_start <= ?
    `);

    const result = stmt.run(threshold) as any;
    return Number(result?.changes || 0);
  }

  /**
   * Closes database instance
   */
  public close(): void {
    try {
      this.db.close();
    } catch {}
  }
}

// Global singleton instance for application use
export const rateLimiter = new RateLimiterService();
