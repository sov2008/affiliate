import fs from 'fs';
import path from 'path';

export type Platform = 'reddit' | 'quora' | 'forum' | 'x';

export type BundleStatus =
  | 'DISCOVERED'
  | 'GENERATED'
  | 'COMPLIANT'
  | 'AWAITING_HUMAN_APPROVAL'
  | 'WORKER_SKIPPED_PAUSED'
  | 'PERMISSION_DENIED'
  | 'REJECTED'
  | 'REJECTED_MALFORMED'
  | 'APPROVED'
  | 'DISPATCHED'
  | 'HALTED';

export interface RawContext {
  platform: Platform;
  sourceUrl: string;
  topicTitle: string;
  sourceText: string;
  targetAudiencePain: string;
  metadata: Record<string, unknown>;
}

export interface GeneratedCreative {
  headline: string;
  body: string;
  callToAction: string;
  prelanderSlug: string;
  generatedPrompt: string;
}

export interface ComplianceReport {
  passed: boolean;
  score: number; // 0..100
  flaggedKeywords: string[];
  reasoning: string;
  violationsDetected?: string[];
}

export interface BundleArtifact {
  id: string;
  createdAt: number;
  context: RawContext;
  creative?: GeneratedCreative;
  compliance?: ComplianceReport;
  status: BundleStatus;
  tracePath: string[];
}

export interface EmergencyStopState {
  isHalted: boolean;
  reason?: string;
  haltedAt?: number;
  haltedBy?: string;
}

/**
 * EmergencyStopController provides thread-safe, cross-process atomic halt checks
 * to immediately kill or prevent agent executions when anomalies, compliance violations,
 * or user emergency stops occur.
 */
export class EmergencyStopController {
  private static instance: EmergencyStopController | null = null;
  private isHaltedInMemory: boolean = false;
  private haltReason?: string;
  private haltTimestamp?: number;
  private haltOperator?: string;
  private lockFilePath: string;

  private constructor() {
    const candidates = [
      path.resolve(process.cwd(), '.antigravity'),
      path.resolve(process.cwd(), 'core/data'),
      path.resolve(process.cwd(), 'data'),
      process.cwd(),
    ];

    let baseDir = candidates[0];
    for (const c of candidates) {
      if (fs.existsSync(c)) {
        baseDir = c;
        break;
      }
    }

    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    this.lockFilePath = path.join(baseDir, 'EMERGENCY_STOP.lock');
    this.syncFromDisk();
  }

  public static getInstance(): EmergencyStopController {
    if (!this.instance) {
      this.instance = new EmergencyStopController();
    }
    return this.instance;
  }

  private syncFromDisk(): void {
    if (fs.existsSync(this.lockFilePath)) {
      try {
        const raw = fs.readFileSync(this.lockFilePath, 'utf8');
        const parsed: EmergencyStopState = JSON.parse(raw);
        this.isHaltedInMemory = Boolean(parsed.isHalted);
        this.haltReason = parsed.reason;
        this.haltTimestamp = parsed.haltedAt;
        this.haltOperator = parsed.haltedBy;
      } catch {
        this.isHaltedInMemory = true;
        this.haltReason = 'Lock file present but unparseable';
      }
    } else {
      this.isHaltedInMemory = false;
      this.haltReason = undefined;
      this.haltTimestamp = undefined;
      this.haltOperator = undefined;
    }
  }

  /**
   * Atomic check to be executed before every agent action or pipeline stage.
   * Throws an Error if the system is halted.
   */
  public check(): void {
    this.syncFromDisk();
    if (this.isHaltedInMemory) {
      const msg = `[EMERGENCY_STOP] Pipeline execution blocked! Reason: ${this.haltReason || 'Manual kill switch activated'}`;
      throw new Error(msg);
    }
  }

  /**
   * Non-throwing status check.
   */
  public isHalted(): boolean {
    this.syncFromDisk();
    return this.isHaltedInMemory;
  }

  /**
   * Atomically triggers emergency halt across all processes and writes lockfile.
   */
  public trigger(reason: string = 'Operator triggered emergency stop', operator: string = 'SYSTEM'): void {
    this.isHaltedInMemory = true;
    this.haltReason = reason;
    this.haltTimestamp = Date.now();
    this.haltOperator = operator;

    const payload: EmergencyStopState = {
      isHalted: true,
      reason,
      haltedAt: this.haltTimestamp,
      haltedBy: operator,
    };

    try {
      fs.writeFileSync(this.lockFilePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[EmergencyStopController] Failed to persist lock file: ${errorMsg}`);
    }

    console.warn(`\x1b[41m\x1b[37m[EMERGENCY STOP TRIGGERED]\x1b[0m ${reason} (by ${operator})`);
  }

  /**
   * Resets the emergency stop and clears the lockfile.
   */
  public reset(operator: string = 'OPERATOR'): void {
    this.isHaltedInMemory = false;
    this.haltReason = undefined;
    this.haltTimestamp = undefined;
    this.haltOperator = undefined;

    if (fs.existsSync(this.lockFilePath)) {
      try {
        fs.unlinkSync(this.lockFilePath);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error(`[EmergencyStopController] Failed to delete lock file: ${errorMsg}`);
      }
    }

    console.log(`\x1b[32m[EmergencyStopController] Emergency stop cleared by ${operator}. Pipeline operational.\x1b[0m`);
  }

  /**
   * Retrieves current diagnostic state.
   */
  public getStatus(): EmergencyStopState {
    this.syncFromDisk();
    return {
      isHalted: this.isHaltedInMemory,
      reason: this.haltReason,
      haltedAt: this.haltTimestamp,
      haltedBy: this.haltOperator,
    };
  }
}
