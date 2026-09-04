import fs from 'fs';
import path from 'path';
import { CopywriterAgent } from '../agents/copy.agent.js';
import { TelegramControlBot } from '../services/telegram-control-bot.service.js';
import { KnowledgeService } from '../services/knowledge.service.js';
import { ContentQueueRepository } from '../db/queueRepository.js';
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
  score: number;
  num_comments: number;
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
    // Warmup subreddits: High-traffic, soft moderation, organic karma accumulation
    this.subreddits = options.subreddits || [
      'AskReddit',
      'CasualConversation',
      'NoStupidQuestions',
      'mildlyinteresting',
    ];
    this.keywords = options.keywords || [];
    this.maxAgeHours = options.maxAgeHours || 6;
    this.userAgent =
      options.userAgent ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Antigravity Reddit Warmup/2.0)';

    const defaultDir = fs.existsSync('/var/www/affiliate/core/data')
      ? '/var/www/affiliate/core/data'
      : path.resolve(process.cwd(), process.cwd().endsWith('core') ? 'data' : 'core/data');

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
    const sessionCookie = process.env.REDDIT_SESSION_COOKIE || '';
    const headers: Record<string, string> = {
      'User-Agent': this.userAgent,
      Accept: 'application/json',
    };
    if (sessionCookie) {
      headers['Cookie'] = `reddit_session=${sessionCookie}`;
    }

    // Fetch rising & new feeds to discover high-traction posts (score >= 5, comments 3..30)
    const urls = [
      `https://www.reddit.com/r/${sub}/rising.json?limit=25`,
      `https://www.reddit.com/r/${sub}/new.json?limit=25`,
    ];
    const postMap = new Map<string, RedditPost>();

    for (const url of urls) {
      try {
        let res = await fetch(url, { headers });
        if (!res.ok) {
          const fallbackUrl = url.replace('www.reddit.com', 'old.reddit.com');
          res = await fetch(fallbackUrl, { headers });
        }

        if (!res.ok) {
          console.warn(`[ScoutRedditWorker] Notice for ${url}: HTTP ${res.status}`);
          continue;
        }

        const json: any = await res.json();
        const children = json?.data?.children || [];

        for (const c of children) {
          if (c?.data?.id && !postMap.has(c.data.id)) {
            postMap.set(c.data.id, {
              id: c.data.id,
              subreddit: c.data.subreddit,
              title: c.data.title || '',
              selftext: c.data.selftext || '',
              author: c.data.author || '',
              permalink: c.data.permalink || '',
              url: `https://www.reddit.com${c.data.permalink || ''}`,
              created_utc: c.data.created_utc || Math.floor(Date.now() / 1000),
              score: Number(c.data.score || 0),
              num_comments: Number(c.data.num_comments || 0),
            });
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[ScoutRedditWorker] Fetch error for ${url}: ${msg}`);
      }
    }

    return Array.from(postMap.values());
  }

  /**
   * Anti-Detect Karma Warmup Filter:
   * 1. Has not been seen yet
   * 2. Created within last maxAgeHours (default 6h)
   * 3. Parent thread upvote score >= 5
   * 4. Parent thread comments count between 3 and 30 (not buried on bottom)
   * 5. No deleted/removed posts
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

    // Ignore deleted or empty title posts
    if (!post.title || post.title.includes('[deleted]') || post.title.includes('[removed]')) {
      return false;
    }

    // Anti-Detect Warmup criteria: score >= 5 and comments between 3 and 30
    if (post.score < 5) {
      return false;
    }
    if (post.num_comments < 3 || post.num_comments > 30) {
      return false;
    }

    // If specific keywords provided, enforce them; otherwise allow all high-intent questions
    if (this.keywords.length > 0) {
      const combined = `${post.title} ${post.selftext}`.toLowerCase();
      const hasKeyword = this.keywords.some((kw) => combined.includes(kw.toLowerCase()));
      if (!hasKeyword) return false;
    }

    return true;
  }

  /**
   * Generates an authentic, friendly peer-to-peer reply without any commercial or bio hooks
   */
  public async generateNativeResponse(post: RedditPost): Promise<string> {
    try {
      const generated = await this.copyAgent.generateKarmaWarmupComment(post.title, post.selftext, post.subreddit);
      return generated;
    } catch (err) {
      console.warn('[ScoutRedditWorker] LLM copy generation fallback:', err);
      return `That’s a really solid point. In my experience, the biggest shift came from focusing on small, consistent habits instead of waiting for a huge breakthrough. Once you remove the pressure of having everything figured out immediately, momentum naturally starts building up.`;
    }
  }

  /**
   * Sends formatted HITL Alert to Admin Chat ID
   */
  public async sendAdminAlert(post: RedditPost, proposedCopy: string, queueId?: string): Promise<boolean> {
    const bot = TelegramControlBot.getInstance();
    const adminChatId = bot.getAdminChatId() || process.env.ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID || '';

    if (!adminChatId) {
      console.warn('[ScoutRedditWorker] ADMIN_CHAT_ID not configured for alerts.');
      return false;
    }

    let finalQueueId = queueId;
    if (!finalQueueId) {
      finalQueueId = `reddit_${post.id}`;
      try {
        const queueItem = ContentQueueRepository.getInstance().enqueue({
          id: finalQueueId,
          campaign_id: `warmup_${post.subreddit.toLowerCase()}`,
          network: 'organic',
          target_platform: 'reddit',
          platform: 'REDDIT',
          subreddit: post.subreddit,
          target_url: post.url,
          hook: post.title,
          body: proposedCopy,
          payload: JSON.stringify({
            postId: post.id,
            author: post.author,
            subreddit: post.subreddit,
            url: post.url,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            proposedCopy,
            warmupMode: true,
          }),
          stealth_cta: 'Zero Links | Friendly Peer-to-Peer',
          tracking_url: post.url,
          image_path: '',
          risk_score: 0,
          status: 'PENDING',
        });
        finalQueueId = queueItem.id;
      } catch (e: any) {
        console.error('[ScoutRedditWorker] Auto-enqueue fallback failed:', e.message);
      }
    }

    const alertText = `
🌱 <b>Karma Warmup Match in r/${post.subreddit}</b>
━━━━━━━━━━━━━━━━━━
📌 <b>Post Title:</b>
<a href="${post.url}">${this.escapeHtml(post.title)}</a>

📊 <b>Metrics:</b> ⬆️ ${post.score} score | 💬 ${post.num_comments} comments
👤 <b>Author:</b> u/${post.author}
⏰ <b>Created:</b> ${new Date(post.created_utc * 1000).toLocaleTimeString('ru-RU')} (UTC)
📋 <b>Queue ID:</b> <code>${finalQueueId}</code> (Status: PENDING)
📝 <b>Generated Warmup Reply (Zero Links / Clean):</b>
<pre>${this.escapeHtml(proposedCopy)}</pre>
━━━━━━━━━━━━━━━━━━
🛡️ <i>Cold Seed Warmup Phase | Zero Links | Stored in SQLite Content Queue</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: '🚀 Опубликовать сейчас', callback_data: `publish_${finalQueueId}` },
        ],
        [
          { text: '📥 В очередь (по расписанию)', callback_data: `approve_${finalQueueId}` },
          { text: '❌ Отклонить', callback_data: `reject_${finalQueueId}` },
        ],
        [
          { text: '🌐 Открыть тред Reddit', url: post.url },
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

          // Atomic SQLite Content Queue Ingestion (/var/www/affiliate/core/data/content_queue.sqlite)
          let queueId = `reddit_${post.id}`;
          try {
            const queueItem = ContentQueueRepository.getInstance().enqueue({
              id: queueId,
              campaign_id: `warmup_${post.subreddit.toLowerCase()}`,
              network: 'organic',
              target_platform: 'reddit',
              platform: 'REDDIT',
              subreddit: post.subreddit,
              target_url: post.url,
              hook: post.title,
              body: copy,
              payload: JSON.stringify({
                postId: post.id,
                author: post.author,
                subreddit: post.subreddit,
                url: post.url,
                score: post.score,
                num_comments: post.num_comments,
                created_utc: post.created_utc,
                proposedCopy: copy,
                warmupMode: true,
              }),
              stealth_cta: 'Zero Links | Friendly Peer-to-Peer',
              tracking_url: post.url,
              image_path: '',
              risk_score: 0,
              status: 'PENDING',
            });
            queueId = queueItem.id;
            console.log(`📥 [ScoutRedditWorker] Draft enqueued into SQLite: ID=${queueItem.id} | Subreddit=r/${post.subreddit} | Status=PENDING`);
          } catch (err: any) {
            console.error('[ScoutRedditWorker] Failed to enqueue into SQLite Content Queue:', err.message);
          }

          // Dispatch HITL alert to admin
          const sent = await this.sendAdminAlert(post, copy, queueId);
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
