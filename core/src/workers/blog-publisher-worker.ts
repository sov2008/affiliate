import fs from 'fs';
import path from 'path';
import util from 'util';
import { exec } from 'child_process';
import crypto from 'crypto';
import { ContentQueueRepository, ContentQueueItem, BlogPostPayload } from '../db/queueRepository.js';

const execAsync = util.promisify(exec);

export interface PublishResult {
  success: boolean;
  publishedUrl?: string;
  filePath?: string;
  childSnippetIds?: string[];
  error?: string;
}

export class BlogPublisherWorker {
  private static instance: BlogPublisherWorker | null = null;
  private queueRepo: ContentQueueRepository;
  private isProcessing: boolean = false;

  private constructor() {
    this.queueRepo = ContentQueueRepository.getInstance();
  }

  public static getInstance(): BlogPublisherWorker {
    if (!this.instance) {
      this.instance = new BlogPublisherWorker();
    }
    return this.instance;
  }

  /**
   * Resolves the blog content/posts directory in various environments
   */
  public resolvePostsDir(): string {
    const candidateDirs = [
      path.resolve(process.cwd(), 'blog/src/content/posts'),
      path.resolve(process.cwd(), '../blog/src/content/posts'),
      path.resolve(__dirname, '../../../blog/src/content/posts'),
      path.resolve(__dirname, '../../blog/src/content/posts'),
      '/var/www/affiliate/blog/src/content/posts',
      '/root/affiliate/blog/src/content/posts',
    ];

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }

