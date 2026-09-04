import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type QueueStatus =
  | 'PENDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPATCHED'
  | 'FAILED'
  | 'POSTED';

export type TargetPlatform = 'reddit' | 'quora' | 'medium' | 'REDDIT' | string;
export type NetworkName = 'lospollos' | 'mylead' | 'organic' | string;
export type PostHealthStatus = 'POST_ACTIVE' | 'SHADOWBANNED_OR_REMOVED' | 'THREAD_LOCKED' | 'UNVERIFIED' | 'ERROR';

export interface ContentQueueItem {
  id: string;
  campaign_id: string;
  network: NetworkName;
  target_platform: TargetPlatform;
  platform?: string;
  subreddit?: string;
  target_url?: string;
  payload?: string;
  hook: string;
  body: string;
  stealth_cta: string;
  tracking_url: string;
  image_path: string;
  risk_score: number;
  status: QueueStatus;
  published_url?: string | null;
  health_status?: PostHealthStatus;
  live_upvotes?: number;
  last_health_check_at?: number;
  created_at: number;
  updated_at: number;
}

export interface EnqueueItemInput {
  id?: string;
  campaign_id?: string;
  network?: NetworkName;
  target_platform?: TargetPlatform;
  platform?: string;
  subreddit?: string;
  target_url?: string;
  payload?: string;
  hook: string;
  body: string;
  stealth_cta?: string;
  cta?: string;
  tracking_url?: string;
  image_path?: string;
  risk_score?: number;
  status?: QueueStatus;
  published_url?: string | null;
  health_status?: PostHealthStatus;
  live_upvotes?: number;
  last_health_check_at?: number;
  created_at?: number;
  updated_at?: number;
}

/**
 * Resolves the unified absolute database path for SQLite content queue
 */
export function resolveQueueDbPath(): string {
  if (process.env.SQLITE_DB_PATH) {
    return process.env.SQLITE_DB_PATH;
  }

  // Canonical production path on DigitalOcean server
  const PROD_PATH = '/var/www/affiliate/core/data/content_queue.sqlite';
  if (fs.existsSync('/var/www/affiliate/core/data') || process.platform === 'linux') {
    const dir = path.dirname(PROD_PATH);
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }
    return PROD_PATH;
  }

  // Local development fallback
  const localCandidates = [
    path.resolve(process.cwd(), 'core/data'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '.antigravity'),
  ];

  let localDir = localCandidates[0];
  for (const c of localCandidates) {
    if (fs.existsSync(c)) {
      localDir = c;
      break;
    }
  }

  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch {}
  }

  return path.join(localDir, 'content_queue.sqlite');
}

export class ContentQueueRepository {
  private static instance: ContentQueueRepository | null = null;
  private db: any = null;
  private isSqlite: boolean = false;
  private dbPath: string;
  private jsonPath: string;
  private memoryItems: Map<string, ContentQueueItem> = new Map();
  private changeListeners: Array<(event: string, data: any) => void> = [];

  private constructor() {
    this.dbPath = resolveQueueDbPath();
    const dbDir = path.dirname(this.dbPath);
    this.jsonPath = path.join(dbDir, 'content_queue.json');

    try {
      // Use built-in node:sqlite in Node.js 22+
      const sqliteModule = require('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        this.db = new sqliteModule.DatabaseSync(this.dbPath);
        this.isSqlite = true;
        this.initSchema();
        console.log(`[ContentQueueRepository] ✅ SQLite connected: ${this.dbPath}`);
      }
    } catch (err: any) {
      console.warn(`[ContentQueueRepository] node:sqlite initialization notice (${err.message}). Using JSON fallback.`);
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

  public getDbPath(): string {
    return this.dbPath;
  }

  public onQueueChange(fn: (event: string, data: any) => void): () => void {
    this.changeListeners.push(fn);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== fn);
    };
  }

  private notifyChange(event: string, data: any): void {
    for (const fn of this.changeListeners) {
      try {
        fn(event, data);
      } catch {}
    }
  }

