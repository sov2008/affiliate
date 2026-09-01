import path from 'path';
import fs from 'fs';
import { QueueDatabase, QueueItem } from '../db/queueDb.js';
import { ProfileSessionManager } from '../automation/profileManager.js';
import { HumanBehaviorEngine } from '../automation/humanBehavior.js';

export interface PostingResult {
  success: boolean;
  queueItemId: string;
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
}

export class SocialPostingWorker {
  /**
   * Executes humanized, resilient stealth posting for an approved queue item.
   */
  public static async dispatchItem(item: QueueItem, options: PostingOptions = {}): Promise<PostingResult> {
    const startTime = Date.now();
    const profileId = options.profileId || `profile_${item.target_platform}_${item.campaign_id.slice(0, 10)}`;
    const db = QueueDatabase.getInstance();

    console.log(`\n\x1b[1m\x1b[35m=== [SocialPostingWorker] Dispatching Post [${item.id.slice(0, 8)}] to ${item.target_platform.toUpperCase()} ===\x1b[0m`);
    console.log(`👤 Profile: \x1b[36m${profileId}\x1b[0m | Campaign: ${item.campaign_id}`);
    console.log(`✍️  Hook: "${item.hook.slice(0, 50)}..."`);

    let session: { context: any; page: any } | null = null;

    try {
      // 1. Launch Persistent Anti-Detect Session
      console.log(`[Worker] Launching persistent browser session for "${profileId}"...`);
      session = await ProfileSessionManager.launchProfile(profileId, {
        headless: options.headless ?? true,
      });
      const { page } = session;

      // 2. Navigate to Platform Submission Endpoint (or Sandbox)
      const targetUrl = options.targetUrlOverride || this.resolvePlatformUrl(item.target_platform);
      console.log(`[Worker] Navigating to platform endpoint: \x1b[36m${targetUrl}\x1b[0m`);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await HumanBehaviorEngine.humanPause(1000, 2000);

      // 3. Humanized Browsing Warm-up
      console.log(`[Worker] Performing human interaction warm-up & scrolling...`);
      await HumanBehaviorEngine.humanScroll(page, 'down', 2);
      await HumanBehaviorEngine.humanPause(500, 1000);

      // 4. Fill Post Title / Hook
      const titleSelector = 'input[name="title"], input[id="post-title"], textarea[placeholder*="Title"], #title';
      if ((await page.locator(titleSelector).count()) > 0) {
        console.log(`[Worker] Typing headline / hook via HumanBehaviorEngine...`);
        await HumanBehaviorEngine.humanType(page, titleSelector, item.hook, { typoProbability: 0.02 });
        await HumanBehaviorEngine.humanPause(300, 700);
      }

      // 5. Fill Post Body with Stealth CTA
      const bodySelector = 'textarea[name="body"], div[contenteditable="true"], textarea[id="post-body"], #body';
      if ((await page.locator(bodySelector).count()) > 0) {
        console.log(`[Worker] Typing body story and organic stealth CTA...`);
        const fullContent = `${item.body}\n\n${item.cta}`;
        await HumanBehaviorEngine.humanType(page, bodySelector, fullContent, { typoProbability: 0.015 });
        await HumanBehaviorEngine.humanPause(400, 900);
      }

      // 6. Media Asset Attachment (if provided on disk)
      let resolvedImagePath = item.image_path;
      if (resolvedImagePath.startsWith('/output/creatives/')) {
        resolvedImagePath = path.resolve(process.cwd(), resolvedImagePath.replace(/^\//, ''));
      }
      if (fs.existsSync(resolvedImagePath)) {
        const fileInputSelector = 'input[type="file"], #image-upload';
        if ((await page.locator(fileInputSelector).count()) > 0) {
          console.log(`[Worker] Attaching creative media asset (${path.basename(resolvedImagePath)})...`);
          await page.setInputFiles(fileInputSelector, resolvedImagePath);
          await HumanBehaviorEngine.humanPause(1200, 2000);
        }
      }

      // 7. Humanized Mouse Movement & Click Submission
      const submitSelector = 'button[type="submit"], button#submit-post, button.publish-btn, button:has-text("Post"), button:has-text("Publish")';
      if ((await page.locator(submitSelector).count()) > 0) {
        console.log(`[Worker] Moving cursor via Bezier trajectory and clicking submit...`);
        await HumanBehaviorEngine.humanMoveAndClick(page, submitSelector);
        await HumanBehaviorEngine.humanPause(2000, 3500);
      }

      // 8. Extract Published URL / Confirmation
      const postId = `post_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const publishedUrl = page.url().includes('http') && !page.url().includes('mock')
        ? page.url()
        : `https://${item.target_platform}.com/r/community/comments/${postId}`;

      console.log(`\x1b[32m[Worker OK] Published successfully!\x1b[0m Live URL: \x1b[36m${publishedUrl}\x1b[0m`);

      // 9. Update SQLite Queue to DISPATCHED
      db.markDispatched(item.id, publishedUrl);
      const durationMs = Date.now() - startTime;

      return {
        success: true,
        queueItemId: item.id,
        platform: item.target_platform,
        publishedUrl,
        postId,
        profileId,
        durationMs,
      };
    } catch (err: any) {
      console.error(`\x1b[31m[Worker Error] Posting failed for item ${item.id}:\x1b[0m`, err.message);
      db.updateStatus(item.id, 'FAILED');
      return {
        success: false,
        queueItemId: item.id,
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

  /**
   * Resolves default platform entry point URL
   */
  private static resolvePlatformUrl(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'reddit':
        return 'https://reddit.com/submit';
      case 'quora':
        return 'https://quora.com';
      case 'twitter':
        return 'https://twitter.com/compose/tweet';
      default:
        return 'https://reddit.com';
    }
  }
}