    // Default to relative to cwd
    const defaultDir = path.resolve(process.cwd(), 'blog/src/content/posts');
    fs.mkdirSync(defaultDir, { recursive: true });
    return defaultDir;
  }

  /**
   * Resolves root affiliate directory for running npm run build:blog
   */
  public resolveAppRoot(): string {
    const candidateRoots = [
      process.cwd(),
      path.resolve(process.cwd(), '..'),
      path.resolve(__dirname, '../../..'),
      '/var/www/affiliate',
      '/root/affiliate',
    ];

    for (const r of candidateRoots) {
      if (fs.existsSync(path.join(r, 'blog/astro.config.mjs'))) {
        return r;
      }
    }

    return process.cwd();
  }

  /**
   * Publishes a specific approved blog post queue item
   */
  public async publishPost(itemId: string): Promise<PublishResult> {
    const item = this.queueRepo.getItem(itemId);
    if (!item) {
      return { success: false, error: `Queue item ${itemId} not found` };
    }

    let payload: BlogPostPayload | null = null;
    try {
      if (item.payload) {
        payload = typeof item.payload === 'string' ? JSON.parse(item.payload) : item.payload;
      }
    } catch {}

    const slug = payload?.slug || this.slugify(item.hook || itemId);
    const content = item.body || payload?.markdownContent || '';

    if (!content || content.length < 50) {
      return { success: false, error: `Article body is empty for ${itemId}` };
    }

    console.log(`\n🚀 [BlogPublisherWorker] Publishing approved blog post [${itemId.slice(0, 8)}] -> "${slug}"...`);

    // 1. Ensure file is written into blog/src/content/posts/${slug}.md
    const postsDir = this.resolvePostsDir();
    const filePath = path.join(postsDir, `${slug}.md`);

    // Ensure frontmatter contains valid canonicalUrl and draft: false
    let finalContent = content;
    if (!finalContent.startsWith('---')) {
      const frontmatter = `---
title: "${(item.hook || slug).replace(/"/g, '\\"')}"
description: "${(payload?.description || item.hook || '').slice(0, 160).replace(/"/g, '\\"')}"
pubDate: ${payload?.pubDate || new Date().toISOString().split('T')[0]}
author: "${payload?.author || 'FlirtCheck Editorial'}"
tags: ${JSON.stringify(payload?.tags || ['Safety', 'Dating Advice'])}
seoKeywords: ${JSON.stringify(payload?.seoKeywords || ['dating safety'])}
canonicalUrl: "https://flirtcheck.site/blog/${slug}/"
draft: false
---

`;
      finalContent = frontmatter + finalContent;
    } else {
      // Ensure draft is false
      finalContent = finalContent.replace(/draft:\s*true/g, 'draft: false');
    }

    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`📄 [BlogPublisherWorker] Written: ${filePath} (${finalContent.length} bytes)`);

    // 2. Trigger Astro static build
    const appRoot = this.resolveAppRoot();
    console.log(`🔨 [BlogPublisherWorker] Building static Astro blog in ${appRoot}...`);

    try {
      const buildCmd = fs.existsSync(path.join(appRoot, 'blog'))
        ? `npm --prefix blog run build`
        : `npm run build:blog`;

      const { stdout, stderr } = await execAsync(buildCmd, {
        cwd: appRoot,
        timeout: 60000,
      });

      console.log(`✅ [BlogPublisherWorker] Astro build completed successfully:\n${stdout.slice(-250)}`);
    } catch (buildErr: any) {
      console.error(`❌ [BlogPublisherWorker] Astro build error:`, buildErr.message);
      return {
        success: false,
        filePath,
        error: `Astro build failed: ${buildErr.message}`,
      };
    }

    // 3. Mark queue item as DISPATCHED
    const publishedUrl = `https://flirtcheck.site/blog/${slug}/`;
    this.queueRepo.updateItem(itemId, {
      status: 'DISPATCHED',
      published_url: publishedUrl,
      updated_at: Date.now(),
    });

    console.log(`🌐 [BlogPublisherWorker] Post is LIVE at: ${publishedUrl}`);

    // 4. Generate 2 child distribution snippets (Reddit discussion + Twitter thread)
    const childSnippetIds = await this.generateDistributionSnippets(item, slug, publishedUrl, payload);

    return {
      success: true,
      publishedUrl,
      filePath,
      childSnippetIds,
    };
  }

  /**
   * Scans queue and publishes all pending approved blog posts
   */
  public async publishAllApproved(): Promise<PublishResult[]> {
    if (this.isProcessing) {
      console.log('⏳ [BlogPublisherWorker] Already running, skipping concurrent tick');
      return [];
    }

    this.isProcessing = true;
    const results: PublishResult[] = [];

    try {
      const approvedItems = this.queueRepo
        .listAll('APPROVED', 50)
        .filter((item) => (item.target_platform || item.platform) === 'BLOG_POST');

      console.log(`🔎 [BlogPublisherWorker] Found ${approvedItems.length} approved blog posts to publish`);

      for (const item of approvedItems) {
        const res = await this.publishPost(item.id);
        results.push(res);
      }
    } finally {
      this.isProcessing = false;
    }

    return results;
  }

  /**
   * Automatically generates child SOCIAL_SNIPPET items in content_queue_v2
   */
  private async generateDistributionSnippets(
    parentItem: ContentQueueItem,
    slug: string,
    blogUrl: string,
    payload: BlogPostPayload | null
  ): Promise<string[]> {
    const createdIds: string[] = [];

    // Snippet 1: Reddit Discussion Opener
    const redditId = `snip_rd_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const redditTopic = parentItem.hook || 'Dating Profile Verification';
    const redditBody = `Is it just me, or has online dating become an absolute minefield of automated bot accounts and catfish profiles lately?

I recently did a deep dive into modern GAN deepfake headshots and romance scam tactics, and put together an exhaustive verification protocol with practical reverse-lookup checklists.

Key warning signs to watch out for:
1. Photos that look like professional influencer shoots with distorted ear lobes / glasses blending into temples.
2. Demands to immediately migrate to WhatsApp or Telegram within 3 messages.
3. Rapid love-bombing within 48 hours to bypass your skepticism.

Wrote up the complete 2026 self-verification guide with full breakdown here for anyone interested: ${blogUrl}

What's the weirdest catfish or bot match you've encountered recently?`;

    this.queueRepo.enqueue({
      id: redditId,
      campaign_id: parentItem.campaign_id || 'cmp_lospollos_dating',
      network: 'organic',
      target_platform: 'reddit',
      platform: 'reddit',
      subreddit: 'dating_advice',
      target_url: blogUrl,
      hook: `Red Flags in 2026: ${redditTopic} (How to spot synthetic profiles)`,
      body: redditBody,
      stealth_cta: `Detailed guide at ${blogUrl}`,
      tracking_url: blogUrl,
      image_path: '',
      risk_score: 2,
      status: 'PENDING_APPROVAL',
      payload: JSON.stringify({
        parentPostId: parentItem.id,
        blogUrl,
        type: 'SOCIAL_SNIPPET',
        platform: 'reddit',
      }),
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    createdIds.push(redditId);
    console.log(`🤖 [BlogPublisherWorker] Created Reddit snippet: ${redditId}`);

    // Snippet 2: X / Twitter Value Thread
    const twitterId = `snip_tw_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;
    const twitterBody = `Over 30% of unverified dating profiles today show synthetic activity or bot patterns.

Here is a 4-step safety checklist before you exchange numbers or meet up:

1/ Check ears and glasses frames in photos — GAN deepfakes consistently blur peripheral geometry.
2/ Test localized knowledge — ask about current weather or neighborhood spots in their bio city.
3/ Avoid anyone accelerating off-app within 3 messages.
4/ Run a quick profile authenticity check.

Full detailed guide and checklist on @FlirtCheck:
${blogUrl}`;

    this.queueRepo.enqueue({
      id: twitterId,
      campaign_id: parentItem.campaign_id || 'cmp_lospollos_dating',
      network: 'organic',
      target_platform: 'SOCIAL_SNIPPET',
      platform: 'twitter',
      subreddit: '',
      target_url: blogUrl,
      hook: `🧵 4-Step Dating Profile Safety Protocol 2026`,
      body: twitterBody,
      stealth_cta: `Checklist link: ${blogUrl}`,
      tracking_url: blogUrl,
      image_path: '',
      risk_score: 1,
      status: 'PENDING_APPROVAL',
      payload: JSON.stringify({
        parentPostId: parentItem.id,
        blogUrl,
        type: 'SOCIAL_SNIPPET',
        platform: 'twitter',
      }),
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    createdIds.push(twitterId);
    console.log(`🐦 [BlogPublisherWorker] Created Twitter snippet: ${twitterId}`);

    return createdIds;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 65);
  }
}
