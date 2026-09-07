import crypto from 'crypto';
import { AIGateway } from './aiGateway.js';
import { ContentQueueRepository, ContentQueueItem, BlogPostPayload } from '../db/queueRepository.js';

export interface GenerateBlogRequest {
  keyword?: string;
  topic?: string;
  targetAudience?: string;
  campaignId?: string;
}

export const DATING_SEO_TOPICS = [
  {
    topic: 'Dating Profile Verification & Scam Detection',
    keyword: 'dating profile verification',
    seoKeywords: ['dating profile verification', 'spot fake profiles', 'romance scam indicators', 'ai catfish detector'],
    tags: ['Safety', 'Verification', 'Dating Advice', 'Anti-Fraud']
  },
  {
    topic: 'How to Spot Romance Scams and Deepfake Photos in 2026',
    keyword: 'romance scam red flags',
    seoKeywords: ['romance scam red flags', 'catfish signs', 'fake dating photos', 'online dating protection'],
    tags: ['Scams', 'Safety', 'Online Dating']
  },
  {
    topic: 'High-Converting Dating Profile Optimization & Photo Bio Rules',
    keyword: 'dating profile optimization',
    seoKeywords: ['dating profile optimization', 'best tinder bio', 'profile photo advice', 'attract real singles'],
    tags: ['Profile Tips', 'Dating Advice', 'Lifestyle']
  },
  {
    topic: 'Safe First Date Playbook: From Online Chat to Real-World Meetup',
    keyword: 'first date safety checklist',
    seoKeywords: ['first date safety checklist', 'safe meetup advice', 'online dating safety rules', 'public meeting protocol'],
    tags: ['Safety', 'First Date', 'Romance']
  },
  {
    topic: 'Psychological Icebreakers & Opening Messages That Get High Responses',
    keyword: 'best dating icebreakers',
    seoKeywords: ['best dating icebreakers', 'high response openers', 'chat starters', 'online dating conversation'],
    tags: ['Chat Tips', 'Icebreakers', 'Dating Advice']
  }
];

export class BlogGeneratorService {
  private static instance: BlogGeneratorService | null = null;
  private queueRepo: ContentQueueRepository;

  private constructor() {
    this.queueRepo = ContentQueueRepository.getInstance();
  }

  public static getInstance(): BlogGeneratorService {
    if (!this.instance) {
      this.instance = new BlogGeneratorService();
    }
    return this.instance;
  }

