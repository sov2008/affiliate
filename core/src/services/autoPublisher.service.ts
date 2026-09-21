import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import crypto from 'node:crypto';
import { ContentQueueRepository, BlogPostPayload } from '../db/queueRepository.js';
import { ImageGeneratorService, imageGeneratorService } from './imageGenerator.service.js';
import { DATING_KEYWORD_POOL, KeywordIntent, getNextKeywordBatch } from '../config/datingKeywords.js';
import { AIGateway } from './aiGateway.js';
import { ArticleQualityGateService, articleQualityGate } from './articleQualityGate.service.js';

const execAsync = promisify(exec);

export interface BatchPublishOptions {
  count?: number;
  offset?: number;
  customKeywords?: KeywordIntent[];
  skipAstroBuild?: boolean;
}

export interface BatchPublishResult {
  success: boolean;
  totalRequested: number;
  generatedCount: number;
  publishedItems: Array<{
    id: string;
    slug: string;
    title: string;
    url: string;
    filePath: string;
    coverImage: string;
  }>;
  childSnippetCount: number;
  buildOutput?: string;
  durationMs: number;
  errors: string[];
}

export class AutoPublisherService {
  private static instance: AutoPublisherService | null = null;
  private queueRepo: ContentQueueRepository;
  private imageService: ImageGeneratorService;
  private qualityGate: ArticleQualityGateService;
  private isBatchRunning: boolean = false;

  private constructor() {
    this.queueRepo = ContentQueueRepository.getInstance();
    this.imageService = imageGeneratorService;
    this.qualityGate = articleQualityGate;
  }

  public static getInstance(): AutoPublisherService {
    if (!this.instance) {
      this.instance = new AutoPublisherService();
    }
    return this.instance;
  }

  /**
   * Resolves absolute directory for blog/src/content/posts
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

    const defaultDir = path.resolve(process.cwd(), 'blog/src/content/posts');
    try {
      fs.mkdirSync(defaultDir, { recursive: true });
    } catch {}
    return defaultDir;
  }

  /**
   * Executes a complete batch generation cycle:
   * 1. Iterates through keywords.
   * 2. Generates Markdown content and AI covers.
   * 3. Writes all .md files to blog/src/content/posts/.
   * 4. Enqueues DISPATCHED items and child SOCIAL_SNIPPETs to SQLite.
   * 5. Runs Astro static build EXACTLY ONCE for the entire batch.
   */
  public async publishBatch(options: BatchPublishOptions = {}): Promise<BatchPublishResult> {
    if (this.isBatchRunning) {
      throw new Error('A batch generation process is already in progress. Please wait.');
    }

    this.isBatchRunning = true;
    const startTime = Date.now();
    const count = Math.min(Math.max(options.count || 10, 1), 20);
    const offset = options.offset || 0;
    const postsDir = this.resolvePostsDir();
    const existingSlugs = new Set<string>();
    try {
      if (fs.existsSync(postsDir)) {
        const files = fs.readdirSync(postsDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            existingSlugs.add(file.replace(/\.md$/, '').toLowerCase());
          }
        }
      }
    } catch {}

    // Deduplicate: prioritize keywords not yet published as .md files
    let candidatePool = DATING_KEYWORD_POOL.filter(kw => {
      const testSlug = this.slugify(kw.topic);
      return !existingSlugs.has(testSlug);
    });

    if (candidatePool.length === 0) {
      // If all pool keywords are published, fall back to whole pool
      candidatePool = DATING_KEYWORD_POOL;
    }

    const safeOffset = offset % candidatePool.length;
    const keywords: KeywordIntent[] = options.customKeywords || candidatePool.slice(safeOffset, safeOffset + count);

    const publishedItems: BatchPublishResult['publishedItems'] = [];
    const errors: string[] = [];
    let childSnippetCount = 0;

    console.log(`\n🚀 [AutoPublisherService] Starting batch generation for ${keywords.length} articles (Existing: ${existingSlugs.size}, Pool available: ${candidatePool.length})...`);

