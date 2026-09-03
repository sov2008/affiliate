import fs from 'fs';
import path from 'path';
import { CopywriterAgent } from '../agents/copy.agent.js';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { KnowledgeService } from '../services/knowledge.service.js';
import { RawContext } from '../types/pipeline.js';

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  url: string;
  created_utc: number;
}

export interface ScoutRedditWorkerOptions {
  subreddits?: string[];
  keywords?: string[];
  maxAgeHours?: number;
  seenStoragePath?: string;
  userAgent?: string;
}

export class ScoutRedditWorker {
  private static instance: ScoutRedditWorker | null = null;
  private readonly subreddits: string[];
  private readonly keywords: string[];
  private readonly maxAgeHours: number;
  private readonly userAgent: string;
  private readonly seenStoragePath: string;
  private seenPosts: Set<string> = new Set();
  private copyAgent: CopywriterAgent;

  private constructor(options: ScoutRedditWorkerOptions = {}) {
    this.subreddits = options.subreddits || ['dating', 'Tinder', 'dating_advice'];
    this.keywords = options.keywords || ['tinder', 'bumble', 'algorithm', 'ghosting', 'paywall', 'boost', 'apps'];
    this.maxAgeHours = options.maxAgeHours || 4;
    this.userAgent =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Antigravity Affiliate Scout/1.0)';

    const defaultDir = path.resolve(process.cwd(), 'core/data');
    if (!fs.existsSync(defaultDir)) {
      try {
        fs.mkdirSync(defaultDir, { recursive: true });
      } catch {}
    }

