import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { TelegramControlBot } from './telegram-control-bot.service.js';
import {
  WARMUP_BLACKLIST_SUBREDDITS,
  WARMUP_WHITELIST_SUBREDDITS,
  getRedditAccountStatus,
} from './reddit-account-state.js';
import { redditFetch, isRedditProxyEnabled } from './reddit-proxy.service.js';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

export interface RedditPostLog {
  timestamp: number;
  thingId: string;
  commentId?: string;
  permalink?: string;
  sanitizedCopy: string;
  isBioHook: boolean;
  canaryStatus?: 'pending' | 'verified_visible' | 'removed_shadowbanned';
}

export interface RedditGuardState {
  history: RedditPostLog[];
  emergencyCooldownUntil: number;
}

export interface RedditSessionValidation {
  valid: boolean;
  username?: string;
  modhash?: string;
  totalKarma?: number;
  error?: string;
}

export interface PostEligibility {
  allowed: boolean;
  reason?: string;
  waitTimeMs?: number;
  postsIn24h: number;
  lastPostTime?: number;
  isBioHook: boolean;
}

export const BIO_HOOK_TEMPLATES = [
  'Documented the local routing filter logic in my profile bio.',
  'Wrote up the full breakdown of how to filter inactive accounts on my profile bio.',
  'Left detailed notes on the matching and filtering setup on my profile bio for anyone tired of swiping.',
  'Put together the telemetry breakdown and the direct local filter script on my profile bio.',
  'Shared the direct routing methodology and filters on my profile bio if you want to avoid algorithm burnout.',
  'Documented the local cluster and activity filtering rules on my profile bio.',
];

export const LOW_RESTRICTION_SUBREDDITS = new Set([
  'dating',
  'tinder',
  'dating_advice',
  'onlinedating',
  'advice',
  'askmen',
  'askwomen',
]);

export const HIGH_RESTRICTION_SUBREDDITS = new Set([
  'news',
  'worldnews',
  'politics',
  'memes',
  'funny',
  'aww',
  'gaming',
  'todayilearned',
]);

export class RedditPosterService {
  private static instance: RedditPosterService | null = null;
  private readonly stateFilePath: string;
  private readonly userAgent: string;
  private sessionCookie: string;
  private cachedModhash: string | null = null;
  private history: RedditPostLog[] = [];
  private emergencyCooldownUntil: number = 0;

  private constructor(customStatePath?: string) {
    const defaultDir = path.resolve(process.cwd(), 'core/data');
    if (!fs.existsSync(defaultDir)) {
      try {
        fs.mkdirSync(defaultDir, { recursive: true });
      } catch {}
    }
    this.stateFilePath = customStatePath || path.join(defaultDir, 'reddit_post_history.json');
    this.userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    this.sessionCookie = process.env.REDDIT_SESSION_COOKIE || '';
    this.loadState();
  }

  public static getInstance(customStatePath?: string): RedditPosterService {
    if (!this.instance || (customStatePath && this.instance.stateFilePath !== customStatePath)) {
      this.instance = new RedditPosterService(customStatePath);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  public setSessionCookie(cookie: string): void {
    this.sessionCookie = cookie;
  }

  private loadState(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const raw = fs.readFileSync(this.stateFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Legacy array format
          this.history = parsed;
          this.emergencyCooldownUntil = 0;
        } else if (parsed && typeof parsed === 'object') {
          this.history = Array.isArray(parsed.history) ? parsed.history : [];
          this.emergencyCooldownUntil = Number(parsed.emergencyCooldownUntil || 0);
        }
      }
    } catch (e) {
      console.warn('[RedditPosterService] Could not load state:', e);
      this.history = [];
      this.emergencyCooldownUntil = 0;
    }
  }

  private saveState(): void {
    try {
      const recent = this.history.slice(-100);
      const state: RedditGuardState = {
        history: recent,
        emergencyCooldownUntil: this.emergencyCooldownUntil,
      };
      fs.writeFileSync(this.stateFilePath, JSON.stringify(state, null, 2), 'utf8');
    } catch (e) {
      console.warn('[RedditPosterService] Could not save state:', e);
    }
  }