    try {
      // 1. Generate and save all Markdown articles
      for (let i = 0; i < keywords.length; i++) {
        const itemIntent = keywords[i];
        console.log(`\n[Batch ${i + 1}/${keywords.length}] Processing: "${itemIntent.topic}"...`);

        try {
          // Generate Article Markdown
          const article = await this.generateSingleArticle(itemIntent);

          // Generate or fetch Cover Image
          const coverImageRel = await this.imageService.generateArticleCover(article.slug, itemIntent.topic);

          // Complete Frontmatter with coverImage & canonicalUrl
          const rawMarkdown = this.assembleMarkdown(article, coverImageRel);

          // Run through ArticleQualityGate (sanitization + strict validation)
          const gateResult = this.qualityGate.processAndValidate(rawMarkdown, {
            title: article.title,
            description: article.description,
            slug: article.slug,
            author: 'Arthur Vance',
            pubDate: article.pubDate,
            tags: itemIntent.tags,
            seoKeywords: itemIntent.seoKeywords,
            coverImage: coverImageRel,
          });

          const fullMarkdown = gateResult.content;
          if (gateResult.fixesApplied.length > 0) {
            console.log(`   🛡️ [QualityGate] Fixes applied: ${gateResult.fixesApplied.join(', ')}`);
          }

          // Write .md file to disk
          const postFilePath = path.join(postsDir, `${article.slug}.md`);
          fs.writeFileSync(postFilePath, fullMarkdown, 'utf8');

          // Register in SQLite content_queue_v2 as DISPATCHED
          const publicUrl = `https://flirtcheck.site/blog/${article.slug}/`;
          const queueItemId = `blog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

          const blogPayload: BlogPostPayload = {
            slug: article.slug,
            title: article.title,
            description: article.description,
            tags: itemIntent.tags,
            seoKeywords: itemIntent.seoKeywords,
            markdownContent: fullMarkdown,
            targetAudience: 'singles_21_45_us_uk_ca_au',
            intent: itemIntent.intent,
            pubDate: article.pubDate,
            author: 'Arthur Vance',
          };

          this.queueRepo.enqueue({
            id: queueItemId,
            campaign_id: `seo_content_hub_${itemIntent.cluster}`,
            network: 'lospollos',
            target_platform: 'BLOG_POST',
            platform: 'BLOG_POST',
            subreddit: itemIntent.cluster,
            target_url: publicUrl,
            published_url: publicUrl,
            payload: JSON.stringify(blogPayload),
            hook: article.title,
            body: fullMarkdown,
            stealth_cta: 'Access Verified Singles Portal',
            tracking_url: '/r/dating',
            image_path: coverImageRel,
            risk_score: 2,
            status: 'DISPATCHED',
            created_at: Date.now(),
            updated_at: Date.now(),
          });

          // Create downstream Social Snippets
          const snippetIds = await this.createChildSocialSnippets(queueItemId, article.slug, article.title, publicUrl, itemIntent);
          childSnippetCount += snippetIds.length;

          publishedItems.push({
            id: queueItemId,
            slug: article.slug,
            title: article.title,
            url: publicUrl,
            filePath: postFilePath,
            coverImage: coverImageRel,
          });

          console.log(`   ✅ Article [${i + 1}/${keywords.length}] saved: ${article.slug}.md`);
        } catch (postErr: any) {
          console.error(`   ❌ Failed processing "${itemIntent.topic}":`, postErr.message);
          errors.push(`${itemIntent.topic}: ${postErr.message}`);
        }
      }

      // 2. Run Astro static build EXACTLY ONCE after all articles are saved
      let buildOutput = 'Skipped by options';
      if (!options.skipAstroBuild && publishedItems.length > 0) {
        console.log(`\n🔨 [AutoPublisherService] Triggering single consolidated Astro build for ${publishedItems.length} new articles...`);
        try {
          const rootDir = this.resolveWorkspaceRoot();
          const { stdout, stderr } = await execAsync('npm run build:blog', {
            cwd: rootDir,
            timeout: 180000,
            env: { ...process.env, NODE_ENV: 'production', ASTRO_TELEMETRY_DISABLED: '1' },
          });
          buildOutput = stdout || stderr;
          console.log(`✅ [AutoPublisherService] Consolidated Astro build completed successfully!`);
        } catch (buildErr: any) {
          console.error(`⚠️ [AutoPublisherService] Astro build warning:`, buildErr.message);
          errors.push(`Astro build error: ${buildErr.message}`);
        }
      }

      const durationMs = Date.now() - startTime;
      console.log(`\n🎉 [AutoPublisherService] Batch finished! Created ${publishedItems.length} articles, ${childSnippetCount} snippets in ${(durationMs / 1000).toFixed(1)}s.`);

      return {
        success: publishedItems.length > 0,
        totalRequested: keywords.length,
        generatedCount: publishedItems.length,
        publishedItems,
        childSnippetCount,
        buildOutput,
        durationMs,
        errors,
      };
    } finally {
      this.isBatchRunning = false;
    }
  }

  /**
   * Generates single article via LLM
   */
  private async generateSingleArticle(intent: KeywordIntent): Promise<{
    title: string;
    description: string;
    slug: string;
    author: string;
    pubDate: string;
    bodyMarkdown: string;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const systemPrompt = `You are Arthur Vance, Lead Forensic Investigator and Editor at FlirtCheck.site (Cheltenham Bureau, Station 04).
You spent your career analyzing network packet architectures, low-latency transmission channels, and automated fraud-detection infrastructure across the UK telecommunications sector, operating near Britain's cyber intelligence cluster in Cheltenham.
Your mission: Authoritative, deeply engaging, literary yet forensic guides on dating verification, romance scam prevention, algorithmic manipulation, and authentic relationship psychology.

CORE EDITORIAL REQUIREMENTS:
1. TITLE: Catchy, high-CTR, authoritative 2026 title containing the primary keyword.
2. DESCRIPTION: Concise 140-160 character meta description with a clear investigative hook.
3. BODY STRUCTURE:
   - # H1 Title (will be converted into frontmatter title)
   - Opening signature: Begin with an evocative aphorism following the formula «Love is... [sharp poetic observation on human warmth vs digital deception]».
   - Field Hook & Context: Deadpan British clarity, real-world telemetry (delayed responses, unnatural typing cadence, LLM token repetition, immediate WhatsApp redirects, suspicious image EXIF).
   - Key Takeaways Dossier: 3-4 bullet points summarizing the investigation.
   - 3-4 Deep Tactical Sections with H3 sub-headers: Detailed anatomy of deception, forensic verification protocols (spectrogram audio analysis via Audacity, cross-engine reverse image search, spontaneous unscheduled 30-second video check to test facial liveness).
   - Legitimate Risk Scoring Callout: Naturally guide the reader to test profile markers through our client-side [Dating Risk Calculator](/calculator/) to evaluate threat vectors safely without disclosing private data.
   - Frequently Asked Questions: Standardized H2 "## Frequently Asked Questions" with 3-4 rigorous Q&A pairs (optimized for Schema.org FAQPage).
4. ABSOLUTE PROHIBITIONS (STRICT ZERO SYNTHETIC / ZERO AI-GARBAGE RULE):
   - STRICTLY FORBIDDEN to hallucinate fake products or portals: NEVER mention "FlirtCheck Verified Portal", "VoiceGuard AI", "VisionScout", "Sensity AI", or "AI-Shield".
   - STRICTLY FORBIDDEN to invent fake accuracy statistics (NEVER write "98.4%", "99% detection accuracy", or "guaranteed detection").
   - STRICTLY FORBIDDEN to use corporate AI clichés: "In today's fast-paced digital world", "Let's dive into", "In conclusion", "Plays a crucial role", "Unlock your potential".
   - NO decorative emojis in headings (NO "## ❓", NO "## 🔍", NO "## 💡"). Headings must be clean, typographic, and authoritative.
5. TONE: Deadpan British analytical wit, observant, deeply humane, forensic.
6. LENGTH: 850 - 1350 words.`;

    const userPrompt = `TOPIC: ${intent.topic}
PRIMARY KEYWORD: ${intent.keyword}
CLUSTER: ${intent.cluster}
LSI KEYWORDS: ${intent.seoKeywords.join(', ')}

Output ONLY the article markdown. Start with the main # Title.`;

    const { text } = await AIGateway.generateText(systemPrompt, userPrompt, {
      temperature: 0.72,
      maxTokens: 3500,
    });

    if (!text || text.length < 400) {
      throw new Error(`Insufficient LLM response length: ${text?.length || 0}`);
    }

    // Extract title
    const titleMatch = text.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : intent.topic;
    const slug = this.slugify(title);

    // Extract or build description
    const description = `Investigative protocol on ${intent.keyword} by Arthur Vance (Cheltenham Bureau). Field telemetry and technical verification rules.`;

    // Strip out top H1 to avoid duplicating with Astro layout
    const bodyMarkdown = text.replace(/^#\s+.+$/m, '').trim();

    return {
      title,
      description,
      slug,
      author: 'Arthur Vance',
      pubDate: today,
      bodyMarkdown,
    };
  }

  /**
   * Assembles clean Astro-compatible YAML frontmatter and body
   */
  private assembleMarkdown(
    article: {
      title: string;
      description: string;
      slug: string;
      author: string;
      pubDate: string;
      bodyMarkdown: string;
    },
    coverImage: string
  ): string {
    const frontmatter = `---
title: ${JSON.stringify(article.title)}
description: ${JSON.stringify(article.description)}
pubDate: "${article.pubDate}"
author: "Arthur Vance"
tags: ["Safety", "Dating Advice", "Verification"]
seoKeywords: [${JSON.stringify(article.title)}]
canonicalUrl: "https://flirtcheck.site/blog/${article.slug}/"
coverImage: "${coverImage}"
draft: false
---

${article.bodyMarkdown}
`;
    return frontmatter;
  }

  /**
   * Creates 2 downstream Social Snippets (Reddit & Twitter) in SQLite queue
   */
  private async createChildSocialSnippets(
    parentBlogPostId: string,
    slug: string,
    title: string,
    postUrl: string,
    intent: KeywordIntent
  ): Promise<string[]> {
    const snippetIds: string[] = [];
    const now = Date.now();

    // 1. Reddit Case Discussion
    const redditId = `snip_rd_${now}_${crypto.randomBytes(2).toString('hex')}`;
    const redditHook = `Question regarding ${intent.keyword}: how do you verify matches before meeting?`;
    const redditBody = `Hey everyone, seeing a huge spike in unverified profiles and potential bot scripts on dating apps lately.

Just finished researching the latest 2026 verification protocols:
1. Quick background lookup on photos.
2. Inconsistent replies and sudden off-app invites to WhatsApp.
3. Pre-meeting public phone/video verification.

Full breakdown and safety checklists: ${postUrl}

What is your personal go-to checklist before meeting an online match in person?`;

    this.queueRepo.enqueue({
      id: redditId,
      campaign_id: `social_syndication_${slug}`,
      network: 'organic',
      target_platform: 'SOCIAL_SNIPPET',
      platform: 'REDDIT',
      subreddit: intent.cluster === 'scam_detection' ? 'DatingApps' : 'dating_advice',
      target_url: postUrl,
      payload: JSON.stringify({
        parentBlogPostId,
        blogSlug: slug,
        platform: 'Reddit',
        content: redditBody,
        url: postUrl,
      }),
      hook: redditHook,
      body: redditBody,
      stealth_cta: 'View Guide Discussion',
      tracking_url: postUrl,
      image_path: '',
      risk_score: 1,
      status: 'PENDING_APPROVAL',
      created_at: now,
      updated_at: now,
    });
    snippetIds.push(redditId);

    // 2. Twitter/X Thread
    const twitterId = `snip_tw_${now}_${crypto.randomBytes(2).toString('hex')}`;
    const twitterHook = `🧵 4-Step Protocol: ${title.slice(0, 60)}...`;
    const twitterBody = `Over 30% of dating app profiles now show synthetic activity or bot patterns.

Here is a 4-step verification protocol for 2026:
1. Reverse search profile photos.
2. Check for sudden off-platform migration pressure.
3. Confirm social media or mutual footprint.
4. Always meet in high-traffic public venues.

Read the complete editorial playbook: ${postUrl} #DatingSafety #OnlineDating #RomanceTips`;

    this.queueRepo.enqueue({
      id: twitterId,
      campaign_id: `social_syndication_${slug}`,
      network: 'organic',
      target_platform: 'SOCIAL_SNIPPET',
      platform: 'TWITTER',
      subreddit: 'dating',
      target_url: postUrl,
      payload: JSON.stringify({
        parentBlogPostId,
        blogSlug: slug,
        platform: 'Twitter',
        content: twitterBody,
        url: postUrl,
      }),
      hook: twitterHook,
      body: twitterBody,
      stealth_cta: 'Read Thread',
      tracking_url: postUrl,
      image_path: '',
      risk_score: 1,
      status: 'PENDING_APPROVAL',
      created_at: now,
      updated_at: now,
    });
    snippetIds.push(twitterId);

    return snippetIds;
  }

  private resolveWorkspaceRoot(): string {
    const candidates = [
      process.cwd(),
      path.resolve(process.cwd(), '..'),
      path.resolve(__dirname, '../../../'),
      path.resolve(__dirname, '../../'),
    ];
    for (const c of candidates) {
      if (fs.existsSync(path.join(c, 'blog/astro.config.mjs'))) {
        return c;
      }
    }
    return process.cwd();
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

export const autoPublisherService = AutoPublisherService.getInstance();
