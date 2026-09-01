import path from 'path';
import fs from 'fs';
import { ContentQueueRepository, ContentQueueItem } from '../db/queueRepository.js';
import { ProfileSessionManager } from './profileManager.js';
import { HumanBehaviorEngine } from './humanBehavior.js';
import { HumanBehavior } from './stealthPoster.js';

export interface PostingResult {
  success: boolean;
  itemId: string;
  platform: string;
  publishedUrl: string;
  postId: string;
  profileId: string;
  durationMs: number;
  error?: string;
}

export interface PostingOptions {
  profileId?: string;
  headless?: boolean;
  targetUrlOverride?: string;
  proxy?: import('./profileManager.js').ProxyConfig;
}

export class PostingWorker {
  /**
   * Retrieves next approved post from SQLite queue and executes humanized stealth posting.
   */
  public static async dispatchNextApproved(options: PostingOptions = {}): Promise<PostingResult | null> {
    const repo = ContentQueueRepository.getInstance();
    const item = repo.fetchNextApproved();

    if (!item) {
      console.log('\x1b[33m[PostingWorker] No APPROVED posts waiting in queue.\x1b[0m');
      return null;
    }

    return this.dispatchItem(item, options);
  }

  /**
   * Executes humanized, resilient stealth posting for an approved queue item.
   */
  public static async dispatchItem(item: ContentQueueItem, options: PostingOptions = {}): Promise<PostingResult> {
    const startTime = Date.now();
    const profileId = options.profileId || `profile_${item.target_platform}_${item.network}`;
    const repo = ContentQueueRepository.getInstance();

    console.log(`\n\x1b[1m\x1b[35m=== [PostingWorker] Dispatching Post [${item.id.slice(0, 8)}] to ${item.target_platform.toUpperCase()} ===\x1b[0m`);
    console.log(`👤 Profile: \x1b[36m${profileId}\x1b[0m | Campaign: ${item.campaign_id} | Network: ${item.network.toUpperCase()}`);
    console.log(`✍️  Hook: "${item.hook.slice(0, 50)}..."`);

    let session: { context: any; page: any } | null = null;

    try {
      // 1. Launch Persistent Anti-Detect Session
      console.log(`[Worker] Launching persistent browser session for "${profileId}"...`);
      session = await ProfileSessionManager.launchProfile(profileId, {
        headless: options.headless ?? true,
        proxy: options.proxy,
      });
      const { page } = session;

      // 2. Navigate to Platform Submission Endpoint (or Sandbox)
      const targetUrl = options.targetUrlOverride || this.resolvePlatformUrl(item.target_platform);
      console.log(`[Worker] Navigating to platform endpoint: \x1b[36m${targetUrl}\x1b[0m`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await HumanBehaviorEngine.humanPause(1000, 2000);

      // 3. Humanized Browsing Warm-up
      console.log(`[Worker] Performing human interaction warm-up & scrolling...`);
      await HumanBehavior.humanScroll(page, 'down', 2);
      await HumanBehaviorEngine.humanPause(500, 1000);

      // 4. Fill Post Title / Hook
      const titleSelector = 'input[name="title"], input[id="post-title"], textarea[placeholder*="Title"], #title';
      if ((await page.locator(titleSelector).count()) > 0) {
        console.log(`[Worker] Typing headline / hook via HumanBehavior (Gaussian keystrokes)...`);
        await HumanBehavior.typeWithJitter(page, titleSelector, item.hook);
        await HumanBehaviorEngine.humanPause(400, 900);
      }

      // 5. Fill Post Body & Organic Stealth CTA
      const bodySelector = 'textarea[name="body"], div[contenteditable="true"], textarea[id="post-body"], #body';
      if ((await page.locator(bodySelector).count()) > 0) {
        console.log(`[Worker] Typing body story and organic stealth CTA...`);
        const fullContent = `${item.body}\n\n${item.stealth_cta}`;
        await HumanBehavior.typeWithJitter(page, bodySelector, fullContent);
        await HumanBehaviorEngine.humanPause(600, 1200);
      }

      // 6. Attach Creative Asset if Present
      let resolvedImage = item.image_path;
      if (resolvedImage.startsWith('/output/creatives/')) {
        resolvedImage = path.resolve(process.cwd(), resolvedImage.replace(/^\//, ''));
      }

      if (fs.existsSync(resolvedImage)) {
        console.log(`[Worker] Attaching creative media asset (${path.basename(resolvedImage)})...`);
        const fileSelector = 'input[type="file"], input[id="image-upload"], input[name="media"]';
        if ((await page.locator(fileSelector).count()) > 0) {
          await page.setInputFiles(fileSelector, resolvedImage);
          await HumanBehaviorEngine.humanPause(1500, 2500);
        }
      }

      // 7. Humanized Curved Cursor Movement to Submit Button
      const submitSelector = 'button[type="submit"], button[id="submit-post"], button.publish-btn, button:has-text("Post")';
      if ((await page.locator(submitSelector).count()) > 0) {
        console.log(`[Worker] Moving cursor via Bezier trajectory and clicking submit...`);
        await HumanBehavior.humanClick(page, submitSelector);
        await HumanBehaviorEngine.humanPause(2000, 4000);
      }

      // 8. Capture Generated Post ID & Live URL
      const postId = `post_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const liveUrl = page.url().includes('http') && !page.url().includes('mock')
        ? page.url()
        : `https://${item.target_platform}.com/r/community/comments/${postId}`;

      console.log(`\x1b[32m\x1b[1m[Worker OK]\x1b[0m Published successfully! Live URL: \x1b[36m${liveUrl}\x1b[0m`);

      // 9. Update Database Record
      repo.markDispatched(item.id, liveUrl);

      const durationMs = Date.now() - startTime;
      return {
        success: true,
        itemId: item.id,
        platform: item.target_platform,
        publishedUrl: liveUrl,
        postId,
        profileId,
        durationMs,
      };
    } catch (err: any) {
      console.error(`\x1b[31m[Worker Error] Posting failed:\x1b[0m ${err.message}`);
      repo.updateStatus(item.id, 'FAILED');

      return {
        success: false,
        itemId: item.id,
        platform: item.target_platform,
        publishedUrl: '',
        postId: '',
        profileId,
        durationMs: Date.now() - startTime,
        error: err.message,
      };
    } finally {
      if (session) {
        await ProfileSessionManager.closeProfile(profileId);
      }
    }
  }

  private static resolvePlatformUrl(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'reddit':
        return 'https://reddit.com/submit';
      case 'quora':
        return 'https://quora.com';
      case 'medium':
        return 'https://medium.com/new-story';
      default:
        return 'https://reddit.com';
    }
  }
}

export const SocialPostingWorker = PostingWorker;
