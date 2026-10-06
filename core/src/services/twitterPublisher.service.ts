import { chromium, BrowserContext } from 'playwright';
import fs from 'fs';
import path from 'path';
import { ContentQueueRepository, ContentQueueItem } from '../db/queueRepository.js';

export interface TwitterPublishResult {
  success: boolean;
  item?: ContentQueueItem;
  tweetUrl?: string;
  error?: string;
}

export class TwitterPublisherService {
  private static instance: TwitterPublisherService | null = null;
  private queueRepo: ContentQueueRepository;
  private cookiesPath: string;

  private constructor() {
    this.queueRepo = ContentQueueRepository.getInstance();
    const candidatePaths = [
      path.resolve(process.cwd(), 'twitter_cookies.json'),
      path.resolve(process.cwd(), '../twitter_cookies.json'),
      path.resolve(__dirname, '../../../twitter_cookies.json'),
      path.resolve(__dirname, '../../twitter_cookies.json'),
      '/var/www/affiliate/twitter_cookies.json',
      '/root/affiliate/twitter_cookies.json',
    ];

    this.cookiesPath = candidatePaths.find(p => fs.existsSync(p)) || path.resolve(process.cwd(), 'twitter_cookies.json');
  }

  public static getInstance(): TwitterPublisherService {
    if (!this.instance) {
      this.instance = new TwitterPublisherService();
    }
    return this.instance;
  }

  public hasValidCookies(): boolean {
    if (!fs.existsSync(this.cookiesPath)) return false;
    try {
      const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
      return Array.isArray(cookies) && cookies.some(c => c.name === 'auth_token');
    } catch {
      return false;
    }
  }

  /**
   * Publishes a raw text status update to X (Twitter)
   */
  public async publishTweet(text: string): Promise<{ success: boolean; url?: string; error?: string }> {
    if (!this.hasValidCookies()) {
      return { success: false, error: 'Twitter cookies (auth_token) missing or invalid' };
    }

    let browser;
    try {
      browser = await chromium.launch({
        headless: true,
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-infobars',
        ],
      });

      const context = await browser.newContext({
        viewport: { width: 1366, height: 768 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        locale: 'en-US',
      });

      const cookies = JSON.parse(fs.readFileSync(this.cookiesPath, 'utf8'));
      await context.addCookies(cookies);

      const page = await context.newPage();
      await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(3000);

      const editor = page.locator('div[role="textbox"][contenteditable="true"]').first();
      await editor.waitFor({ state: 'visible', timeout: 15000 });
      await editor.click();
      await editor.fill(text);
      await page.waitForTimeout(1000);

      // Trigger post via Control+Enter & button
      await page.keyboard.press('Control+Enter');
      await page.waitForTimeout(2000);

      const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
      if (await postBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await postBtn.click({ force: true }).catch(() => {});
      }

      await page.waitForTimeout(4000);

      // Update cookie file if refreshed
      const freshCookies = await context.cookies();
      fs.writeFileSync(this.cookiesPath, JSON.stringify(freshCookies, null, 2), 'utf8');

      const profileUrl = 'https://x.com/TheWeedsorg';
      return { success: true, url: profileUrl };
    } catch (err: any) {
      return { success: false, error: err.message };
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  /**
   * Publishes the next eligible Twitter snippet from the SQLite content queue
   */
  public async dispatchNextTwitterSnippet(): Promise<TwitterPublishResult> {
    const item = this.queueRepo.getNextPendingSnippet();
    if (!item || item.platform !== 'TWITTER') {
      // Find next item specifically for TWITTER
      const db = (this.queueRepo as any).db;
      if (!db) {
        return { success: false, error: 'Database instance unavailable' };
      }
      const twItem = db.prepare(`
        SELECT * FROM content_queue_v2 
        WHERE platform = 'TWITTER' 
          AND status IN ('PENDING_APPROVAL', 'APPROVED')
        ORDER BY created_at ASC 
        LIMIT 1
      `).get() as ContentQueueItem | undefined;

      if (!twItem) {
        return { success: false, error: 'No pending Twitter snippets in queue' };
      }
      return this.dispatchSnippetItem(twItem);
    }

    return this.dispatchSnippetItem(item);
  }

  private async dispatchSnippetItem(item: ContentQueueItem): Promise<TwitterPublishResult> {
    let text = item.body || item.hook || '';
    if (item.target_url && !text.includes(item.target_url)) {
      text += `\n\n${item.target_url}`;
    }

    const res = await this.publishTweet(text);
    if (res.success) {
      this.queueRepo.updateStatus(item.id, 'DISPATCHED', res.url || 'https://x.com/TheWeedsorg');
      return { success: true, item, tweetUrl: res.url };
    } else {
      return { success: false, item, error: res.error };
    }
  }
}

export const twitterPublisher = TwitterPublisherService.getInstance();