    this.seenStoragePath = options.seenStoragePath || path.join(defaultDir, 'seen_reddit_posts.json');
    this.copyAgent = new CopywriterAgent();
    this.loadSeenPosts();
  }

  public static getInstance(options?: ScoutRedditWorkerOptions): ScoutRedditWorker {
    if (!this.instance) {
      this.instance = new ScoutRedditWorker(options);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private loadSeenPosts(): void {
    try {
      if (fs.existsSync(this.seenStoragePath)) {
        const raw = fs.readFileSync(this.seenStoragePath, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          for (const id of list) {
            this.seenPosts.add(String(id));
          }
        }
      }
    } catch (e) {
      console.warn('[ScoutRedditWorker] Could not load seen_posts:', e);
    }
  }

  private saveSeenPosts(): void {
    try {
      // Retain last 2000 seen posts to avoid memory leak
      const list = Array.from(this.seenPosts).slice(-2000);
      fs.writeFileSync(this.seenStoragePath, JSON.stringify(list, null, 2), 'utf8');
    } catch (e) {
      console.warn('[ScoutRedditWorker] Could not save seen_posts:', e);
    }
  }

  public isPostSeen(postId: string): boolean {
    return this.seenPosts.has(postId);
  }

  public markPostSeen(postId: string): void {
    this.seenPosts.add(postId);
    this.saveSeenPosts();
  }

  /**
   * Fetches latest posts from Reddit public JSON API
   */
  public async fetchSubredditPosts(sub: string): Promise<RedditPost[]> {
    const url = `https://www.reddit.com/r/${sub}/new.json?limit=25`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        console.warn(`[ScoutRedditWorker] Failed to fetch r/${sub}: HTTP ${res.status}`);
        return [];
      }

      const json: any = await res.json();
      const children = json?.data?.children || [];

      return children.map((c: any) => ({
        id: c.data.id,
        subreddit: c.data.subreddit,
        title: c.data.title || '',
        selftext: c.data.selftext || '',
        author: c.data.author || '',
        permalink: c.data.permalink || '',
        url: `https://www.reddit.com${c.data.permalink || ''}`,
        created_utc: c.data.created_utc || Math.floor(Date.now() / 1000),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[ScoutRedditWorker] Fetch error for r/${sub}: ${msg}`);
      return [];
    }
  }

  /**
   * Checks if post meets criteria:
   * 1. Created within last maxAgeHours
   * 2. Contains target keywords
   * 3. Has not been seen yet
   */
  public filterPost(post: RedditPost): boolean {
    if (this.isPostSeen(post.id)) {
      return false;
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const ageHours = (nowSec - post.created_utc) / 3600;
    if (ageHours > this.maxAgeHours) {
      return false;
    }

    const combined = `${post.title} ${post.selftext}`.toLowerCase();
    const hasKeyword = this.keywords.some((kw) => combined.includes(kw.toLowerCase()));
    return hasKeyword;
  }

  /**
   * Generates a native 100-word peer-to-peer reply with zero URLs and bio bridge
   * enriched with Knowledge Core rules
   */
  public async generateNativeResponse(post: RedditPost): Promise<string> {
    try {
      const generated = await this.copyAgent.generateRedditHitlComment(post.title, post.selftext, post.subreddit);
      const validation = KnowledgeService.getInstance().validateCopyAgainstGuard(generated, 'reddit');
      return validation.sanitizedCopy || generated;
    } catch (err) {
      console.warn('[ScoutRedditWorker] LLM copy generation fallback:', err);
      const fallback = `Honestly, the biggest scam isn’t even the $30/month subscriptions—it’s how their algorithm deliberately throttles active profiles once you hit the free engagement ceiling. When an app treats matching like an infinite slot machine, ghosting is inevitable because nobody values a single conversation. Once I stopped feeding their paywalls and switched to direct activity-based local matching, the difference was night and day.\n\nDocumented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check. Save your energy.`;
      const validation = KnowledgeService.getInstance().validateCopyAgainstGuard(fallback, 'reddit');
      return validation.sanitizedCopy || fallback;
    }
  }

  /**
   * Sends formatted HITL Alert to Admin Chat ID
   */
  public async sendAdminAlert(post: RedditPost, proposedCopy: string): Promise<boolean> {
    const bot = TelegramControlBot.getInstance();
    const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';

    if (!adminChatId) {
      console.warn('[ScoutRedditWorker] ADMIN_CHAT_ID not configured for alerts.');
      return false;
    }

    // Enforce Lexicon Guard validation prior to dispatching alert
    const validation = KnowledgeService.getInstance().validateCopyAgainstGuard(proposedCopy, 'reddit');
    const finalCopy = validation.sanitizedCopy || proposedCopy;

    const alertText = `
🎯 <b>New High-Intent Thread in r/${post.subreddit}</b>
━━━━━━━━━━━━━━━━━━
📌 <b>Post Title:</b>
<a href="${post.url}">${this.escapeHtml(post.title)}</a>

👤 <b>Author:</b> u/${post.author}
⏰ <b>Created:</b> ${new Date(post.created_utc * 1000).toLocaleTimeString('ru-RU')} (UTC)

📝 <b>Proposed Native Copy (1-Click Copy):</b>
<pre>${this.escapeHtml(finalCopy)}</pre>
━━━━━━━━━━━━━━━━━━
⚡ <i>Zero-URL compliant | Bio bridge included | Guard validated</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🌐 Open Reddit Thread', url: post.url },
        ],
      ],
    };

    return bot.sendMessage(adminChatId, alertText, { reply_markup: keyboard });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Executes a complete scout cycle across target subreddits
   */
  public async runScoutCycle(): Promise<{ scanned: number; matched: number; alerted: number }> {
    console.log(`\n🔍 [ScoutRedditWorker] Starting Reddit Scout Cycle across: ${this.subreddits.join(', ')}...`);

    let scanned = 0;
    let matched = 0;
    let alerted = 0;

    for (const sub of this.subreddits) {
      const posts = await this.fetchSubredditPosts(sub);
      scanned += posts.length;

      for (const post of posts) {
        if (this.filterPost(post)) {
          matched++;
          console.log(`🎯 [ScoutRedditWorker] High-intent match found in r/${sub}: "${post.title.slice(0, 60)}..."`);

          // Mark seen immediately to prevent race conditions
          this.markPostSeen(post.id);

          // Generate peer-to-peer copy
          const copy = await this.generateNativeResponse(post);

          // Dispatch HITL alert to admin
          const sent = await this.sendAdminAlert(post, copy);
          if (sent) {
            alerted++;
          }

          // Small delay between alerts
          await new Promise((r) => setTimeout(r, 1200));
        }
      }

      // Respect Reddit rate limits (1s delay between subreddit calls)
      await new Promise((r) => setTimeout(r, 1000));
    }

    console.log(`✅ [ScoutRedditWorker] Scout Cycle complete: Scanned=${scanned}, Matched=${matched}, Alerted=${alerted}`);
    return { scanned, matched, alerted };
  }
}

export const scoutRedditWorker = ScoutRedditWorker.getInstance();
