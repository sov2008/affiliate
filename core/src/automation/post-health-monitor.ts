import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { ContentQueueRepository, ContentQueueItem, PostHealthStatus } from '../db/queueRepository.js';
import { ProxyRotator } from '../skills/proxy-rotator-skill.js';
import { EmergencyStopController } from '../types/pipeline.js';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface PostHealthAuditResult {
  itemId: string;
  publishedUrl: string;
  platform: string;
  previousStatus?: string;
  healthStatus: PostHealthStatus;
  upvotes: number;
  statusCode?: number;
  reason?: string;
  auditedAt: string;
}

export interface ProfileHealthRecord {
  profileId: string;
  platform: string;
  consecutiveRemovals: number;
  status: 'HEALTHY' | 'COOLDOWN_24H' | 'FLAGGED';
  cooldownUntil?: number;
  lastRemovalAt?: string;
  updatedAt: string;
}

export interface NegativePatternEntry {
  id: string;
  platform: string;
  campaignId: string;
  hook: string;
  bannedKeywords: string[];
  reason: string;
  recordedAt: string;
}

export class PostHealthMonitor {
  private static instance: PostHealthMonitor | null = null;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private profileHealthPath: string;
  private negativePatternsPath: string;
  private auditIntervalMs: number;
  private profileHealthMap: Map<string, ProfileHealthRecord> = new Map();

  private constructor(options: { profileHealthPath?: string; negativePatternsPath?: string; auditIntervalMs?: number } = {}) {
    this.profileHealthPath = options.profileHealthPath || path.resolve(process.cwd(), 'storage/profiles/profile_health.json');
    this.negativePatternsPath = options.negativePatternsPath || path.resolve(process.cwd(), 'data/learning/negative_patterns.json');
    this.auditIntervalMs = options.auditIntervalMs || 60 * 60 * 1000; // 1 hour default

    const profileDir = path.dirname(this.profileHealthPath);
    if (!fs.existsSync(profileDir)) {
      try {
        fs.mkdirSync(profileDir, { recursive: true });
      } catch {}
    }

    const learningDir = path.dirname(this.negativePatternsPath);
    if (!fs.existsSync(learningDir)) {
      try {
        fs.mkdirSync(learningDir, { recursive: true });
      } catch {}
    }

    this.loadProfileHealth();
  }

