import { TelegramLeadRepository, TgLeadItem } from '../db/tg-leads.repository.js';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';

export interface DripStepConfig {
  step: number;
  minAgeMs: number;
  maxAgeMs: number;
}

export interface DripCycleStats {
  step1Sent: number;
  step2Sent: number;
  step3Sent: number;
  blockedCount: number;
  totalProcessed: number;
  isQuietHours?: boolean;
}

export class DripRetentionWorker {
  private static instance: DripRetentionWorker | null = null;
  private readonly leadRepo: TelegramLeadRepository;
  private readonly bot: TelegramControlBot;
  private isCycleRunning: boolean = false;

  // Step age thresholds with night-buffer tolerance
  public static readonly STEP_1_CONFIG: DripStepConfig = {
    step: 1,
    minAgeMs: 2 * 3600 * 1000, // 2 hours
    maxAgeMs: 36 * 3600 * 1000, // up to 36 hours (tolerates overnight hold)
  };

  public static readonly STEP_2_CONFIG: DripStepConfig = {
    step: 2,
    minAgeMs: 24 * 3600 * 1000, // 24 hours
    maxAgeMs: 96 * 3600 * 1000, // up to 96 hours
  };

  public static readonly STEP_3_CONFIG: DripStepConfig = {
    step: 3,
    minAgeMs: 72 * 3600 * 1000, // 72 hours
    maxAgeMs: 14 * 24 * 3600 * 1000, // up to 14 days
  };

  /**
   * Checks if given timestamp falls within quiet hours (22:00 to 09:00 local/server baseline)
   */
  public static isQuietHours(timestamp: number = Date.now()): boolean {
    const hour = new Date(timestamp).getHours();
    return hour >= 22 || hour < 9;
  }

  /**
   * Calculates next morning 09:15 timestamp when quiet hours lift
   */
  public static getNextActiveDispatchTime(fromTimestamp: number = Date.now()): number {
    const d = new Date(fromTimestamp);
    if (d.getHours() >= 22) {
      d.setDate(d.getDate() + 1);
    }
    d.setHours(9, 15, 0, 0);
    return d.getTime();
  }

  private constructor() {
    this.leadRepo = TelegramLeadRepository.getInstance();
    this.bot = TelegramControlBot.getInstance();
  }

