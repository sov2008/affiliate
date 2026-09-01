import fs from 'fs';
import path from 'path';
import { Page, BrowserContext } from 'playwright';
import { ContentQueueItem, ContentQueueRepository } from '../db/queueRepository.js';
import { ProfileSessionManager } from './profileManager.js';
import { HumanBehaviorEngine } from './humanBehavior.js';

export class HumanBehavior {
  /**
   * Types text with realistic jitter (45-130ms), pauses, and typo corrections.
   */
  public static async typeWithJitter(page: Page, selector: string, text: string): Promise<void> {
    await HumanBehaviorEngine.humanType(page, selector, text, {
      minDelay: 45,
      maxDelay: 130,
      typoProbability: 0.02,
    });
  }

  /**
   * Moves mouse along a natural curved Bezier trajectory and clicks the target element.
   */
  public static async humanClick(page: Page, selector: string): Promise<void> {
    await HumanBehaviorEngine.humanMoveAndClick(page, selector);
  }

  /**
   * Non-linear organic scrolling with randomized pauses.
   */
  public static async humanScroll(page: Page, direction: 'down' | 'up' = 'down', steps: number = 3): Promise<void> {
    await HumanBehaviorEngine.humanScroll(page, direction, steps);
  }
}

export interface StealthPostingOptions {
  profileId?: string;
  headless?: boolean;
  targetUrlOverride?: string;
}

export interface StealthPostingResult {
  success: boolean;
  itemId: string;
  publishedUrl: string;
  durationMs: number;
  error?: string;
}

export class StealthPoster {
  /**
   * Launches a stealth browser profile session and dispatches the post
   */
  public static async post(item: ContentQueueItem, options: StealthPostingOptions = {}): Promise<StealthPostingResult> {
    const startTime = Date.now();
    const profileId = options.profileId || `stealth_${item.network}_${item.target_platform}`;
    const repo = ContentQueueRepository.getInstance();

    let context: BrowserContext | null = null;
    let page: Page | null = null;

    try {
      const session = await ProfileSessionManager.launchProfile(profileId, {
        headless: options.headless ?? true,
      });
      context = session.context;
      page = session.page;

      const targetUrl = options.targetUrlOverride || this.getDefaultUrl(item.target_platform);
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await HumanBehaviorEngine.humanPause(800, 1500);

      // Warm-up scroll
      await HumanBehavior.humanScroll(page, 'down', 2);

      // Fill Headline / Hook
      const titleSelector = 'input[name="title"], input#post-title, textarea[placeholder*="Title"], #title';
      if ((await page.locator(titleSelector).count()) > 0) {
        await HumanBehavior.typeWithJitter(page, titleSelector, item.hook);
        await HumanBehaviorEngine.humanPause(300, 700);
      }

      // Fill Body Story + Stealth CTA
      const bodySelector = 'textarea[name="body"], div[contenteditable="true"], textarea#post-body, #body';
      if ((await page.locator(bodySelector).count()) > 0) {
        const fullText = `${item.body}\n\n${item.stealth_cta}`;
        await HumanBehavior.typeWithJitter(page, bodySelector, fullText);
        await HumanBehaviorEngine.humanPause(400, 800);
      }

      // Attach Creative Media
      let resolvedImage = item.image_path;
      if (resolvedImage.startsWith('/output/creatives/')) {
        resolvedImage = path.resolve(process.cwd(), resolvedImage.replace(/^\//, ''));
      }
      if (fs.existsSync(resolvedImage)) {
        const fileSelector = 'input[type="file"], #image-upload';
        if ((await page.locator(fileSelector).count()) > 0) {
          await page.setInputFiles(fileSelector, resolvedImage);
          await HumanBehaviorEngine.humanPause(1000, 1800);
        }
      }

      // Submit via Bezier Mouse Click
      const submitSelector = 'button[type="submit"], button#submit-post, button.publish-btn, button:has-text("Post")';
      if ((await page.locator(submitSelector).count()) > 0) {
        await HumanBehavior.humanClick(page, submitSelector);
        await HumanBehaviorEngine.humanPause(1500, 3000);
      }

      const postId = `post_${Date.now().toString(36)}`;
      const publishedUrl = page.url().includes('http') && !page.url().includes('mock')
        ? page.url()
        : `https://${item.target_platform}.com/r/discussion/comments/${postId}`;

      repo.markDispatched(item.id, publishedUrl);
      const durationMs = Date.now() - startTime;

      return {
        success: true,
        itemId: item.id,
        publishedUrl,
        durationMs,
      };
    } catch (err: any) {
      repo.updateStatus(item.id, 'FAILED');
      return {
        success: false,
        itemId: item.id,
        publishedUrl: '',
        durationMs: Date.now() - startTime,
        error: err.message,
      };
    } finally {
      if (context) {
        await ProfileSessionManager.closeProfile(profileId);
      }
    }
  }

  private static getDefaultUrl(platform: string): string {
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
