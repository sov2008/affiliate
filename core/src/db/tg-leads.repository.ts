import fs from 'fs';
import path from 'path';

export type TgLeadStatus = 'QUIZ_IN_PROGRESS' | 'QUIZ_COMPLETED' | 'CONVERTED';

export interface TgLeadItem {
  chat_id: string;
  username?: string;
  first_name?: string;
  age_range?: string;
  connection_type?: string;
  source?: string;
  status: TgLeadStatus;
  tracking_url?: string;
  selected_offer?: string;
  drip_step?: number;
  last_drip_at?: number;
  created_at: number;
  updated_at: number;
}

export interface MabArmRecord {
  offer_id: string;
  network: string;
  impressions: number;
  conversions: number;
  revenue: number;
  epc: number;
  updated_at: number;
}

export interface ClickAttributionRecord {
  click_id: string;
  chat_id: string;
  offer_id: string;
  created_at: number;
}

export interface BridgeClickRecord {
  id?: number;
  source: string;
  sub_source?: string;
  ip?: string;
  user_agent?: string;
  referer?: string;
  created_at: number;
}

export class TelegramLeadRepository {
  private static instance: TelegramLeadRepository | null = null;
  private db: any = null;
  private isSqlite: boolean = false;
  private dbPath: string;
  private jsonPath: string;
  private memoryItems: Map<string, TgLeadItem> = new Map();
  private mabMemoryArms: Map<string, MabArmRecord> = new Map();
  private clickAttributionsMemory: Map<string, ClickAttributionRecord> = new Map();
  private bridgeClicksMemory: BridgeClickRecord[] = [];

  private constructor(customDbDir?: string) {
    const defaultDir = customDbDir || this.resolveStorageDirectory();
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }

    this.dbPath = path.join(defaultDir, 'tg_leads.db');
    this.jsonPath = path.join(defaultDir, 'tg_leads.json');

