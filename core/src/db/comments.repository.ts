import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { resolveQueueDbPath } from './queueRepository.js';

export type SubmissionStatus = 'VERIFIED' | 'FLAGGED_AUTO' | 'REJECTED';

export interface CaseSubmission {
  id: string;
  post_slug: string;
  author_callsign: string;
  incident_type: string;
  evidence_text: string;
  status: SubmissionStatus;
  risk_score: number;
  moderation_flags: string;
  ip_hash: string;
  user_agent_hash?: string;
  created_at: string;
}

export class CommentsRepository {
  private static instance: CommentsRepository | null = null;
  private db: any = null;
  private isSqlite: boolean = false;
  private dbPath: string;
  private memorySubmissions: Map<string, CaseSubmission> = new Map();

  private constructor() {
    this.dbPath = resolveQueueDbPath();

    try {
      // Use built-in node:sqlite in Node.js 22+
      const sqliteModule = require('node:sqlite');
      if (sqliteModule && sqliteModule.DatabaseSync) {
        this.db = new sqliteModule.DatabaseSync(this.dbPath);
        this.db.exec("PRAGMA journal_mode = WAL;");
        this.db.exec("PRAGMA busy_timeout = 5000;");
        this.db.exec("PRAGMA synchronous = NORMAL;");
        this.isSqlite = true;
        this.initSchema();
        console.log(`[CommentsRepository] ✅ SQLite connected: ${this.dbPath}`);
      }
    } catch (err: any) {
      console.warn(`[CommentsRepository] node:sqlite notice (${err.message}). Using in-memory fallback.`);
      this.isSqlite = false;
    }
  }

  public static getInstance(): CommentsRepository {
    if (!this.instance) {
      this.instance = new CommentsRepository();
    }
    return this.instance;
  }

  private initSchema(): void {
    if (!this.isSqlite || !this.db) return;

    const schemaSql = `
      CREATE TABLE IF NOT EXISTS case_submissions (
        id TEXT PRIMARY KEY,
        post_slug TEXT NOT NULL,
        author_callsign TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        evidence_text TEXT NOT NULL,
        status TEXT CHECK(status IN ('VERIFIED', 'FLAGGED_AUTO', 'REJECTED')) DEFAULT 'VERIFIED',
        risk_score INTEGER DEFAULT 0,
        moderation_flags TEXT,
        ip_hash TEXT NOT NULL,
        user_agent_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_case_submissions_slug ON case_submissions(post_slug, status);
      CREATE INDEX IF NOT EXISTS idx_case_submissions_ip_time ON case_submissions(ip_hash, created_at);
    `;

    this.db.exec(schemaSql);
  }

  public getVerifiedBySlug(postSlug: string): CaseSubmission[] {
    const cleanSlug = postSlug.replace(/^\/+|\/+$/g, '');

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT id, post_slug, author_callsign, incident_type, evidence_text, status, risk_score, moderation_flags, created_at
          FROM case_submissions
          WHERE post_slug = ? AND status = 'VERIFIED'
          ORDER BY created_at DESC
          LIMIT 50
        `);
        return stmt.all(cleanSlug) as CaseSubmission[];
      } catch (err: any) {
        console.error(`[CommentsRepository] Failed to query submissions: ${err.message}`);
        return [];
      }
    }

    // Memory fallback
    return Array.from(this.memorySubmissions.values())
      .filter((s) => s.post_slug === cleanSlug && s.status === 'VERIFIED')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getRecentCountByIp(ipHash: string, windowSeconds: number = 600): number {
    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          SELECT count(*) as cnt
          FROM case_submissions
          WHERE ip_hash = ? AND created_at >= datetime('now', '-' || ? || ' seconds')
        `);
        const row = stmt.get(ipHash, windowSeconds) as { cnt: number } | undefined;
        return row ? Number(row.cnt) : 0;
      } catch (err: any) {
        console.warn(`[CommentsRepository] IP count query notice: ${err.message}`);
        return 0;
      }
    }

    const cutoff = Date.now() - windowSeconds * 1000;
    return Array.from(this.memorySubmissions.values()).filter(
      (s) => s.ip_hash === ipHash && new Date(s.created_at).getTime() >= cutoff
    ).length;
  }

  public insertSubmission(item: {
    post_slug: string;
    author_callsign: string;
    incident_type: string;
    evidence_text: string;
    status: SubmissionStatus;
    risk_score: number;
    moderation_flags: string;
    ip_hash: string;
    user_agent_hash?: string;
  }): CaseSubmission {
    const id = `CN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const cleanSlug = item.post_slug.replace(/^\/+|\/+$/g, '');
    const nowIso = new Date().toISOString();

    const record: CaseSubmission = {
      id,
      post_slug: cleanSlug,
      author_callsign: item.author_callsign,
      incident_type: item.incident_type,
      evidence_text: item.evidence_text,
      status: item.status,
      risk_score: item.risk_score,
      moderation_flags: item.moderation_flags,
      ip_hash: item.ip_hash,
      user_agent_hash: item.user_agent_hash || '',
      created_at: nowIso,
    };

    if (this.isSqlite && this.db) {
      try {
        const stmt = this.db.prepare(`
          INSERT INTO case_submissions (
            id, post_slug, author_callsign, incident_type, evidence_text,
            status, risk_score, moderation_flags, ip_hash, user_agent_hash, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `);
        stmt.run(
          record.id,
          record.post_slug,
          record.author_callsign,
          record.incident_type,
          record.evidence_text,
          record.status,
          record.risk_score,
          record.moderation_flags,
          record.ip_hash,
          record.user_agent_hash
        );

        // Fetch inserted row to get actual SQLite timestamp
        const fetchStmt = this.db.prepare(`SELECT * FROM case_submissions WHERE id = ?`);
        const inserted = fetchStmt.get(record.id) as CaseSubmission | undefined;
        if (inserted) return inserted;
      } catch (err: any) {
        console.error(`[CommentsRepository] Error inserting submission: ${err.message}`);
      }
    }

    this.memorySubmissions.set(id, record);
    return record;
  }
}