  private initSchema(): void {
    if (!this.isSqlite || !this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS content_queue_v2 (
          id TEXT PRIMARY KEY,
          campaign_id TEXT NOT NULL,
          network TEXT NOT NULL DEFAULT 'organic',
          target_platform TEXT NOT NULL DEFAULT 'REDDIT',
          platform TEXT NOT NULL DEFAULT 'REDDIT',
          subreddit TEXT,
          target_url TEXT,
          hook TEXT NOT NULL,
          body TEXT NOT NULL,
          payload TEXT,
          stealth_cta TEXT NOT NULL DEFAULT '',
          tracking_url TEXT NOT NULL DEFAULT '',
          image_path TEXT NOT NULL DEFAULT '',
          risk_score INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'PENDING',
          published_url TEXT,
          health_status TEXT,
          live_upvotes INTEGER DEFAULT 0,
          last_health_check_at INTEGER,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_cq2_status ON content_queue_v2 (status);
        CREATE INDEX IF NOT EXISTS idx_cq2_campaign ON content_queue_v2 (campaign_id);
        CREATE INDEX IF NOT EXISTS idx_cq2_platform ON content_queue_v2 (platform);
        CREATE VIEW IF NOT EXISTS content_queue AS SELECT * FROM content_queue_v2;
      `);

      // Migrations for columns if table existed earlier
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN platform TEXT DEFAULT 'REDDIT'`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN subreddit TEXT`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN target_url TEXT`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN payload TEXT`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN health_status TEXT`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN live_upvotes INTEGER DEFAULT 0`); } catch {}
      try { this.db.exec(`ALTER TABLE content_queue_v2 ADD COLUMN last_health_check_at INTEGER`); } catch {}
    } catch (e: any) {
      console.warn('[ContentQueueRepository] Schema initialization note:', e.message);
    }
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
  public enqueue(item: EnqueueItemInput): ContentQueueItem {
    const id = item.id || crypto.randomUUID();
    const now = Date.now();
    const created_at = item.created_at || now;
    const updated_at = item.updated_at || now;
    const status: QueueStatus = item.status || 'PENDING';
    const published_url = item.published_url ?? null;
    const stealth_cta = item.stealth_cta || item.cta || '';
    const campaign_id = item.campaign_id || `warmup_${(item.subreddit || 'general').toLowerCase()}`;
    const network: NetworkName = item.network || (campaign_id.includes('mylead') ? 'mylead' : 'organic');
    const target_platform: TargetPlatform = item.target_platform || item.platform || 'REDDIT';
    const platform = (item.platform || item.target_platform || 'REDDIT').toUpperCase();
    const subreddit = item.subreddit || '';
    const target_url = item.target_url || item.tracking_url || '';
    const payload = item.payload || '';
    const image_path = item.image_path || '';
    const risk_score = item.risk_score || 0;

    const record: ContentQueueItem = {
      id,
      campaign_id,
      network,
      target_platform,
      platform,
      subreddit,
      target_url,
      payload,
      hook: item.hook,
      body: item.body,
      stealth_cta,
      tracking_url: item.tracking_url || target_url,
      image_path,
      risk_score,
      status,
      published_url,
      created_at,
      updated_at,
    };

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO content_queue_v2 (
            id, campaign_id, network, target_platform, platform, subreddit, target_url, hook, body, payload, stealth_cta, tracking_url, image_path, risk_score, status, published_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(
          id,
          record.campaign_id,
          record.network,
          record.target_platform,
          record.platform,
          record.subreddit,
          record.target_url,
          record.hook,
          record.body,
          record.payload,
          record.stealth_cta,
          record.tracking_url,
          record.image_path,
          record.risk_score,
          status,
          published_url,
          created_at,
          updated_at
        );
        this.notifyChange('enqueue', record);
        return record;
      } catch (err: any) {
        console.error('[ContentQueueRepository] SQLite insert error:', err.message);
      }
    }

    this.memoryItems.set(id, record);
    this.saveJsonDb();
    this.notifyChange('enqueue', record);
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
   * Updates health verification status and live upvotes
   */
  public updateHealth(id: string, healthStatus: PostHealthStatus, liveUpvotes?: number): boolean {
    const now = Date.now();
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          UPDATE content_queue_v2
          SET health_status = ?, live_upvotes = ?, last_health_check_at = ?, updated_at = ?
          WHERE id = ?
        `);
        stmt.run(healthStatus, liveUpvotes || 0, now, now, id);
      } catch {}
    }