  public static getInstance(): DripRetentionWorker {
    if (!this.instance) {
      this.instance = new DripRetentionWorker();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Resolves fallback LosPollos smartlink if not present on lead
   */
  private resolveTrackingUrl(lead: TgLeadItem): string {
    if (lead.tracking_url) return lead.tracking_url;
    const base =
      process.env.AFFILIATE_OFFER_URL ||
      process.env.LOSPOLLOS_SMARTLINK_URL ||
      process.env.LOSPOLLOS_URL ||
      'https://yex2brk.chemistrydrivensmile.org/rp1pd38';
    const cleanBase = base.trim().replace(/\/+$/, '');
    const separator = cleanBase.includes('?') ? '&' : '?';
    return `${cleanBase}${separator}sub1=reddit_dating&sub2=${encodeURIComponent(lead.chat_id)}&cid=${encodeURIComponent(lead.chat_id)}`;
  }

  /**
   * Sends Step 1 push (Soft social proof)
   */
  public async sendStep1Push(lead: TgLeadItem): Promise<boolean> {
    const url = this.resolveTrackingUrl(lead);
    const ageTarget = lead.age_range ? `in the <b>${lead.age_range}</b> range` : 'matching your age range';

    const text = `
👋 <b>Hey! Quick heads up:</b>

Over <b>140+ verified active members</b> ${ageTarget} were active near you today.

Don't leave your match queue waiting:
    `.trim();

    return this.dispatchDripMessage(lead, 1, text, '🔥 View Verified Matches 👉', url);
  }

  /**
   * Sends Step 2 push (Alternate angle - direct connect room)
   */
  public async sendStep2Push(lead: TgLeadItem): Promise<boolean> {
    const url = this.resolveTrackingUrl(lead);
    const intentTarget = lead.connection_type ? `<b>${lead.connection_type}</b>` : 'direct';

    const text = `
⚡ <b>Live Activity Notice:</b>

Direct connect rooms for ${intentTarget} connections are currently open in your area.

Skip the ghosting queue and connect directly with confirmed members:
    `.trim();

    return this.dispatchDripMessage(lead, 2, text, '💬 Join Direct Connect Room 👉', url);
  }

  /**
   * Sends Step 3 push (Final urgency warning)
   */
  public async sendStep3Push(lead: TgLeadItem): Promise<boolean> {
    const url = this.resolveTrackingUrl(lead);

    const text = `
⏳ <b>Priority Match Reservation Notice:</b>

Your priority activity reservation expires shortly. Tap below to claim your active connections before your queue spot is recycled:
    `.trim();

    return this.dispatchDripMessage(lead, 3, text, '🚀 Claim Priority Access 👉', url);
  }

  /**
   * Dispatches push message with graceful 403 handling (blocked user)
   */
  private async dispatchDripMessage(
    lead: TgLeadItem,
    step: number,
    text: string,
    buttonText: string,
    url: string
  ): Promise<boolean> {
    // Zero-spam guard: Skip converted users immediately
    if (lead.status === 'CONVERTED') {
      return false;
    }

    try {
      const keyboard = {
        inline_keyboard: [[{ text: buttonText, url }]],
      };

      await this.bot.sendMessage(lead.chat_id, text, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });

      this.leadRepo.incrementDripStep(lead.chat_id, step);
      return true;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (errMsg.includes('403') || errMsg.includes('blocked') || errMsg.includes('chat not found')) {
        console.warn(`[DripRetentionWorker] User ${lead.chat_id} blocked bot or chat unavailable. Archiving drip.`);
        // Mark drip_step as 99 so we don't spam blocked accounts
        this.leadRepo.incrementDripStep(lead.chat_id, 99);
      } else {
        console.error(`[DripRetentionWorker] Error sending step ${step} to ${lead.chat_id}:`, err);
      }
      return false;
    }
  }

  /**
   * Runs a complete drip retention evaluation cycle
   */
  public async runCycle(options?: {
    step1Config?: DripStepConfig;
    step2Config?: DripStepConfig;
    step3Config?: DripStepConfig;
    bypassQuietHours?: boolean;
    nowTimestamp?: number;
  }): Promise<DripCycleStats> {
    if (this.isCycleRunning) {
      return { step1Sent: 0, step2Sent: 0, step3Sent: 0, blockedCount: 0, totalProcessed: 0 };
    }

    const currentTs = options?.nowTimestamp ?? Date.now();

    // Quiet Hours Guard (22:00 - 09:00): Never ping users during sleep hours
    if (!options?.bypassQuietHours && DripRetentionWorker.isQuietHours(currentTs)) {
      const nextTime = new Date(DripRetentionWorker.getNextActiveDispatchTime(currentTs)).toISOString();
      console.log(
        `\x1b[33m[DripRetentionWorker] Quiet hours active (22:00 - 09:00). Postponing drip deliveries until ${nextTime}.\x1b[0m`
      );
      return {
        step1Sent: 0,
        step2Sent: 0,
        step3Sent: 0,
        blockedCount: 0,
        totalProcessed: 0,
        isQuietHours: true,
      };
    }

    this.isCycleRunning = true;
    const stats: DripCycleStats = {
      step1Sent: 0,
      step2Sent: 0,
      step3Sent: 0,
      blockedCount: 0,
      totalProcessed: 0,
      isQuietHours: false,
    };

    try {
      const s1Config = options?.step1Config || DripRetentionWorker.STEP_1_CONFIG;
      const s2Config = options?.step2Config || DripRetentionWorker.STEP_2_CONFIG;
      const s3Config = options?.step3Config || DripRetentionWorker.STEP_3_CONFIG;

      // 1. Process Step 1 Leads
      const step1Leads = this.leadRepo.getLeadsForDrip(1, s1Config.minAgeMs, s1Config.maxAgeMs);
      for (const lead of step1Leads) {
        stats.totalProcessed++;
        const sent = await this.sendStep1Push(lead);
        if (sent) stats.step1Sent++;
        else stats.blockedCount++;
      }

      // 2. Process Step 2 Leads
      const step2Leads = this.leadRepo.getLeadsForDrip(2, s2Config.minAgeMs, s2Config.maxAgeMs);
      for (const lead of step2Leads) {
        stats.totalProcessed++;
        const sent = await this.sendStep2Push(lead);
        if (sent) stats.step2Sent++;
        else stats.blockedCount++;
      }

      // 3. Process Step 3 Leads
      const step3Leads = this.leadRepo.getLeadsForDrip(3, s3Config.minAgeMs, s3Config.maxAgeMs);
      for (const lead of step3Leads) {
        stats.totalProcessed++;
        const sent = await this.sendStep3Push(lead);
        if (sent) stats.step3Sent++;
        else stats.blockedCount++;
      }

      if (stats.totalProcessed > 0) {
        console.log(
          `\x1b[35m[DripRetentionWorker] Drip Cycle Completed: Step1=${stats.step1Sent}, Step2=${stats.step2Sent}, Step3=${stats.step3Sent}, Total=${stats.totalProcessed}\x1b[0m`
        );
      }
    } catch (err) {
      console.error('[DripRetentionWorker] Unexpected cycle failure:', err);
    } finally {
      this.isCycleRunning = false;
    }

    return stats;
  }
}

export const dripRetentionWorker = DripRetentionWorker.getInstance();
