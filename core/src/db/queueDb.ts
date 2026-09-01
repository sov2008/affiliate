import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';

export type QueueStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISPATCHED' | 'FAILED';
export type TargetPlatform = 'reddit' | 'quora' | 'twitter' | 'medium';

export interface QueueItem {
  id: string;
  campaign_id: string;
  target_platform: TargetPlatform;
  hook: string;
  body: string;
  cta: string;
  image_path: string;
  risk_score: number;
  status: QueueStatus;
  created_at: number;
  scheduled_for?: number | null;
}

export class QueueDatabase {
  private static instance: QueueDatabase | null = null;
  private db: DatabaseSync;

  private constructor() {
    const candidates = [
      path.resolve(process.cwd(), '.antigravity'),
      path.resolve(process.cwd(), 'core/data'),
      path.resolve(process.cwd(), 'data'),
    ];

    let dbDir = candidates[0];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        dbDir = c;
        break;
      }
    }

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'content_queue.db');
    this.db = new DatabaseSync(dbPath);
    this.initSchema();
  }

  public static getInstance(): QueueDatabase {
    if (!this.instance) {
      this.instance = new QueueDatabase();
    }
    return this.instance;
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS content_queue (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        target_platform TEXT NOT NULL,
        hook TEXT NOT NULL,
        body TEXT NOT NULL,
        cta TEXT NOT NULL,
        image_path TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        scheduled_for INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_queue_status ON content_queue (status);
      CREATE INDEX IF NOT EXISTS idx_queue_campaign ON content_queue (campaign_id);
    `);
  }

  /**
   * Enqueue a newly generated content item
   */
  public enqueue(
    item: Omit<QueueItem, 'id' | 'created_at' | 'status'> & Partial<Pick<QueueItem, 'id' | 'status' | 'created_at'>>
  ): QueueItem {
    const id = item.id || crypto.randomUUID();
    const created_at = item.created_at || Date.now();
    const status: QueueStatus = item.status || 'PENDING_APPROVAL';
    const scheduled_for = item.scheduled_for ?? null;

    const stmt = this.db.prepare(`
      INSERT INTO content_queue (
        id, campaign_id, target_platform, hook, body, cta, image_path, risk_score, status, created_at, scheduled_for
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      item.campaign_id,
      item.target_platform,
      item.hook,
      item.body,
      item.cta,
      item.image_path,
      item.risk_score,
      status,
      created_at,
      scheduled_for
    );

    return {
      id,
      campaign_id: item.campaign_id,
      target_platform: item.target_platform,
      hook: item.hook,
      body: item.body,
      cta: item.cta,
      image_path: item.image_path,
      risk_score: item.risk_score,
      status,
      created_at,
      scheduled_for,
    };
  }

  /**
   * List all pending items awaiting operator approval
   */
  public listPending(limit: number = 50): QueueItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue
      WHERE status = 'PENDING_APPROVAL'
      ORDER BY created_at ASC
      LIMIT ?
    `);
    const rows = stmt.all(limit);
    return rows as unknown as QueueItem[];
  }

  /**
   * List all items regardless of status (with optional status filter)
   */
  public listAll(status?: QueueStatus, limit: number = 100): QueueItem[] {
    if (status) {
      const stmt = this.db.prepare(`
        SELECT * FROM content_queue
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT ?
      `);
      return stmt.all(status, limit) as unknown as QueueItem[];
    }
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as QueueItem[];
  }

  /**
   * Update the status of a specific item
   */
  public updateStatus(id: string, status: QueueStatus): boolean {
    const stmt = this.db.prepare(`
      UPDATE content_queue
      SET status = ?
      WHERE id = ?
    `);
    stmt.run(status, id);
    return true;
  }

  /**
   * Fetch next approved item ready for organic dispatch
   */
  public getNextApproved(platform?: TargetPlatform): QueueItem | null {
    if (platform) {
      const stmt = this.db.prepare(`
        SELECT * FROM content_queue
        WHERE status = 'APPROVED' AND target_platform = ?
        ORDER BY created_at ASC
        LIMIT 1
      `);
      const row = stmt.get(platform);
      return (row as unknown as QueueItem) || null;
    }
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue
      WHERE status = 'APPROVED'
      ORDER BY created_at ASC
      LIMIT 1
    `);
    const row = stmt.get();
    return (row as unknown as QueueItem) || null;
  }

  /**
   * Delete an item from the queue
   */
  public deleteItem(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM content_queue WHERE id = ?`);
    stmt.run(id);
    return true;
  }

  /**
   * Get queue statistics summary
   */
  public getStats(): { total: number; pending: number; approved: number; rejected: number; dispatched: number } {
    const rows = this.db.prepare(`SELECT status, COUNT(*) as count FROM content_queue GROUP BY status`).all() as { status: string; count: number }[];
    const counts: Record<string, number> = {};
    let total = 0;
    for (const r of rows) {
      counts[r.status] = Number(r.count);
      total += Number(r.count);
    }
    return {
      total,
      pending: counts['PENDING_APPROVAL'] || 0,
      approved: counts['APPROVED'] || 0,
      rejected: counts['REJECTED'] || 0,
      dispatched: counts['DISPATCHED'] || 0,
    };
  }
}