  /**
   * Validates identity and session token with Reddit web API
   */
  public async validateSession(): Promise<RedditSessionValidation> {
    const cookie = this.sessionCookie || process.env.REDDIT_SESSION_COOKIE || '';
    if (!cookie) {
      return { valid: false, error: 'REDDIT_SESSION_COOKIE is empty' };
    }

    try {
      const res = await redditFetch('https://www.reddit.com/api/me.json', {
        headers: {
          'User-Agent': this.userAgent,
          Cookie: `reddit_session=${cookie}`,
        },
      });

      if (!res.ok) {
        return { valid: false, error: `HTTP ${res.status} ${res.statusText}` };
      }

      const data: any = await res.json();
      if (!data || !data.data || !data.data.name) {
        return { valid: false, error: 'User data missing in /api/me.json payload' };
      }

      this.cachedModhash = data.data.modhash || null;

      return {
        valid: true,
        username: data.data.name,
        modhash: data.data.modhash,
        totalKarma: data.data.total_karma,
      };
    } catch (err: any) {
      return { valid: false, error: err.message || String(err) };
    }
  }

  /**
   * Evaluates 1:3 Stealth Ratio:
   * For every 1 comment with a bio-hook, 2 comments must be strictly neutral informative comments.
   */
  public isNextPostBioHook(): boolean {
    if (this.history.length === 0) {
      return true; // First post can have bio hook
    }

    // Check last 2 entries
    const lastTwo = this.history.slice(-2);
    const hasBioInLastTwo = lastTwo.some((h) => h.isBioHook === true);

    // If either of the last 2 comments had a bio hook, the current one MUST be purely neutral
    return !hasBioInLastTwo;
  }

  /**
   * Operational Guardrails Evaluation (Karma Warmup / Cold Seed Mode):
   * 1. Emergency shadowban 24h cooldown.
   * 2. Max 3-4 comments per rolling 24 hours.
   * 3. Strict 2.5h - 4h pacing between posts with randomized jitter.
   * 4. Zero bio hooks during karma warmup phase.
   */
  public canPost(now: number = Date.now(), ignorePacing: boolean = false): PostEligibility {
    const ONE_HOUR = 3600 * 1000;
    const TWENTY_FOUR_HOURS = 24 * ONE_HOUR;
    const MIN_PACING_MS = Math.floor(2.5 * ONE_HOUR); // 2.5h base

    const isBioHook = false; // Strictly disabled during karma warmup

    // 1. Emergency Cooldown (triggered by AutoModerator shadowban removal)
    if (this.emergencyCooldownUntil && now < this.emergencyCooldownUntil) {
      const waitTimeMs = this.emergencyCooldownUntil - now;
      return {
        allowed: false,
        reason: `🚨 Emergency AutoModerator 24h Cooldown Active: ${(waitTimeMs / 3600000).toFixed(1)}h remaining.`,
        waitTimeMs,
        postsIn24h: 0,
        isBioHook: false,
      };
    }

    const posts24h = this.history.filter((h) => now - h.timestamp < TWENTY_FOUR_HOURS);
    const count24h = posts24h.length;

    if (!ignorePacing) {
      // 2. Filter posts within last 24h: Max 4 comments per 24h
      if (count24h >= 4) {
        const oldestInWindow = posts24h[0];
        const waitTimeMs = Math.max(0, oldestInWindow.timestamp + TWENTY_FOUR_HOURS - now);
        return {
          allowed: false,
          reason: `Karma Warmup Limit reached: ${count24h}/4 comments in 24h window. Cooldown active.`,
          waitTimeMs,
          postsIn24h: count24h,
          isBioHook: false,
        };
      }

      // 3. Check 2.5h - 4h pacing guard
      if (this.history.length > 0) {
        const lastPost = this.history[this.history.length - 1];
        const elapsedSinceLast = now - lastPost.timestamp;
        if (elapsedSinceLast < MIN_PACING_MS) {
          const waitTimeMs = MIN_PACING_MS - elapsedSinceLast;
          return {
            allowed: false,
            reason: `Pacing guard: minimum 2.5h cooldown between posts. ${(waitTimeMs / 60000).toFixed(1)}m remaining.`,
            waitTimeMs,
            postsIn24h: count24h,
            lastPostTime: lastPost.timestamp,
            isBioHook: false,
          };
        }
      }
    }

    return {
      allowed: true,
      postsIn24h: count24h,
      lastPostTime: this.history.length > 0 ? this.history[this.history.length - 1].timestamp : undefined,
      isBioHook: false,
    };
  }