  public static getInstance(options?: { profileHealthPath?: string; negativePatternsPath?: string; auditIntervalMs?: number }): PostHealthMonitor {
    if (!this.instance) {
      this.instance = new PostHealthMonitor(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    if (this.instance) {
      this.instance.stop();
      this.instance = null;
    }
  }

  private loadProfileHealth(): void {
    if (fs.existsSync(this.profileHealthPath)) {
      try {
        const raw = fs.readFileSync(this.profileHealthPath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          this.profileHealthMap.clear();
          for (const p of list) {
            this.profileHealthMap.set(p.profileId, p);
          }
        }
      } catch {}
    }
  }

  private saveProfileHealth(): void {
    try {
      const list = Array.from(this.profileHealthMap.values());
      fs.writeFileSync(this.profileHealthPath, JSON.stringify(list, null, 2), 'utf8');
    } catch {}
  }

  /**
   * Evaluates public HTML to determine post visibility and status
   */
  public evaluatePublicContent(html: string, statusCode: number = 200, hookText?: string): { status: PostHealthStatus; upvotes: number; reason?: string } {
    if (statusCode === 404 || statusCode === 410) {
      return { status: 'SHADOWBANNED_OR_REMOVED', upvotes: 0, reason: `HTTP ${statusCode} Not Found` };
    }

    const lowerHtml = html.toLowerCase();

    // 1. Shadowban / Moderator Removal Signatures
    const removalSignatures = [
      '[removed]',
      '[deleted]',
      'this post has been removed by the moderators',
      'sorry, this post was deleted by the person',
      'this comment was deleted',
      'content not available',
      'this post is no longer available',
      'page not found',
    ];

    for (const sig of removalSignatures) {
      if (lowerHtml.includes(sig)) {
        return { status: 'SHADOWBANNED_OR_REMOVED', upvotes: 0, reason: `Found removal indicator: "${sig}"` };
      }
    }

    // 2. Thread Locked Signatures
    const lockedSignatures = [
      'this thread is archived',
      'comments are locked',
      'this submission is locked',
      'you cannot comment on this post',
    ];

    for (const sig of lockedSignatures) {
      if (lowerHtml.includes(sig)) {
        return { status: 'THREAD_LOCKED', upvotes: 0, reason: `Thread is locked/archived: "${sig}"` };
      }
    }

    // 3. Extract upvotes if present
    let upvotes = 0;
    const upvoteMatch = html.match(/data-score="(\d+)"/i) || html.match(/"score":\s*(\d+)/i) || html.match(/(\d+)\s*upvotes/i);
    if (upvoteMatch && upvoteMatch[1]) {
      upvotes = parseInt(upvoteMatch[1], 10) || 0;
    }

    // 4. If hook is provided, verify it appears in DOM
    if (hookText && hookText.length > 10) {
      const cleanHook = hookText.slice(0, 30).toLowerCase();
      if (!lowerHtml.includes(cleanHook) && !lowerHtml.includes('reddit') && !lowerHtml.includes('quora')) {
        return { status: 'SHADOWBANNED_OR_REMOVED', upvotes, reason: 'Hook content missing from public DOM' };
      }
    }

    return { status: 'POST_ACTIVE', upvotes, reason: 'Post is publicly visible and active' };
  }

  /**
   * Audits a single dispatched post item
   */
  public async auditSinglePost(
    item: ContentQueueItem,
    options: { mockHtml?: string; mockStatusCode?: number; proxyUrl?: string } = {}
  ): Promise<PostHealthAuditResult> {
    const publishedUrl = item.published_url || '';
    const nowStr = new Date().toISOString();

    if (!publishedUrl || publishedUrl.startsWith('simulation://') || publishedUrl.startsWith('test://')) {
      const isSimRemoved = publishedUrl.includes('removed') || publishedUrl.includes('shadowbanned');
      const isSimLocked = publishedUrl.includes('locked');
      const healthStatus: PostHealthStatus = isSimRemoved
        ? 'SHADOWBANNED_OR_REMOVED'
        : isSimLocked
        ? 'THREAD_LOCKED'
        : 'POST_ACTIVE';

      return {
        itemId: item.id,
        publishedUrl,
        platform: item.target_platform,
        previousStatus: item.health_status,
        healthStatus,
        upvotes: healthStatus === 'POST_ACTIVE' ? 3 : 0,
        auditedAt: nowStr,
      };
    }

    // If mock HTML is provided (e.g. testing or local fixture)
    if (options.mockHtml !== undefined) {
      const evalResult = this.evaluatePublicContent(options.mockHtml, options.mockStatusCode || 200, item.hook);
      return {
        itemId: item.id,
        publishedUrl,
        platform: item.target_platform,
        previousStatus: item.health_status,
        healthStatus: evalResult.status,
        upvotes: evalResult.upvotes,
        statusCode: options.mockStatusCode || 200,
        reason: evalResult.reason,
        auditedAt: nowStr,
      };
    }

    // Real Incognito HTTP / Proxy Fetch Probe
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      const res = await fetch(publishedUrl, {
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const text = await res.text();
      const evalResult = this.evaluatePublicContent(text, res.status, item.hook);

      return {
        itemId: item.id,
        publishedUrl,
        platform: item.target_platform,
        previousStatus: item.health_status,
        healthStatus: evalResult.status,
        upvotes: evalResult.upvotes,
        statusCode: res.status,
        reason: evalResult.reason,
        auditedAt: nowStr,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        itemId: item.id,
        publishedUrl,
        platform: item.target_platform,
        previousStatus: item.health_status,
        healthStatus: 'ERROR',
        upvotes: 0,
        reason: `Probe failed: ${msg}`,
        auditedAt: nowStr,
      };
    }
  }

  /**
   * Records a negative pattern when removal occurs
   */
  public recordNegativePattern(item: ContentQueueItem, reason: string): void {
    try {
      let existing: NegativePatternEntry[] = [];
      if (fs.existsSync(this.negativePatternsPath)) {
        try {
          existing = JSON.parse(fs.readFileSync(this.negativePatternsPath, 'utf8'));
        } catch {}
      }

      // Extract aggressive keywords
      const words = (item.hook + ' ' + item.body).split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
      const bannedCandidates = words.filter((w) => w.length > 5 && (w.includes('guarantee') || w.includes('profit') || w.includes('free') || w.includes('instant') || w.includes('trade')));

      const newEntry: NegativePatternEntry = {
        id: `np_${Date.now()}_${item.id.slice(0, 8)}`,
        platform: item.target_platform,
        campaignId: item.campaign_id,
        hook: item.hook,
        bannedKeywords: Array.from(new Set(bannedCandidates)),
        reason,
        recordedAt: new Date().toISOString(),
      };

      existing.unshift(newEntry);
      fs.writeFileSync(this.negativePatternsPath, JSON.stringify(existing.slice(0, 100), null, 2), 'utf8');
      console.log(`🧠 [PostHealthMonitor] Negative pattern recorded: "${item.hook.slice(0, 40)}..." -> ${this.negativePatternsPath}`);
    } catch {}
  }

  /**
   * Handles profile penalty and triggers 24H cooldown if threshold is met
   */
  public async handleProfilePenalty(profileId: string, platform: string, item: ContentQueueItem): Promise<boolean> {
    const record: ProfileHealthRecord = this.profileHealthMap.get(profileId) || {
      profileId,
      platform,
      consecutiveRemovals: 0,
      status: 'HEALTHY',
      updatedAt: new Date().toISOString(),
    };

    record.consecutiveRemovals += 1;
    record.lastRemovalAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();

    if (record.consecutiveRemovals >= 2) {
      record.status = 'COOLDOWN_24H';
      record.cooldownUntil = Date.now() + 24 * 60 * 60 * 1000;

      console.warn(`🚨 [PostHealthMonitor] Profile [${profileId}] reached 2 consecutive removals! Set to COOLDOWN_24H.`);

      // Send Telegram alert
      const tg = TelegramControlBot.getInstance();
      const alertMsg = `
🚨 <b>[ANTI-DETECT ALERT: PROFILE SHADOWBAN / REMOVAL]</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Profile ID:</b> <code>${profileId}</code>
🌐 <b>Platform:</b> <code>${platform.toUpperCase()}</code>
⚠️ <b>Trigger:</b> 2 consecutive post removals detected by Health Monitor.
⏳ <b>Action:</b> Profile automatically locked in <b>COOLDOWN_24H</b> until ${new Date(record.cooldownUntil).toLocaleString('ru-RU')}.
━━━━━━━━━━━━━━━━━━
⚡ <i>Scheduler will automatically route traffic through secondary clean profiles</i>
      `.trim();

      await tg.sendMessage(process.env.TELEGRAM_CHAT_ID || '0', alertMsg);
    }

    this.profileHealthMap.set(profileId, record);
    this.saveProfileHealth();
    return record.status === 'COOLDOWN_24H';
  }

  /**
   * Resets consecutive removals on successful active post verification
   */
  public handleProfileSuccess(profileId: string): void {
    const record = this.profileHealthMap.get(profileId);
    if (record && record.consecutiveRemovals > 0) {
      record.consecutiveRemovals = 0;
      if (record.status === 'COOLDOWN_24H' && record.cooldownUntil && Date.now() >= record.cooldownUntil) {
        record.status = 'HEALTHY';
      }
      record.updatedAt = new Date().toISOString();
      this.profileHealthMap.set(profileId, record);
      this.saveProfileHealth();
    }
  }

  /**
   * Runs a complete audit cycle across all posts dispatched in the last 72 hours
   */
  public async runAuditCycle(options: { windowHours?: number; dryRun?: boolean } = {}): Promise<{
    auditedCount: number;
    activeCount: number;
    removedCount: number;
    lockedCount: number;
    results: PostHealthAuditResult[];
  }> {
    const windowHours = options.windowHours || 72;
    const sinceTimestamp = Date.now() - windowHours * 3600 * 1000;

    console.log(`\n🔍 [PostHealthMonitor] Starting Post Health & Shadowban Audit (Window: ${windowHours}h)...`);

    const repo = ContentQueueRepository.getInstance();
    const dispatchedItems = repo.listDispatched(sinceTimestamp);

    console.log(`   📋 Found ${dispatchedItems.length} dispatched posts to audit.`);

    let activeCount = 0;
    let removedCount = 0;
    let lockedCount = 0;
    const results: PostHealthAuditResult[] = [];

    for (const item of dispatchedItems) {
      const audit = await this.auditSinglePost(item);
      results.push(audit);

      // Update SQLite item status & upvotes
      repo.updateHealth(item.id, audit.healthStatus, audit.upvotes);

      const profileId = `prof_${item.target_platform}_default`;

      if (audit.healthStatus === 'POST_ACTIVE') {
        activeCount++;
        this.handleProfileSuccess(profileId);
      } else if (audit.healthStatus === 'SHADOWBANNED_OR_REMOVED') {
        removedCount++;
        this.recordNegativePattern(item, audit.reason || 'Post was removed or shadowbanned');
        await this.handleProfilePenalty(profileId, item.target_platform, item);
      } else if (audit.healthStatus === 'THREAD_LOCKED') {
        lockedCount++;
      }
    }

    console.log(`   📊 Audit Complete: ${activeCount} Active, ${removedCount} Removed, ${lockedCount} Locked.`);

    return {
      auditedCount: results.length,
      activeCount,
      removedCount,
      lockedCount,
      results,
    };
  }

  /**
   * Starts background audit loop
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`🛡️ [PostHealthMonitor] Background Post Health Daemon STARTED (Interval: ${this.auditIntervalMs / 1000}s).`);

    this.runAuditCycle().catch(() => {});
    this.timer = setInterval(() => {
      this.runAuditCycle().catch(() => {});
    }, this.auditIntervalMs);
  }

  /**
   * Stops background audit loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('[PostHealthMonitor] Daemon STOPPED.');
  }

  public getStatus(): { isRunning: boolean; profileRecordsCount: number } {
    return {
      isRunning: this.isRunning,
      profileRecordsCount: this.profileHealthMap.size,
    };
  }

  public getProfileRecord(profileId: string): ProfileHealthRecord | undefined {
    return this.profileHealthMap.get(profileId);
  }
}

export const postHealthMonitor = PostHealthMonitor.getInstance();

// Standalone CLI Runner Execution
if (
  process.argv[1] &&
  (process.argv[1].endsWith('post-health-monitor.ts') ||
    process.argv[1].endsWith('post-health-monitor.js'))
) {
  console.log('\n🚀 [CLI] Executing Post Health & Shadowban Audit Worker...');
  const monitor = PostHealthMonitor.getInstance();

  monitor
    .runAuditCycle({ windowHours: 72 })
    .then((summary) => {
      console.log('\n================================================================');
      console.log(`📊 Audit Finished: ${summary.auditedCount} Audited | ${summary.activeCount} Active | ${summary.removedCount} Removed | ${summary.lockedCount} Locked`);
      console.log('================================================================\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ [Monitor Error]', err);
      process.exit(1);
    });
}