    try {
      // Use built-in node:sqlite in Node.js 22+
      const sqliteModule = require('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        this.db = new sqliteModule.DatabaseSync(this.dbPath);
        this.isSqlite = true;
        this.initSchema();
      }
    } catch {
      this.isSqlite = false;
      this.loadJsonDb();
    }
  }

  public static getInstance(customDbDir?: string): TelegramLeadRepository {
    if (!this.instance || (customDbDir && path.dirname(this.instance.dbPath) !== customDbDir)) {
      this.instance = new TelegramLeadRepository(customDbDir);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance && this.instance.db && typeof this.instance.db.close === 'function') {
      try {
        this.instance.db.close();
      } catch {}
    }
    this.instance = null;
  }

  private resolveStorageDirectory(): string {
    const candidates = [
      path.resolve(process.cwd(), 'core/data'),
      path.resolve(process.cwd(), 'data'),
      path.resolve(process.cwd(), '.antigravity'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return c;
      }
    }
    return path.resolve(process.cwd(), 'core/data');
  }

  private initSchema(): void {
    if (!this.isSqlite || !this.db) return;
    try {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS tg_leads (
          chat_id TEXT PRIMARY KEY,
          username TEXT,
          first_name TEXT,
          age_range TEXT,
          connection_type TEXT,
          source TEXT DEFAULT 'reddit_dating',
          status TEXT NOT NULL,
          tracking_url TEXT,
          selected_offer TEXT,
          drip_step INTEGER DEFAULT 0,
          last_drip_at INTEGER DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_tg_leads_status ON tg_leads (status);

        CREATE TABLE IF NOT EXISTS mab_arms (
          offer_id TEXT PRIMARY KEY,
          network TEXT NOT NULL,
          impressions INTEGER DEFAULT 0,
          conversions INTEGER DEFAULT 0,
          revenue REAL DEFAULT 0,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS click_attributions (
          click_id TEXT PRIMARY KEY,
          chat_id TEXT NOT NULL,
          offer_id TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_click_attr_chat ON click_attributions (chat_id);

        CREATE TABLE IF NOT EXISTS bridge_clicks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          source TEXT NOT NULL,
          sub_source TEXT,
          ip TEXT,
          user_agent TEXT,
          referer TEXT,
          created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_bridge_clicks_src ON bridge_clicks (source, created_at);
      `);

      // Gentle migration for existing tables
      try {
        this.db.exec(`ALTER TABLE tg_leads ADD COLUMN drip_step INTEGER DEFAULT 0;`);
      } catch {}
      try {
        this.db.exec(`ALTER TABLE tg_leads ADD COLUMN last_drip_at INTEGER DEFAULT 0;`);
      } catch {}
      try {
        this.db.exec(`ALTER TABLE tg_leads ADD COLUMN selected_offer TEXT;`);
      } catch {}
      try {
        this.db.exec(`ALTER TABLE tg_leads ADD COLUMN source TEXT DEFAULT 'reddit_dating';`);
      } catch {}

      // Create index after ensuring columns exist
      try {
        this.db.exec(`CREATE INDEX IF NOT EXISTS idx_tg_leads_drip ON tg_leads (status, drip_step, updated_at);`);
      } catch {}
    } catch (err: unknown) {
      console.warn('[TelegramLeadRepository] Schema initialization note:', err);
    }
  }

  private loadJsonDb(): void {
    try {
      if (fs.existsSync(this.jsonPath)) {
        const raw = fs.readFileSync(this.jsonPath, 'utf8');
        const items = JSON.parse(raw);
        if (Array.isArray(items)) {
          for (const item of items) {
            this.memoryItems.set(item.chat_id, item);
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
   * Save or update lead in SQLite
   */
  public saveLead(lead: {
    chat_id: string | number;
    username?: string;
    first_name?: string;
    age_range?: string;
    connection_type?: string;
    source?: string;
    status: TgLeadStatus;
    tracking_url?: string;
    selected_offer?: string;
    drip_step?: number;
    last_drip_at?: number;
    created_at?: number;
    updated_at?: number;
  }): TgLeadItem {
    const chatIdStr = String(lead.chat_id);
    const now = Date.now();
    const existing = this.getLead(chatIdStr);

    const record: TgLeadItem = {
      chat_id: chatIdStr,
      username: lead.username !== undefined ? lead.username : existing?.username,
      first_name: lead.first_name !== undefined ? lead.first_name : existing?.first_name,
      age_range: lead.age_range !== undefined ? lead.age_range : existing?.age_range,
      connection_type: lead.connection_type !== undefined ? lead.connection_type : existing?.connection_type,
      source: lead.source !== undefined ? lead.source : (existing?.source || 'reddit_dating'),
      status: lead.status,
      tracking_url: lead.tracking_url !== undefined ? lead.tracking_url : existing?.tracking_url,
      selected_offer: lead.selected_offer !== undefined ? lead.selected_offer : existing?.selected_offer,
      drip_step: lead.drip_step !== undefined ? lead.drip_step : (existing?.drip_step ?? 0),
      last_drip_at: lead.last_drip_at !== undefined ? lead.last_drip_at : (existing?.last_drip_at ?? 0),
      created_at: lead.created_at !== undefined ? lead.created_at : (existing ? existing.created_at : now),
      updated_at: lead.updated_at !== undefined ? lead.updated_at : now,
    };

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO tg_leads (chat_id, username, first_name, age_range, connection_type, source, status, tracking_url, selected_offer, drip_step, last_drip_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(chat_id) DO UPDATE SET
            username = excluded.username,
            first_name = excluded.first_name,
            age_range = excluded.age_range,
            connection_type = excluded.connection_type,
            source = COALESCE(excluded.source, tg_leads.source),
            status = excluded.status,
            tracking_url = excluded.tracking_url,
            selected_offer = excluded.selected_offer,
            drip_step = excluded.drip_step,
            last_drip_at = excluded.last_drip_at,
            updated_at = excluded.updated_at
        `);
        stmt.run(
          record.chat_id,
          record.username || null,
          record.first_name || null,
          record.age_range || null,
          record.connection_type || null,
          record.source || 'reddit_dating',
          record.status,
          record.tracking_url || null,
          record.selected_offer || null,
          record.drip_step ?? 0,
          record.last_drip_at ?? 0,
          record.created_at,
          record.updated_at
        );
      } catch (err) {
        console.error('[TelegramLeadRepository] SQLite save error:', err);
      }
    }

    this.memoryItems.set(chatIdStr, record);
    this.saveJsonDb();

    return record;
  }

  /**
   * Fetch lead by chat_id
   */
  public getLead(chat_id: string | number): TgLeadItem | null {
    const chatIdStr = String(chat_id);

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`SELECT * FROM tg_leads WHERE chat_id = ?`);
        const row = stmt.get(chatIdStr);
        if (row) {
          return {
            chat_id: String(row.chat_id),
            username: row.username || undefined,
            first_name: row.first_name || undefined,
            age_range: row.age_range || undefined,
            connection_type: row.connection_type || undefined,
            source: row.source || 'reddit_dating',
            status: row.status as TgLeadStatus,
            tracking_url: row.tracking_url || undefined,
            selected_offer: row.selected_offer || undefined,
            drip_step: Number(row.drip_step || 0),
            last_drip_at: Number(row.last_drip_at || 0),
            created_at: Number(row.created_at),
            updated_at: Number(row.updated_at),
          };
        }
        return null;
      } catch {
        return this.memoryItems.get(chatIdStr) || null;
      }
    }

    return this.memoryItems.get(chatIdStr) || null;
  }

  /**
   * Updates lead status (e.g. to CONVERTED upon postback)
   */
  public updateLeadStatus(chat_id: string | number, status: TgLeadStatus): boolean {
    const chatIdStr = String(chat_id);
    const existing = this.getLead(chatIdStr);
    if (!existing) return false;

    this.saveLead({
      ...existing,
      status,
    });
    return true;
  }

  /**
   * Fetches leads eligible for a specific drip retention step.
   * Lead must be in QUIZ_COMPLETED, not CONVERTED, with drip_step = step - 1,
   * and age between minAgeMs and maxAgeMs.
   */
  public getLeadsForDrip(step: number, minAgeMs: number, maxAgeMs: number): TgLeadItem[] {
    const prevStep = step - 1;
    const now = Date.now();
    const minThreshold = now - minAgeMs;
    const maxThreshold = now - maxAgeMs;

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT * FROM tg_leads 
          WHERE status = 'QUIZ_COMPLETED' 
            AND status != 'CONVERTED'
            AND drip_step = ?
            AND updated_at <= ?
            AND updated_at >= ?
          ORDER BY updated_at ASC
        `);
        const rows = stmt.all(prevStep, minThreshold, maxThreshold);
        return rows.map((row: any) => ({
          chat_id: String(row.chat_id),
          username: row.username || undefined,
          first_name: row.first_name || undefined,
          age_range: row.age_range || undefined,
          connection_type: row.connection_type || undefined,
          status: row.status as TgLeadStatus,
          tracking_url: row.tracking_url || undefined,
          drip_step: Number(row.drip_step || 0),
          last_drip_at: Number(row.last_drip_at || 0),
          created_at: Number(row.created_at),
          updated_at: Number(row.updated_at),
        }));
      } catch (err) {
        console.warn('[TelegramLeadRepository] getLeadsForDrip SQLite query fallback:', err);
      }
    }

    // JSON / Memory fallback
    return Array.from(this.memoryItems.values()).filter((item) => {
      const isCompleted = item.status === 'QUIZ_COMPLETED';
      const isNotConverted = item.status !== 'CONVERTED';
      const currentStep = item.drip_step ?? 0;
      const stepMatches = currentStep === prevStep;
      const ageMatches = item.updated_at <= minThreshold && item.updated_at >= maxThreshold;
      return isCompleted && isNotConverted && stepMatches && ageMatches;
    });
  }

  /**
   * Increments the drip step for a lead and records timestamp
   */
  public incrementDripStep(chat_id: string | number, step: number): boolean {
    const chatIdStr = String(chat_id);
    const existing = this.getLead(chatIdStr);
    if (!existing) return false;

    this.saveLead({
      ...existing,
      drip_step: step,
      last_drip_at: Date.now(),
    });
    return true;
  }

  /**
   * Returns all stored leads
   */
  public getAllLeads(): TgLeadItem[] {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`SELECT * FROM tg_leads ORDER BY updated_at DESC`);
        const rows = stmt.all();
        return rows.map((row: any) => ({
          chat_id: String(row.chat_id),
          username: row.username || undefined,
          first_name: row.first_name || undefined,
          age_range: row.age_range || undefined,
          connection_type: row.connection_type || undefined,
          status: row.status as TgLeadStatus,
          tracking_url: row.tracking_url || undefined,
          drip_step: Number(row.drip_step || 0),
          last_drip_at: Number(row.last_drip_at || 0),
          created_at: Number(row.created_at),
          updated_at: Number(row.updated_at),
        }));
      } catch {
        return Array.from(this.memoryItems.values());
      }
    }
    return Array.from(this.memoryItems.values());
  }

  // --- MAB Arms SQLite Atomic Transactions ---

  /**
   * Records an impression for a MAB offer arm atomically in SQLite
   */
  public recordMabImpression(offerId: string, network: string): void {
    const now = Date.now();
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO mab_arms (offer_id, network, impressions, conversions, revenue, updated_at)
          VALUES (?, ?, 1, 0, 0.0, ?)
          ON CONFLICT(offer_id) DO UPDATE SET
            impressions = mab_arms.impressions + 1,
            updated_at = excluded.updated_at
        `);
        stmt.run(offerId, network, now);
        return;
      } catch (err) {
        console.error('[TelegramLeadRepository] SQLite recordMabImpression error:', err);
      }
    }

    // In-memory fallback
    const prev = this.mabMemoryArms.get(offerId) || {
      offer_id: offerId,
      network,
      impressions: 0,
      conversions: 0,
      revenue: 0,
      epc: 0,
      updated_at: now,
    };
    prev.impressions++;
    prev.updated_at = now;
    const safeImp = Math.max(1, prev.impressions);
    prev.epc = prev.revenue > 0 ? prev.revenue / safeImp : 0;
    this.mabMemoryArms.set(offerId, prev);
  }

  /**
   * Records a conversion and reward payout for a MAB offer arm atomically in SQLite
   */
  public recordMabConversion(offerId: string, payout: number): void {
    const now = Date.now();
    const cleanPayout = Math.max(0, payout);

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO mab_arms (offer_id, network, impressions, conversions, revenue, updated_at)
          VALUES (?, 'unknown', 0, 1, ?, ?)
          ON CONFLICT(offer_id) DO UPDATE SET
            conversions = mab_arms.conversions + 1,
            revenue = mab_arms.revenue + excluded.revenue,
            updated_at = excluded.updated_at
        `);
        stmt.run(offerId, cleanPayout, now);
        return;
      } catch (err) {
        console.error('[TelegramLeadRepository] SQLite recordMabConversion error:', err);
      }
    }

    // In-memory fallback
    const prev = this.mabMemoryArms.get(offerId) || {
      offer_id: offerId,
      network: 'unknown',
      impressions: 0,
      conversions: 0,
      revenue: 0,
      epc: 0,
      updated_at: now,
    };
    prev.conversions++;
    prev.revenue += cleanPayout;
    prev.updated_at = now;
    const safeImp = Math.max(1, prev.impressions);
    prev.epc = prev.revenue > 0 ? prev.revenue / safeImp : 0;
    this.mabMemoryArms.set(offerId, prev);
  }

  /**
   * Fetches all MAB offer arms with calculated EPC
   */
  public getMabArms(): MabArmRecord[] {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`SELECT * FROM mab_arms ORDER BY offer_id ASC`);
        const rows = stmt.all();
        return rows.map((r: any) => {
          const imp = Number(r.impressions || 0);
          const rev = Number(r.revenue || 0);
          const safeImp = Math.max(1, imp);
          return {
            offer_id: String(r.offer_id),
            network: String(r.network || 'unknown'),
            impressions: imp,
            conversions: Number(r.conversions || 0),
            revenue: rev,
            epc: rev > 0 ? rev / safeImp : 0,
            updated_at: Number(r.updated_at || 0),
          };
        });
      } catch {
        return Array.from(this.mabMemoryArms.values());
      }
    }

    return Array.from(this.mabMemoryArms.values());
  }

  // --- Click Attribution Bridge ---

  /**
   * Saves unique click_id to chat_id mapping
   */
  public saveClickAttribution(clickId: string, chatId: string | number, offerId: string): void {
    const now = Date.now();
    const chatIdStr = String(chatId);

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO click_attributions (click_id, chat_id, offer_id, created_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(click_id) DO NOTHING
        `);
        stmt.run(clickId, chatIdStr, offerId, now);
        return;
      } catch (err) {
        console.error('[TelegramLeadRepository] SQLite saveClickAttribution error:', err);
      }
    }

    this.clickAttributionsMemory.set(clickId, {
      click_id: clickId,
      chat_id: chatIdStr,
      offer_id: offerId,
      created_at: now,
    });
  }

  /**
   * Resolves click_id back to chat_id and offer_id
   */
  public resolveClickAttribution(clickId: string): { chat_id: string; offer_id: string } | null {
    if (!clickId) return null;

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`SELECT chat_id, offer_id FROM click_attributions WHERE click_id = ?`);
        const row = stmt.get(clickId);
        if (row) {
          return {
            chat_id: String(row.chat_id),
            offer_id: String(row.offer_id),
          };
        }
      } catch {}
    }

    const mem = this.clickAttributionsMemory.get(clickId);
    if (mem) {
      return { chat_id: mem.chat_id, offer_id: mem.offer_id };
    }

    return null;
  }

  // --- Bridge Gateway Click Logging ---

  /**
   * Records an incoming click through the deep-link bridge gateway (/join/:source)
   */
  public recordBridgeClick(
    source: string,
    subSource?: string,
    ip?: string,
    userAgent?: string,
    referer?: string
  ): void {
    const now = Date.now();
    const cleanSource = (source || 'direct').trim().toLowerCase();
    const cleanSub = (subSource || 'direct').trim().toLowerCase();

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO bridge_clicks (source, sub_source, ip, user_agent, referer, created_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run(cleanSource, cleanSub, ip || null, userAgent || null, referer || null, now);
        return;
      } catch (err) {
        console.error('[TelegramLeadRepository] SQLite recordBridgeClick error:', err);
      }
    }

    this.bridgeClicksMemory.push({
      source: cleanSource,
      sub_source: cleanSub,
      ip,
      user_agent: userAgent,
      referer,
      created_at: now,
    });
  }

  /**
   * Retrieves logged bridge clicks for verification and analytics
   */
  public getBridgeClicks(source?: string, limit: number = 100): BridgeClickRecord[] {
    if (this.isSqlite && this.db) {
      try {
        if (source) {
          const stmt = this.db.prepare(
            `SELECT * FROM bridge_clicks WHERE source = ? ORDER BY created_at DESC LIMIT ?`
          );
          return stmt.all(source.toLowerCase(), limit);
        } else {
          const stmt = this.db.prepare(
            `SELECT * FROM bridge_clicks ORDER BY created_at DESC LIMIT ?`
          );
          return stmt.all(limit);
        }
      } catch {
        return this.bridgeClicksMemory.slice(-limit);
      }
    }

    return this.bridgeClicksMemory
      .filter((c) => !source || c.source === source.toLowerCase())
      .slice(-limit);
  }
}
