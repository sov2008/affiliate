import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';

export type QueueStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DISPATCHED' | 'FAILED';
export type TargetPlatform = 'reddit' | 'quora' | 'medium';
export type NetworkName = 'lospollos' | 'mylead';

export interface ContentQueueItem {
  id: string;
  campaign_id: string;
  network: NetworkName;
  target_platform: TargetPlatform;
  hook: string;
  body: string;
  stealth_cta: string;
  tracking_url: string;
  image_path: string;
  risk_score: number;
  status: QueueStatus;
  published_url?: string | null;
  created_at: number;
  updated_at: number;
}

export class ContentQueueRepository {
  private static instance: ContentQueueRepository | null = null;
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

  public static getInstance(): ContentQueueRepository {
    if (!this.instance) {
      this.instance = new ContentQueueRepository();
    }
    return this.instance;
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS content_queue_v2 (
        id TEXT PRIMARY KEY,
        campaign_id TEXT NOT NULL,
        network TEXT NOT NULL,
        target_platform TEXT NOT NULL,
        hook TEXT NOT NULL,
        body TEXT NOT NULL,
        stealth_cta TEXT NOT NULL,
        tracking_url TEXT NOT NULL,
        image_path TEXT NOT NULL,
        risk_score INTEGER NOT NULL,
        status TEXT NOT NULL,
        published_url TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_cq2_status ON content_queue_v2 (status);
      CREATE INDEX IF NOT EXISTS idx_cq2_campaign ON content_queue_v2 (campaign_id);
    `);

    // Create backward compatibility view / table
    try {
      this.db.exec(`
        CREATE VIEW IF NOT EXISTS content_queue_view AS
        SELECT * FROM content_queue_v2;
      `);
    } catch {}
  }

  /**
   * Enqueues a new item into the queue
   */
  public enqueue(
    item: Omit<ContentQueueItem, 'id' | 'created_at' | 'updated_at' | 'status'> &
      Partial<Pick<ContentQueueItem, 'id' | 'status' | 'created_at' | 'updated_at'>>
  ): ContentQueueItem {
    const id = item.id || crypto.randomUUID();
    const now = Date.now();
    const created_at = item.created_at || now;
    const updated_at = item.updated_at || now;
    const status: QueueStatus = item.status || 'PENDING_APPROVAL';
    const published_url = item.published_url ?? null;

    const stmt = this.db.prepare(`
      INSERT INTO content_queue_v2 (
        id, campaign_id, network, target_platform, hook, body, stealth_cta, tracking_url, image_path, risk_score, status, published_url, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      item.campaign_id,
      item.network || 'lospollos',
      item.target_platform || 'reddit',
      item.hook,
      item.body,
      item.stealth_cta,
      item.tracking_url || '',
      item.image_path,
      item.risk_score,
      status,
      published_url,
      created_at,
      updated_at
    );

    return {
      id,
      campaign_id: item.campaign_id,
      network: item.network || 'lospollos',
      target_platform: item.target_platform || 'reddit',
      hook: item.hook,
      body: item.body,
      stealth_cta: item.stealth_cta,
      tracking_url: item.tracking_url || '',
      image_path: item.image_path,
      risk_score: item.risk_score,
      status,
      published_url,
      created_at,
      updated_at,
    };
  }

  /**
   * List all pending items awaiting human review
   */
  public listPending(limit: number = 50): ContentQueueItem[] {
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue_v2
      WHERE status = 'PENDING_APPROVAL'
      ORDER BY created_at ASC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as ContentQueueItem[];
  }

  /**
   * List all items with optional status filter
   */
  public listAll(status?: QueueStatus, limit: number = 100): ContentQueueItem[] {
    if (status) {
      const stmt = this.db.prepare(`
        SELECT * FROM content_queue_v2
        WHERE status = ?
        ORDER BY created_at DESC
        LIMIT ?
      `);
      return stmt.all(status, limit) as unknown as ContentQueueItem[];
    }
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue_v2
      ORDER BY created_at DESC
      LIMIT ?
    `);
    return stmt.all(limit) as unknown as ContentQueueItem[];
  }

  /**
   * Update item status and timestamp
   */
  public updateStatus(id: string, status: QueueStatus): boolean {
    const stmt = this.db.prepare(`
      UPDATE content_queue_v2
      SET status = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(status, Date.now(), id);
    return true;
  }

  /**
   * Mark item as DISPATCHED with published URL
   */
  public markDispatched(id: string, publishedUrl: string): boolean {
    const now = Date.now();
    const stmt = this.db.prepare(`
      UPDATE content_queue_v2
      SET status = 'DISPATCHED', published_url = ?, updated_at = ?
      WHERE id = ?
    `);
    stmt.run(publishedUrl, now, id);
    return true;
  }

  /**
   * Fetch the next approved item ready for dispatch
   */
  public fetchNextApproved(platform?: TargetPlatform): ContentQueueItem | null {
    if (platform) {
      const stmt = this.db.prepare(`
        SELECT * FROM content_queue_v2
        WHERE status = 'APPROVED' AND target_platform = ?
        ORDER BY created_at ASC
        LIMIT 1
      `);
      const row = stmt.get(platform);
      return (row as unknown as ContentQueueItem) || null;
    }
    const stmt = this.db.prepare(`
      SELECT * FROM content_queue_v2
      WHERE status = 'APPROVED'
      ORDER BY created_at ASC
      LIMIT 1
    `);
    const row = stmt.get();
    return (row as unknown as ContentQueueItem) || null;
  }

  /**
   * Delete item by ID
   */
  public deleteItem(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM content_queue_v2 WHERE id = ?`);
    stmt.run(id);
    return true;
  }

  /**
   * Get queue summary statistics
   */
  public getStats(): { total: number; pending: number; approved: number; rejected: number; dispatched: number; failed: number } {
    const rows = this.db.prepare(`SELECT status, COUNT(*) as count FROM content_queue_v2 GROUP BY status`).all() as {
      status: string;
      count: number;
    }[];
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
      failed: counts['FAILED'] || 0,
    };
  }
}