  /**
   * Generates a comprehensive SEO-optimized long-read blog post
   * and saves it to content_queue_v2 with status PENDING_APPROVAL.
   */
  public async generateBlogPost(params: GenerateBlogRequest = {}): Promise<ContentQueueItem> {
    const randomFallback = DATING_SEO_TOPICS[Math.floor(Math.random() * DATING_SEO_TOPICS.length)];
    const topic = params.topic || randomFallback.topic;
    const keyword = params.keyword || randomFallback.keyword;
    const audience = params.targetAudience || 'Singles active on dating platforms seeking genuine connections while avoiding automated bots';
    const campaignId = params.campaignId || 'cmp_lospollos_dating';

    console.log(`\n✍️ [BlogGeneratorService] Generating SEO post for: "${topic}" (Keyword: "${keyword}")...`);

    const systemPrompt = `You are a Senior Content Strategist & Safety Editor at FlirtCheck.site (Online Dating Verification & Safety Editorial).
Your mission is to produce authoritative, high-ranking, 100% human-quality educational guides on dating safety, profile optimization, scam prevention, and relationship intelligence.

REQUIREMENTS:
1. OUTPUT FORMAT: Valid Frontmatter (YAML) at the top, followed by Markdown article body.
2. FRONTMATTER FIELDS:
---
title: "Catchy, High-CTR 2026 Title Here"
description: "Compelling 150-160 char meta description summarizing key takeaways."
pubDate: "${new Date().toISOString().split('T')[0]}"
author: "FlirtCheck Editorial"
tags: ["Safety", "Profile Verification", "Dating Advice"]
seoKeywords: ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
canonicalUrl: "https://flirtcheck.site/blog/SLUG_HERE/"
draft: false
---

3. ARTICLE STRUCTURE:
- # Top Level Title (Matches Frontmatter Title)
- Engaging hook introduction outlining modern dating challenges (mention statistics, e.g. ~30%+ unverified accounts).
- ## 3 to 5 comprehensive thematic sections with practical bullet points and numbered protocols.
- Include an interactive checklist or self-test query section.
- Naturally reference FlirtCheck Profile Verification radar as a prudent precaution before meeting in person.
- ## ❓ Frequently Asked Questions (FAQ) section with 3 well-defined Q&A pairs (this powers Schema.org FAQPage).
- Tone: Empathetic, analytical, highly actionable, zero cheap filler.
- Word count: 700 - 1200 words.`;

    const userPrompt = `Generate a complete, publish-ready guide on:
TOPIC: ${topic}
PRIMARY KEYWORD: ${keyword}
TARGET AUDIENCE: ${audience}

Ensure the YAML frontmatter is clean and valid. Generate a clean URL-friendly slug based on the title.`;

    const { text, telemetry } = await AIGateway.generateText(systemPrompt, userPrompt, {
      temperature: 0.75,
      maxTokens: 3000,
    });

    if (!text || text.length < 300) {
      throw new Error(`LLM generation produced insufficient content (length: ${text?.length || 0})`);
    }

    // Parse Frontmatter and content
    const parsed = this.parsePostMarkdown(text, topic, keyword);

    const itemId = `blog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    const blogPayload: BlogPostPayload = {
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      tags: parsed.tags,
      seoKeywords: parsed.seoKeywords,
      markdownContent: text,
      targetAudience: audience,
      intent: 'educational_safety_inbound',
      pubDate: parsed.pubDate,
      author: parsed.author,
    };

    const queueItem = this.queueRepo.enqueue({
      id: itemId,
      campaign_id: campaignId,
      network: 'organic',
      target_platform: 'BLOG_POST',
      platform: 'BLOG_POST',
      subreddit: '',
      target_url: `https://flirtcheck.site/blog/${parsed.slug}/`,
      payload: JSON.stringify(blogPayload),
      hook: parsed.title,
      body: text,
      stealth_cta: 'Run Profile Safety Check',
      tracking_url: '/go',
      image_path: '',
      risk_score: 3, // Low compliance risk for educational editorial
      status: 'PENDING_APPROVAL',
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    console.log(`✅ [BlogGeneratorService] Enqueued "${parsed.title}" (ID: ${itemId}, Slug: ${parsed.slug}, Model: ${telemetry.model})`);

    return queueItem;
  }

  /**
   * Helper to parse YAML frontmatter and extract metadata
   */
  private parsePostMarkdown(rawText: string, fallbackTopic: string, fallbackKeyword: string) {
    let title = fallbackTopic;
    let description = `Comprehensive guide on ${fallbackKeyword} and online dating safety protocols in 2026.`;
    let slug = this.slugify(fallbackTopic);
    let tags = ['Safety', 'Dating Advice', 'Verification'];
    let seoKeywords = [fallbackKeyword, 'online dating safety', 'flirtcheck guide'];
    let pubDate = new Date().toISOString().split('T')[0];
    let author = 'FlirtCheck Editorial';

    const fmMatch = rawText.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fmMatch && fmMatch[1]) {
      const fmLines = fmMatch[1].split('\n');
      for (const line of fmLines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.slice(0, colonIdx).trim();
          let val = line.slice(colonIdx + 1).trim();
          val = val.replace(/^["']|["']$/g, ''); // strip quotes

          if (key === 'title' && val) {
            title = val;
            slug = this.slugify(val);
          } else if (key === 'description' && val) {
            description = val;
          } else if (key === 'pubDate' && val) {
            pubDate = val;
          } else if (key === 'author' && val) {
            author = val;
          } else if (key === 'tags') {
            try {
              tags = JSON.parse(val);
            } catch {
              tags = val.replace(/[\[\]]/g, '').split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
          } else if (key === 'seoKeywords') {
            try {
              seoKeywords = JSON.parse(val);
            } catch {
              seoKeywords = val.replace(/[\[\]]/g, '').split(',').map((k) => k.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
            }
          }
        }
      }
    }

    return {
      title,
      description,
      slug,
      tags: tags.length ? tags : ['Safety', 'Dating Advice'],
      seoKeywords: seoKeywords.length ? seoKeywords : [fallbackKeyword],
      pubDate,
      author,
    };
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
