import crypto from 'crypto';
import { AIGateway } from './aiGateway.js';
import { ContentQueueRepository, ContentQueueItem, BlogPostPayload } from '../db/queueRepository.js';
import { MAX_COPYWRITER_SYSTEM_PROMPT } from '../agents/copywriter.js';

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

    const systemPrompt = `${MAX_COPYWRITER_SYSTEM_PROMPT}

ТЕХНИЧЕСКИЕ ТРЕБОВАНИЯ К ФОРМАТУ СТАТЬИ БЛОГА:
1. ФОРМАТ ВЫВОДА: Валидный Frontmatter (YAML) в самом начале, затем тело статьи в Markdown.
2. СТРУКТУРА FRONTMATTER:
---
title: "Хлесткий кликабельный заголовок без штампов"
description: "Емкое мета-описание 150-160 знаков без воды и банальностей."
pubDate: "${new Date().toISOString().split('T')[0]}"
author: "The Romantic Essayist (FlirtCheck Editorial)"
tags: ["Safety", "Verification", "Dating Advice"]
seoKeywords: ["primary keyword", "secondary keyword 1", "secondary keyword 2"]
canonicalUrl: "https://flirtcheck.site/blog/SLUG_HERE/"
draft: false
---

3. ПРАВИЛА СТРУКТУРЫ И СТИЛЯ (ЭСТЕТИКА РОМАНИСТА И ЭССЕИСТА):
- # Заголовок H1 (совпадает с title)
- 1. ХУК: Начни с девиза «Love is... [поэтическая правда в паре с реалистичной цифровой бдительностью]». Без приветствий и шаблонного разгона. Живая дневниковая деталь, тепло человеческого вздоха против стерильного скрипта.
- 2. МЯСО: Элегантное расследование ценителя. Конкретные примеры бот-сценариев, разбор фальшивок без злобы, но с понимающей улыбкой. Метафоры писем, пауз, опечаток.
- 3. ИНТЕГРАЦИЯ КАЛЬКУЛЯТОРА РИСКА: Органично и ненавязчиво ("Если сомневаетесь в искренности собеседника — оцените ключевые маркеры через клиентский калькулятор риска знакомства FlirtCheck [/calculator/]. Берегите личные данные.").
- 4. СТРОГИЙ АНТИСИНТЕТИЧЕСКИЙ ЗАПРЕТ: Запрещено выдумывать несуществующие порталы (никаких "FlirtCheck Verified Portal", "VoiceGuard AI", "VisionScout"), запрещены вымышленные проценты точности ("98.4%", "99% detection accuracy"). Опираться только на реальные методы OSINT, анализ спектрограмм и спонтанные видеозвонки.
- 5. ФИНАЛ: Поэтичная, открытая мысль о защите настоящего сердца без слова "Вывод".
- ## Frequently Asked Questions: 3 нестандартных живых вопроса и честных ответа от автора эссе (для Schema.org). Никаких цветных эмодзи в заголовках.
- Объем: 700 - 1200 слов. Строжайший запрет на любые ИИ-клише, одинаковые по длине списки и машинный жаргон!`;

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

    // Sanitize generated article from any residual AI hallucinations or noisy emojis
    const sanitizedText = this.sanitizePostContent(text);

    // Parse Frontmatter and content
    const parsed = this.parsePostMarkdown(sanitizedText, topic, keyword);

    const itemId = `blog_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    const blogPayload: BlogPostPayload = {
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description,
      tags: parsed.tags,
      seoKeywords: parsed.seoKeywords,
      markdownContent: sanitizedText,
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

  /**
   * Cleans raw generated markdown from any synthetic hallucinations, fake tools or spam emojis
   */
  public sanitizePostContent(rawText: string): string {
    let text = rawText;

    // Replace hallucinated portal and fake tool names
    text = text.replace(
      /##\s*[\p{Emoji}\u2000-\u3300]*\s*Moving to Verified Platforms[\s\S]*?(?=##|\n---\s*\n##|$)/gu,
      `## Independent Verification & Risk Protocol\n\nThe defensive tactics above apply across any mainstream dating platform. Before sharing personal contact details, residential location, or financial context, run the profile markers through our client-side [Dating Risk Calculator](/calculator/) to evaluate threat vectors without exposing private data. Pair manual OSINT cross-referencing with an unscheduled 30-second video check to confirm liveness and acoustic authenticity.\n\n`
    );

    text = text.replace(/\[FlirtCheck Verified Portal\]\([^)]+\)/gi, '[Dating Risk Calculator](/calculator/)');
    text = text.replace(/FlirtCheck(?:'s)? Verified Portal/gi, 'FlirtCheck Forensic Archive');
    text = text.replace(/video call on FlirtCheck/gi, 'direct video call');
    text = text.replace(/the new 2026 VoiceGuard AI \(available as a free web tool\)/gi, 'an open-source spectrogram analyzer (such as Audacity) or live unscripted questions');
    text = text.replace(/VoiceGuard AI/gi, 'audio frequency spectrogram analysis');
    text = text.replace(/VisionScout/gi, 'cross-engine reverse image indexing');
    text = text.replace(/30-секундный радар/gi, 'калькулятор риска');
    text = text.replace(/30‑second \*\*FlirtCheck\*\* verification filter/gi, 'client-side [Dating Risk Calculator](/calculator/)');
    text = text.replace(/99% detection accuracy/gi, 'reliable multi-engine verification');
    text = text.replace(/98\.4%/gi, 'high');

    // Clean noisy emojis from headers
    text = text.replace(/^##\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]\s*/gmu, '## ');
    text = text.replace(/^###\s*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]\s*/gmu, '### ');

    return text;
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