    const item = this.memoryItems.get(id);
    if (item) {
      item.health_status = healthStatus;
      if (liveUpvotes !== undefined) item.live_upvotes = liveUpvotes;
      item.last_health_check_at = now;
      item.updated_at = now;
      this.saveJsonDb();
      return true;
    }
    return true;
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
    this.notifyChange('clear', {});
  }

  /**
   * List all pending items awaiting human review
   */
  public listPending(limit: number = 200): ContentQueueItem[] {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM content_queue_v2
          WHERE status IN ('PENDING', 'PENDING_APPROVAL')
          ORDER BY created_at DESC
          LIMIT ?
        `);
        return stmt.all(limit) as unknown as ContentQueueItem[];
      } catch {}
    }

    return Array.from(this.memoryItems.values())
      .filter((it) => it.status === 'PENDING' || it.status === 'PENDING_APPROVAL')
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
  }

  /**
   * List all dispatched items created within window
   */
  public listDispatched(sinceTimestamp: number = Date.now() - 72 * 3600 * 1000, limit: number = 100): ContentQueueItem[] {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM content_queue_v2
          WHERE status IN ('DISPATCHED', 'POSTED') AND updated_at >= ?
          ORDER BY updated_at DESC
          LIMIT ?
        `);
        return stmt.all(sinceTimestamp, limit) as unknown as ContentQueueItem[];
      } catch {}
    }

    return Array.from(this.memoryItems.values())
      .filter((it) => (it.status === 'DISPATCHED' || it.status === 'POSTED') && it.updated_at >= sinceTimestamp)
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, limit);
  }

  /**
   * List all approved items ready for stealth dispatch
   */
  public listApproved(limit: number = 100): ContentQueueItem[] {
    return this.listAll('APPROVED', limit);
  }

  /**
   * List all items by status or all without artificial date cutoffs
   */
  public listAll(status?: QueueStatus | string, limit?: number): ContentQueueItem[] {
    const maxLimit = typeof limit === 'number' && limit > 0 ? limit : 1000;
    if (this.isSqlite && this.db) {
      try {
        if (status) {
          if (status === 'PENDING' || status === 'PENDING_APPROVAL') {
            const stmt = this.db.prepare(`
              SELECT * FROM content_queue_v2
              WHERE status IN ('PENDING', 'PENDING_APPROVAL')
              ORDER BY created_at DESC
              LIMIT ?
            `);
            return stmt.all(maxLimit) as unknown as ContentQueueItem[];
          } else {
            const stmt = this.db.prepare(`
              SELECT * FROM content_queue_v2
              WHERE status = ?
              ORDER BY created_at DESC
              LIMIT ?
            `);
            return stmt.all(status, maxLimit) as unknown as ContentQueueItem[];
          }
        } else {
          const stmt = this.db.prepare(`
            SELECT * FROM content_queue_v2
            ORDER BY created_at DESC
            LIMIT ?
          `);
          return stmt.all(maxLimit) as unknown as ContentQueueItem[];
        }
      } catch (e: any) {
        console.error('[ContentQueueRepository] SQLite listAll error:', e.message);
      }
    }

    let items = Array.from(this.memoryItems.values());
    if (status) {
      if (status === 'PENDING' || status === 'PENDING_APPROVAL') {
        items = items.filter((it) => it.status === 'PENDING' || it.status === 'PENDING_APPROVAL');
      } else {
        items = items.filter((it) => it.status === status);
      }
    }
    return items.sort((a, b) => b.created_at - a.created_at).slice(0, maxLimit);
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
   * Alias for getItem()
   */
  public fetchById(id: string): ContentQueueItem | null {
    return this.getItem(id);
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
        this.notifyChange('update', updated);
        return true;
      } catch {}
    }

    this.memoryItems.set(id, updated);
    this.saveJsonDb();
    this.notifyChange('update', updated);
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
        this.notifyChange('status_change', { id, status, published_url });
        return true;
      } catch {}
    }

    const item = this.memoryItems.get(id);
    if (item) {
      item.status = status;
      if (published_url !== undefined) item.published_url = published_url;
      item.updated_at = now;
      this.saveJsonDb();
      this.notifyChange('status_change', { id, status, published_url });
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
        this.notifyChange('delete', { id });
        return true;
      } catch {}
    }

    const deleted = this.memoryItems.delete(id);
    if (deleted) {
      this.saveJsonDb();
      this.notifyChange('delete', { id });
    }
    return deleted;
  }

  /**
   * Batch process items (approve, reject, delete) transactionally
   */
  public batchProcess(
    ids: string[],
    action: 'approve' | 'reject' | 'delete'
  ): { successCount: number; failedCount: number } {
    if (!ids || ids.length === 0) {
      return { successCount: 0, failedCount: 0 };
    }

    const now = Date.now();
    let successCount = 0;
    let failedCount = 0;

    if (this.isSqlite && this.db) {
      try {
        if (action === 'delete') {
          const deleteTx = this.db.transaction((targetIds: string[]) => {
            const stmt = this.db.prepare(`DELETE FROM content_queue_v2 WHERE id = ?`);
            for (const id of targetIds) {
              const res = stmt.run(id);
              if (res.changes && res.changes > 0) {
                successCount++;
              }
            }
          });
          deleteTx(ids);
        } else {
          const targetStatus: QueueStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
          const updateTx = this.db.transaction((targetIds: string[]) => {
            const stmt = this.db.prepare(
              `UPDATE content_queue_v2 SET status = ?, updated_at = ? WHERE id = ?`
            );
            for (const id of targetIds) {
              const res = stmt.run(targetStatus, now, id);
              if (res.changes && res.changes > 0) {
                successCount++;
              }
            }
          });
          updateTx(ids);
        }
      } catch (err: any) {
        console.error('[ContentQueueRepository] Batch transaction error:', err.message);
        failedCount = ids.length - successCount;
      }
    }

    // Update in-memory cache as well
    for (const id of ids) {
      if (action === 'delete') {
        const deleted = this.memoryItems.delete(id);
        if (deleted && (!this.isSqlite || !this.db)) successCount++;
      } else {
        const item = this.memoryItems.get(id);
        if (item) {
          item.status = action === 'approve' ? 'APPROVED' : 'REJECTED';
          item.updated_at = now;
          if (!this.isSqlite || !this.db) successCount++;
        }
      }
    }

    this.saveJsonDb();
    this.notifyChange('batch_update', { action, ids, successCount });
    return { successCount, failedCount };
  }

  /**
   * Get Queue Statistics
   */
  public getStats(): {
    total: number;
    pending: number;
    pendingApproval: number;
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
          pendingApproval: 0,
          approved: 0,
          rejected: 0,
          dispatched: 0,
          failed: 0,
        };

        for (const r of rows) {
          stats.total += Number(r.count);
          if (r.status === 'PENDING' || r.status === 'PENDING_APPROVAL') {
            stats.pending += Number(r.count);
            stats.pendingApproval += Number(r.count);
          }
          if (r.status === 'APPROVED') stats.approved += Number(r.count);
          if (r.status === 'REJECTED') stats.rejected += Number(r.count);
          if (r.status === 'DISPATCHED' || r.status === 'POSTED') stats.dispatched += Number(r.count);
          if (r.status === 'FAILED') stats.failed += Number(r.count);
        }

        return stats;
      } catch {}
    }

    const stats = {
      total: this.memoryItems.size,
      pending: 0,
      pendingApproval: 0,
      approved: 0,
      rejected: 0,
      dispatched: 0,
      failed: 0,
    };

    for (const it of this.memoryItems.values()) {
      if (it.status === 'PENDING' || it.status === 'PENDING_APPROVAL') {
        stats.pending++;
        stats.pendingApproval++;
      }
      if (it.status === 'APPROVED') stats.approved++;
      if (it.status === 'REJECTED') stats.rejected++;
      if (it.status === 'DISPATCHED' || it.status === 'POSTED') stats.dispatched++;
      if (it.status === 'FAILED') stats.failed++;
    }

    return stats;
  }
}

export default ContentQueueRepository;