  /**
   * Sanitizes copy:
   * 1. Strips any external URLs (http:// or https://)
   * 2. If isBioHook === false: strips any bio references, creating 100% neutral informative advice.
   * 3. If isBioHook === true: appends a randomized non-repetitive template from BIO_HOOK_TEMPLATES.
   */
  public sanitizeCopy(copy: string, forceBioHook?: boolean): string {
    // 1. Strip external URLs
    let clean = copy.replace(/https?:\/\/[^\s]+/gi, '').replace(/www\.[^\s]+/gi, '').trim();

    const accountStatus = getRedditAccountStatus();
    // During karma warmup (comment_karma < 30), bio hooks and commercial links are strictly disabled
    const isBio = accountStatus.comment_karma < 30 ? false : (forceBioHook !== undefined ? forceBioHook : this.isNextPostBioHook());

    if (!isBio) {
      // Neutral mode: strip any bio reference
      clean = clean
        .split('\n')
        .filter((line) => !line.toLowerCase().includes('profile bio') && !line.toLowerCase().includes('in my bio'))
        .join('\n')
        .trim();
      return clean;
    }

    // Bio mode: ensure non-repetitive template
    const hasBioMention = clean.toLowerCase().includes('profile bio') || clean.toLowerCase().includes('in my bio');
    if (!hasBioMention) {
      // Pick random template from pool
      const template = BIO_HOOK_TEMPLATES[Math.floor(Math.random() * BIO_HOOK_TEMPLATES.length)];
      clean = `${clean}\n\n${template}`;
    }

    return clean;
  }

