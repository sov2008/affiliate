import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
  private db: any = null;
  private isSqlite: boolean = false;
  private jsonPath: string;
  private memoryItems: Map<string, ContentQueueItem> = new Map();

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
    this.jsonPath = path.join(dbDir, 'content_queue.json');

    try {
      // Dynamic require for node:sqlite
      const sqliteModule = require('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        this.db = new sqliteModule.DatabaseSync(dbPath);
        this.isSqlite = true;
        this.initSchema();
      }
    } catch {
      this.isSqlite = false;
      this.loadJsonDb();
    }
  }

  public static getInstance(): ContentQueueRepository {
    if (!this.instance) {
      this.instance = new ContentQueueRepository();
    }
    return this.instance;
  }

  private initSchema(): void {
    if (!this.isSqlite || !this.db) return;
    try {
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
    } catch (e) {}
  }

  private loadJsonDb(): void {
    try {
      if (fs.existsSync(this.jsonPath)) {
        const raw = fs.readFileSync(this.jsonPath, 'utf8');
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          for (const item of items) {
            this.memoryItems.set(item.id, item);
          }
        }
      }
    } catch {}
  }

  private saveJsonDb(): void {
    try {
      const items = Array.from(this.memoryItems.values());
      fs.writeFileSync(this.jsonPath, JSON.stringify(items, null, 2), 'utf8');
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

    const record: ContentQueueItem = {
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

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO content_queue_v2 (
            id, campaign_id, network, target_platform, hook, body, stealth_cta, tracking_url, image_path, risk_score, status, published_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          id,
          record.campaign_id,
          record.network,
          record.target_platform,
          record.hook,
          record.body,
          record.stealth_cta,
          record.tracking_url,
          record.image_path,
          record.risk_score,
          status,
          published_url,
          created_at,
          updated_at
        );
        return record;
      } catch {}
    }

    this.memoryItems.set(id, record);
    this.saveJsonDb();
    return record;
  }

  /**
   * Fetch the next approved item waiting to be dispatched
   */
  public fetchNextApproved(): ContentQueueItem | null {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM content_queue_v2
          WHERE status = 'APPROVED'
          ORDER BY created_at ASC
          LIMIT 1
        `);
        const row = stmt.get() as unknown as ContentQueueItem | undefined;
        return row || null;
      } catch {}
    }

    const approved = Array.from(this.memoryItems.values())
      .filter((it) => it.status === 'APPROVED')
      .sort((a, b) => a.created_at - b.created_at);

    return approved.length > 0 ? approved[0] : null;
  }

  /**
   * Marks item as DISPATCHED with published URL
   */
  public markDispatched(id: string, published_url: string): boolean {
    return this.updateStatus(id, 'DISPATCHED', published_url);
  }

  /**
   * Marks item as FAILED
   */
  public markFailed(id: string): boolean {
    return this.updateStatus(id, 'FAILED');
  }

  /**
   * Marks item as APPROVED
   */
  public markApproved(id: string): boolean {
    return this.updateStatus(id, 'APPROVED');
  }

  /**
   * Marks item as REJECTED
   */
  public markRejected(id: string): boolean {
    return this.updateStatus(id, 'REJECTED');
  }

  /**
   * Clears all queue items
   */
  public clearAll(): void {
    if (this.isSqlite && this.db) {
      try {
        this.db.exec(`DELETE FROM content_queue_v2`);
      } catch {}
    }
    this.memoryItems.clear();
    this.saveJsonDb();
  }

  /**
   * List all pending items awaiting human review
   */
  public listPending(limit: number = 50): ContentQueueItem[] {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM content_queue_v2
          WHERE status = 'PENDING_APPROVAL'
          ORDER BY created_at ASC
          LIMIT ?
        `);
        return stmt.all(limit) as unknown as ContentQueueItem[];
      } catch {}
    }

    return Array.from(this.memoryItems.values())
      .filter((it) => it.status === 'PENDING_APPROVAL')
      .sort((a, b) => a.created_at - b.created_at)
      .slice(0, limit);
  }

  /**
   * List all items by status or all
   */
  public listAll(status?: QueueStatus, limit: number = 100): ContentQueueItem[] {
    if (this.isSqlite && this.db) {
      try {
        if (status) {
          const stmt = this.db.prepare(`
            SELECT * FROM content_queue_v2
            WHERE status = ?
            ORDER BY created_at DESC
            LIMIT ?
          `);
          return stmt.all(status, limit) as unknown as ContentQueueItem[];
        } else {
          const stmt = this.db.prepare(`
            SELECT * FROM content_queue_v2
            ORDER BY created_at DESC
            LIMIT ?
          `);
          return stmt.all(limit) as unknown as ContentQueueItem[];
        }
      } catch {}
    }

    let items = Array.from(this.memoryItems.values());
    if (status) {
      items = items.filter((it) => it.status === status);
    }
    return items.sort((a, b) => b.created_at - a.created_at).slice(0, limit);
  }

  /**
   * Get single item by ID
   */
  public getItem(id: string): ContentQueueItem | null {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`SELECT * FROM content_queue_v2 WHERE id = ?`);
        const row = stmt.get(id) as unknown as ContentQueueItem | undefined;
        return row || null;
      } catch {}
    }
    return this.memoryItems.get(id) || null;
  }

  /**
   * Update item fields
   */
  public updateItem(id: string, partial: Partial<ContentQueueItem>): boolean {
    const item = this.getItem(id);
    if (!item) return false;

    const updated: ContentQueueItem = {
      ...item,
      ...partial,
      updated_at: Date.now(),
    };

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          UPDATE content_queue_v2
          SET hook = ?, body = ?, stealth_cta = ?, tracking_url = ?, image_path = ?, risk_score = ?, status = ?, published_url = ?, updated_at = ?
          WHERE id = ?
        `);
        stmt.run(
          updated.hook,
          updated.body,
          updated.stealth_cta,
          updated.tracking_url,
          updated.image_path,
          updated.risk_score,
          updated.status,
          updated.published_url || null,
          updated.updated_at,
          id
        );
        return true;
      } catch {}
    }

    this.memoryItems.set(id, updated);
    this.saveJsonDb();
    return true;
  }

  /**
   * Update item status
   */
  public updateStatus(id: string, status: QueueStatus, published_url?: string): boolean {
    const now = Date.now();
    if (this.isSqlite && this.db) {
      try {
        if (published_url !== undefined) {
          const stmt = this.db.prepare(`
            UPDATE content_queue_v2
            SET status = ?, published_url = ?, updated_at = ?
            WHERE id = ?
          `);
          stmt.run(status, published_url, now, id);
        } else {
          const stmt = this.db.prepare(`
            UPDATE content_queue_v2
            SET status = ?, updated_at = ?
            WHERE id = ?
          `);
          stmt.run(status, now, id);
        }
        return true;
      } catch {}
    }

    const item = this.memoryItems.get(id);
    if (item) {
      item.status = status;
      if (published_url !== undefined) item.published_url = published_url;
      item.updated_at = now;
      this.saveJsonDb();
      return true;
    }
    return false;
  }

  /**
   * Delete item
   */
  public deleteItem(id: string): boolean {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`DELETE FROM content_queue_v2 WHERE id = ?`);
        stmt.run(id);
        return true;
      } catch {}
    }

    const deleted = this.memoryItems.delete(id);
    if (deleted) this.saveJsonDb();
    return deleted;
  }

  /**
   * Get Queue Statistics
   */
  public getStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    dispatched: number;
    failed: number;
  } {
    if (this.isSqlite && this.db) {
      try {
        const rows = this.db
          .prepare(`SELECT status, COUNT(*) as count FROM content_queue_v2 GROUP BY status`)
          .all() as Array<{ status: string; count: number }>;

        const stats = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          dispatched: 0,
          failed: 0,
        };

        for (const r of rows) {
          stats.total += Number(r.count);
          if (r.status === 'PENDING_APPROVAL') stats.pending = Number(r.count);
          if (r.status === 'APPROVED') stats.approved = Number(r.count);
          if (r.status === 'REJECTED') stats.rejected = Number(r.count);
          if (r.status === 'DISPATCHED') stats.dispatched = Number(r.count);
          if (r.status === 'FAILED') stats.failed = Number(r.count);
        }

        return stats;
      } catch {}
    }

    const stats = {
      total: this.memoryItems.size,
      pending: 0,
      approved: 0,
      rejected: 0,
      dispatched: 0,
      failed: 0,
    };

    for (const it of this.memoryItems.values()) {
      if (it.status === 'PENDING_APPROVAL') stats.pending++;
      if (it.status === 'APPROVED') stats.approved++;
      if (it.status === 'REJECTED') stats.rejected++;
      if (it.status === 'DISPATCHED') stats.dispatched++;
      if (it.status === 'FAILED') stats.failed++;
    }

    return stats;
  }
}
export default ContentQueueRepository;
