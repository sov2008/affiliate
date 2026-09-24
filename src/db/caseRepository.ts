import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DeepTraceReportDTO } from '../types/deeptrace';

export interface CaseRecord {
  case_ref: string;
  report_id: string;
  trust_score: number;
  risk_level: string;
  platform: string;
  claimed_location: string | null;
  report_json: string;
  created_at: string;
  views_count: number;
  report: DeepTraceReportDTO;
}

/**
 * Resolves standard SQLite database file path across core and web workspaces
 */
export function resolveDatabasePath(customPath?: string): string {
  if (customPath) {
    if (customPath !== ':memory:') {
      const dir = path.dirname(path.resolve(customPath));
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
    return customPath;
  }

  if (process.env.DEEPTRACE_DB_PATH) {
    const p = path.resolve(process.env.DEEPTRACE_DB_PATH);
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return p;
  }

  // Check core/data directory first (aligned with content_queue.sqlite)
  const coreDataDir = path.resolve(process.cwd(), 'core/data');
  if (fs.existsSync(coreDataDir)) {
    return path.join(coreDataDir, 'deeptrace_cases.sqlite');
  }

  // Fallback to local data/ directory
  const localDataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(localDataDir)) {
    fs.mkdirSync(localDataDir, { recursive: true });
  }
  return path.join(localDataDir, 'deeptrace_cases.sqlite');
}

export class CaseRepository {
  private db: DatabaseSync;
  private dbPath: string;

  constructor(customPath?: string) {
    this.dbPath = resolveDatabasePath(customPath);
    this.db = new DatabaseSync(this.dbPath);
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS deeptrace_cases (
        case_ref TEXT PRIMARY KEY,
        report_id TEXT NOT NULL,
        trust_score REAL NOT NULL,
        risk_level TEXT NOT NULL,
        platform TEXT NOT NULL,
        claimed_location TEXT,
        report_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        views_count INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_deeptrace_cases_created ON deeptrace_cases(created_at);
      CREATE INDEX IF NOT EXISTS idx_deeptrace_cases_score ON deeptrace_cases(trust_score);
    `);
  }

  /**
   * Persists a validated DeepTrace report
   */
  public saveCase(
    report: DeepTraceReportDTO,
    platformOverride?: string,
    locationOverride?: string
  ): void {
    const caseRef = report.caseReference;
    const reportId = report.reportId;
    const trustScore = report.overallTrustIndex.score;
    const riskLevel = report.overallTrustIndex.riskLevel;
    const platform =
      platformOverride ||
      report.inputMetadata?.platformType ||
      'OTHER';
    const claimedLocation =
      locationOverride ||
      report.inputMetadata?.declaredLocation ||
      null;
    const reportJson = JSON.stringify(report);
    const createdAt = report.analyzedAt || new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO deeptrace_cases (
        case_ref,
        report_id,
        trust_score,
        risk_level,
        platform,
        claimed_location,
        report_json,
        created_at,
        views_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
      ON CONFLICT(case_ref) DO UPDATE SET
        report_json = excluded.report_json,
        trust_score = excluded.trust_score,
        risk_level = excluded.risk_level,
        claimed_location = excluded.claimed_location,
        platform = excluded.platform;
    `);

    stmt.run(
      caseRef,
      reportId,
      trustScore,
      riskLevel,
      platform,
      claimedLocation,
      reportJson,
      createdAt
    );
  }

  /**
   * Retrieves full report DTO by case reference
   */
  public getCaseByRef(caseRef: string): DeepTraceReportDTO | null {
    const record = this.getCaseRecord(caseRef);
    return record ? record.report : null;
  }

  /**
   * Retrieves full database case record with view count and metadata
   */
  public getCaseRecord(caseRef: string): CaseRecord | null {
    const stmt = this.db.prepare(
      'SELECT * FROM deeptrace_cases WHERE case_ref = ? LIMIT 1'
    );
    const row = stmt.get(caseRef) as any;

    if (!row) {
      return null;
    }

    try {
      const parsedReport: DeepTraceReportDTO = JSON.parse(row.report_json);
      return {
        case_ref: row.case_ref,
        report_id: row.report_id,
        trust_score: Number(row.trust_score),
        risk_level: row.risk_level,
        platform: row.platform,
        claimed_location: row.claimed_location,
        report_json: row.report_json,
        created_at: row.created_at,
        views_count: Number(row.views_count || 0),
        report: parsedReport
      };
    } catch (parseError) {
      console.error(`[CaseRepository] Corrupted report_json for ${caseRef}:`, parseError);
      return null;
    }
  }

  /**
   * Increments views counter for public shareable access telemetry
   */
  public incrementViews(caseRef: string): void {
    const stmt = this.db.prepare(
      'UPDATE deeptrace_cases SET views_count = views_count + 1 WHERE case_ref = ?'
    );
    stmt.run(caseRef);
  }

  /**
   * Closes database connection
   */
  public close(): void {
    try {
      this.db.close();
    } catch {}
  }
}

// Global singleton instance for application use
export const caseRepository = new CaseRepository();