  /**
   * Verifies target subreddit karma/age restriction suitability
   */
  public isSubredditAllowed(subreddit: string, commentKarma?: number): { allowed: boolean; reason?: string } {
    const subClean = subreddit.trim().toLowerCase().replace(/^r\//, '');
    const accountStatus = getRedditAccountStatus();
    const karma = commentKarma !== undefined ? commentKarma : accountStatus.comment_karma;

    // 1. Blacklist check during WARMUP (dating, Tinder, dating_advice, relationship_advice)
    if (WARMUP_BLACKLIST_SUBREDDITS.has(subClean)) {
      return {
        allowed: false,
        reason: `Subreddit r/${subreddit} is blacklisted during WARMUP (AutoModerator requires >= 30 comment karma).`,
      };
    }

    if (HIGH_RESTRICTION_SUBREDDITS.has(subClean)) {
      return {
        allowed: false,
        reason: `Subreddit r/${subreddit} has strict karma requirements. Omitted for low-karma account safety.`,
      };
    }

    // 2. If comment karma < 30, only whitelist is permitted
    if (karma < 30) {
      const isWhitelisted = WARMUP_WHITELIST_SUBREDDITS.some(
        (w) => w.toLowerCase() === subClean
      );
      if (!isWhitelisted) {
        return {
          allowed: false,
          reason: `Account comment karma (${karma}) < 30: posting is restricted strictly to whitelist (r/AskReddit, r/NoStupidQuestions, r/CasualConversation).`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Shadowban Canary Check:
   * Fetches comment via public JSON without cookies to assert visibility vs AutoMod [removed] status.
   */
  public async checkShadowbanCanary(
    permalink: string,
    commentId: string
  ): Promise<{ status: 'visible' | 'removed' | 'error'; details?: string }> {
    const cleanPath = permalink.startsWith('/') ? permalink : `/${permalink}`;
    const publicUrl = `https://www.reddit.com${cleanPath}.json`;

    console.log(`🐤 [RedditPosterService] Executing Shadowban Canary Check for ${commentId}...`);

    try {
      const res = await redditFetch(publicUrl, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        return { status: 'error', details: `HTTP ${res.status}` };
      }

      const json: any = await res.json();
      let commentData: any = null;

      if (Array.isArray(json) && json.length > 1) {
        const commentsChildren = json[1]?.data?.children || [];
        for (const c of commentsChildren) {
          if (c.data?.name === commentId || c.data?.id === commentId.replace(/^t1_/, '')) {
            commentData = c.data;
            break;
          }
        }
        if (!commentData && commentsChildren.length > 0) {
          commentData = commentsChildren[0]?.data;
        }
      }

      const body = (commentData?.body || '').trim().toLowerCase();
      const author = (commentData?.author || '').trim().toLowerCase();

      if (body === '[removed]' || body === '[deleted]' || author === '[deleted]') {
        console.warn(`🚨 [RedditPosterService] AutoModerator removal detected for comment ${commentId}!`);

        // Trigger 24h Emergency Cooldown
        this.emergencyCooldownUntil = Date.now() + 24 * 3600 * 1000;
        this.updateCanaryStatus(commentId, 'removed_shadowbanned');

        // Alert Admin
        await this.dispatchAutoModAlert(commentId, permalink);

        return { status: 'removed', details: 'Comment was marked [removed] by AutoModerator' };
      }

      this.updateCanaryStatus(commentId, 'verified_visible');
      console.log(`✅ [RedditPosterService] Canary confirmed comment ${commentId} is PUBLICLY VISIBLE.`);
      return { status: 'visible' };
    } catch (err: any) {
      console.warn('[RedditPosterService] Canary check network error:', err);
      return { status: 'error', details: err.message };
    }
  }

  private updateCanaryStatus(
    commentId: string,
    status: 'verified_visible' | 'removed_shadowbanned'
  ): void {
    const entry = this.history.find((h) => h.commentId === commentId);
    if (entry) {
      entry.canaryStatus = status;
    }
    this.saveState();
  }

  private async dispatchAutoModAlert(commentId: string, permalink: string): Promise<void> {
    const bot = TelegramControlBot.getInstance();
    const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || '808343978';

    const msg = `
🚨 <b>AutoModerator Removal Detected on Reddit!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Account:</b> u/${process.env.REDDIT_USERNAME || 'sov2008'}
📌 <b>Comment ID:</b> <code>${commentId}</code>
🔗 <b>Link:</b> <a href="https://reddit.com${permalink}">Reddit Thread</a>
⚠️ <b>Status:</b> Comment flagged as [removed]
⏱️ <b>Safety Action:</b> Initiating <b>24-hour emergency cooldown</b>. Automated posting paused to protect account trust score.
    `.trim();

    try {
      await bot.sendMessage(adminChatId, msg);
    } catch (e) {
      console.warn('[RedditPosterService] Failed to notify admin of AutoMod removal:', e);
    }
  }

  /**
   * Submits comment to Reddit API under operational guardrails
   */
  public async postComment(
    thingId: string,
    rawText: string,
    options: {
      skipJitter?: boolean;
      simulate?: boolean;
      forceBioHook?: boolean;
      canaryDelayMs?: number;
      ignorePacing?: boolean;
      subreddit?: string;
    } = {}
  ): Promise<{ success: boolean; commentId?: string; permalink?: string; error?: string; isBioHook?: boolean }> {
    if (options.subreddit) {
      const subCheck = this.isSubredditAllowed(options.subreddit);
      if (!subCheck.allowed) {
        return { success: false, error: subCheck.reason };
      }
    }

    const eligibility = this.canPost(Date.now(), options.ignorePacing);
    if (!eligibility.allowed) {
      return { success: false, error: eligibility.reason };
    }

    const isBioHook = options.forceBioHook !== undefined ? options.forceBioHook : eligibility.isBioHook;

    // 1. Copy Sanitization & 1:3 Ratio Application
    const sanitizedText = this.sanitizeCopy(rawText, isBioHook);

    // 2. Validate Session & Get Modhash
    let modhash = this.cachedModhash;
    if (!modhash) {
      const validation = await this.validateSession();
      if (!validation.valid) {
        return { success: false, error: `Authentication failed: ${validation.error}` };
      }
      modhash = validation.modhash || null;
    }

    // 3. Jitter Delay (120 - 300 seconds)
    if (!options.skipJitter) {
      const jitterSec = Math.floor(Math.random() * (300 - 120 + 1) + 120);
      console.log(`⏳ [RedditPosterService] Applying human-like jitter: sleeping ${jitterSec}s before submission...`);
      await new Promise((r) => setTimeout(r, jitterSec * 1000));
    }

    if (options.simulate) {
      const simId = `t1_sim_${Date.now()}`;
      this.recordPost(thingId, sanitizedText, isBioHook, simId);
      return { success: true, commentId: simId, isBioHook };
    }

    // 4. Submit to Reddit /api/comment
    const cookie = this.sessionCookie || process.env.REDDIT_SESSION_COOKIE || '';
    const bodyParams = new URLSearchParams({
      api_type: 'json',
      thing_id: thingId,
      text: sanitizedText,
      uh: modhash || '',
    });

    try {
      const res = await redditFetch('https://www.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'User-Agent': this.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Modhash': modhash || '',
          Cookie: `reddit_session=${cookie}`,
        },
        body: bodyParams.toString(),
      });

      if (!res.ok) {
        return { success: false, error: `Reddit HTTP ${res.status}: ${res.statusText}` };
      }

      const json: any = await res.json();
      const errors = json?.json?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const errDesc = errors.map((e: any) => e.join(': ')).join('; ');
        return { success: false, error: `Reddit API Error: ${errDesc}` };
      }

      const things = json?.json?.data?.things || [];
      const createdThing = things[0]?.data;
      const commentId = createdThing?.id || createdThing?.name || `comment_${Date.now()}`;
      const permalink = createdThing?.permalink || '';

      // 5. Record to history with isBioHook tracking
      this.recordPost(thingId, sanitizedText, isBioHook, commentId, permalink);

      // 6. Alert Telegram Admin
      await this.dispatchTelegramSuccessAlert(thingId, commentId, permalink, sanitizedText, isBioHook);

      // 7. Schedule Canary Check (60 seconds after post)
      if (permalink) {
        const delay = options.canaryDelayMs !== undefined ? options.canaryDelayMs : 60000;
        setTimeout(() => {
          this.checkShadowbanCanary(permalink, commentId).catch((e) =>
            console.warn('[RedditPosterService] Canary run error:', e)
          );
        }, delay).unref?.();
      }

      return {
        success: true,
        commentId,
        permalink: permalink ? `https://reddit.com${permalink}` : undefined,
        isBioHook,
      };
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  private recordPost(
    thingId: string,
    copy: string,
    isBioHook: boolean,
    commentId?: string,
    permalink?: string
  ): void {
    const entry: RedditPostLog = {
      timestamp: Date.now(),
      thingId,
      commentId,
      permalink,
      sanitizedCopy: copy,
      isBioHook,
      canaryStatus: 'pending',
    };
    this.history.push(entry);
    this.saveState();
  }

  private async dispatchTelegramSuccessAlert(
    thingId: string,
    commentId: string,
    permalink: string,
    copy: string,
    isBioHook: boolean
  ): Promise<void> {
    const bot = TelegramControlBot.getInstance();
    const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || '808343978';

    const msg = `
🚀 <b>Reddit Automated Comment Published!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Account:</b> u/${process.env.REDDIT_USERNAME || 'sov2008'}
🎭 <b>Type:</b> ${isBioHook ? '🎯 Bio-Hook Conversion (1:3)' : '🛡️ Neutral Informative Advice'}
📌 <b>Target Thing:</b> <code>${thingId}</code>
🆔 <b>Comment ID:</b> <code>${commentId}</code>
${permalink ? `🔗 <b>Link:</b> <a href="https://reddit.com${permalink}">View Comment</a>\n` : ''}
📝 <b>Content:</b>
<pre>${copy}</pre>
━━━━━━━━━━━━━━━━━━
🛡️ <i>Guardrails active: Cooldown 4h enforced | Canary scheduled in 60s</i>
    `.trim();

    try {
      await bot.sendMessage(adminChatId, msg);
    } catch (e) {
      console.warn('[RedditPosterService] Failed to notify admin via TG:', e);
    }
  }

  public getHistory(): RedditPostLog[] {
    return [...this.history];
  }

  public getEmergencyCooldownUntil(): number {
    return this.emergencyCooldownUntil;
  }

  public setEmergencyCooldown(until: number): void {
    this.emergencyCooldownUntil = until;
    this.saveState();
  }

  public clearHistory(): void {
    this.history = [];
    this.emergencyCooldownUntil = 0;
    this.saveState();
  }
}

export const redditPosterService = RedditPosterService.getInstance();
