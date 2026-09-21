/**
 * ArticleQualityGateService
 * Centralized gatekeeper and sanitizer for blog articles.
 * 
 * Enforces Arthur Vance editorial persona (Cheltenham Bureau, Station 04):
 * - ZERO AI synthetic tools or hallucinated portals.
 * - ZERO fake detection metrics or guarantees.
 * - ZERO noisy emojis in headings.
 * - Strict Author: Arthur Vance.
 * - Valid Schema.org FAQ structure and minimum word count (>= 700 words).
 */

// @ts-ignore
import yaml from 'js-yaml';

export interface ArticleMetadata {
  title?: string;
  description?: string;
  author?: string;
  category?: string;
  caseId?: string;
  classification?: string;
  telemetryRisk?: string;
  motto?: string;
  slug?: string;
  pubDate?: string;
  tags?: string[];
  seoKeywords?: string[];
  canonicalUrl?: string;
  coverImage?: string;
}

export interface SanitizedArticleResult {
  content: string;
  frontmatter: ArticleMetadata;
  bodyMarkdown: string;
  fixesApplied: string[];
}

export interface ValidationReport {
  isValid: boolean;
  score: number; // 0 to 100
  violations: string[]; // Critical blocking issues
  warnings: string[]; // Non-blocking suggestions
  wordCount: number;
}

export class ArticleQualityGateService {
  private static instance: ArticleQualityGateService | null = null;

  public static getInstance(): ArticleQualityGateService {
    if (!this.instance) {
      this.instance = new ArticleQualityGateService();
    }
    return this.instance;
  }

  // Banned synthetic tool and portal patterns (Auto-Sanitized)
  private readonly SYNTHETIC_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
    {
      pattern: /\[FlirtCheck Verified Portal\]\([^)]+\)/gi,
      replacement: '[Dating Risk Calculator](/calculator/)',
      reason: 'Replaced hallucinated portal link with client-side Dating Risk Calculator',
    },
    {
      pattern: /FlirtCheck(?:'s)? Verified Portal/gi,
      replacement: 'FlirtCheck Forensic Archive',
      reason: 'Replaced hallucinated "FlirtCheck Verified Portal" with Forensic Archive',
    },
    {
      pattern: /video call on FlirtCheck/gi,
      replacement: 'direct video call',
      reason: 'Removed nonexistent video-call feature on FlirtCheck',
    },
    {
      pattern: /the new 2026 VoiceGuard AI \(available as a free web tool\)/gi,
      replacement: 'an open-source spectrogram analyzer (such as Audacity) or live unscripted questions',
      reason: 'Replaced hallucinated VoiceGuard AI tool with Audacity spectrogram',
    },
    {
      pattern: /VoiceGuard AI/gi,
      replacement: 'live acoustic spectrogram check',
      reason: 'Replaced hallucinated VoiceGuard AI with acoustic spectrogram',
    },
    {
      pattern: /VisionScout/gi,
      replacement: 'cross-engine reverse image indexing',
      reason: 'Replaced hallucinated VisionScout with reverse image indexing',
    },
    {
      pattern: /Sensity AI|AI-Shield/gi,
      replacement: 'open forensic heuristics',
      reason: 'Replaced hallucinated third-party AI suites',
    },
    {
      pattern: /StickyRadar/gi,
      replacement: 'Dating Risk Calculator',
      reason: 'Replaced synthetic radar reference with risk calculator',
    },
    {
      pattern: /30‑second \*\*FlirtCheck\*\* verification filter/gi,
      replacement: 'client-side [Dating Risk Calculator](/calculator/)',
      reason: 'Replaced synthetic 30-second filter with Dating Risk Calculator',
    },
    {
      pattern: /99% detection accuracy/gi,
      replacement: 'reliable multi-engine verification',
      reason: 'Removed synthetic 99% accuracy metric',
    },
    {
      pattern: /98\.4%/gi,
      replacement: 'high-confidence',
      reason: 'Removed synthetic 98.4% metric',
    },
  ];

  // Banned AI clichés that weaken the authorial voice
  private readonly CLICHE_REPLACEMENTS: Array<{ pattern: RegExp; replacement: string; reason: string }> = [
    {
      pattern: /In today'?s (?:fast-paced|rapidly evolving) digital world,?\s*/gi,
      replacement: 'Across modern digital communication channels, ',
      reason: 'Cleaned generic AI introductory cliché',
    },
    {
      pattern: /Let'?s dive into\s+/gi,
      replacement: 'Examining ',
      reason: 'Cleaned generic AI conversational filler',
    },
    {
      pattern: /^##\s*(?:In )?Conclusion\b.*$/gim,
      replacement: '## The Analytical Perspective',
      reason: 'Replaced generic "Conclusion" heading with analytical closing section',
    },
  ];

  // Regex to match noisy emoji characters
  private readonly EMOJI_REGEX = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gu;

  /**
   * Sanitizes markdown text and frontmatter.
   * Eliminates AI hallucinations, cleans noisy emojis, normalizes headers and author.
   */
  public sanitize(rawContent: string, defaultMeta: ArticleMetadata = {}): SanitizedArticleResult {
    const fixesApplied: string[] = [];
    let text = rawContent;

    // 1. Check & normalize Frontmatter vs Body
    let parsedFrontmatter: ArticleMetadata = { ...defaultMeta };
    let bodyMarkdown = text;

    const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (fmMatch) {
      const fmBlock = fmMatch[1];
      bodyMarkdown = fmMatch[2].trim();

      try {
        const loaded: any = yaml.load(fmBlock);
        if (loaded && typeof loaded === 'object') {
          if (loaded.title && loaded.title !== '>-') parsedFrontmatter.title = String(loaded.title).trim();
          if (loaded.description && loaded.description !== '>-') parsedFrontmatter.description = String(loaded.description).trim();
          if (loaded.author) parsedFrontmatter.author = String(loaded.author).trim();
          if (loaded.pubDate) parsedFrontmatter.pubDate = String(loaded.pubDate).trim();
          if (loaded.category) parsedFrontmatter.category = String(loaded.category).trim();
          if (loaded.caseId) parsedFrontmatter.caseId = String(loaded.caseId).trim();
          if (loaded.classification) parsedFrontmatter.classification = String(loaded.classification).trim();
          if (loaded.telemetryRisk) parsedFrontmatter.telemetryRisk = String(loaded.telemetryRisk).trim();
          if (loaded.motto) parsedFrontmatter.motto = String(loaded.motto).trim();
          if (loaded.canonicalUrl) {
            const m = String(loaded.canonicalUrl).match(/https?:\/\/[^/]+\/(?:blog\/)?([^/]+)\/?/);
            if (m && m[1]) parsedFrontmatter.slug = m[1];
          }
          if (loaded.coverImage || loaded.image) {
            const imgVal = String(loaded.coverImage || loaded.image).trim();
            if (!imgVal.includes('/-cover.webp')) {
              parsedFrontmatter.coverImage = imgVal;
            }
          }
          if (Array.isArray(loaded.tags)) parsedFrontmatter.tags = loaded.tags;
          if (Array.isArray(loaded.seoKeywords)) parsedFrontmatter.seoKeywords = loaded.seoKeywords;
        }
      } catch {
        // Fallback simple line regexes
        const titleMatch = fmBlock.match(/title:\s*["']?([^"'\n\r]+)["']?/i);
        if (titleMatch && titleMatch[1].trim() !== '>-') parsedFrontmatter.title = titleMatch[1].trim();
      }
    }

    // 2. Enforce Arthur Vance as strictly required author
    if (!parsedFrontmatter.author || parsedFrontmatter.author !== 'Arthur Vance') {
      fixesApplied.push(`Enforced author to "Arthur Vance" (was: "${parsedFrontmatter.author || 'undefined'}")`);
      parsedFrontmatter.author = 'Arthur Vance';
    }

    // 3. Strip duplicate top # H1 from body markdown if present (Astro layout handles H1)
    if (/^#\s+.+$/m.test(bodyMarkdown)) {
      bodyMarkdown = bodyMarkdown.replace(/^#\s+.+$/m, '').trim();
      fixesApplied.push('Stripped duplicate top H1 header from markdown body');
    }

    // 4. Apply Synthetic Replacements
    for (const { pattern, replacement, reason } of this.SYNTHETIC_REPLACEMENTS) {
      if (pattern.test(bodyMarkdown)) {
        bodyMarkdown = bodyMarkdown.replace(pattern, replacement);
        fixesApplied.push(reason);
      }
    }

    // 5. Apply Cliché Replacements
    for (const { pattern, replacement, reason } of this.CLICHE_REPLACEMENTS) {
      if (pattern.test(bodyMarkdown)) {
        bodyMarkdown = bodyMarkdown.replace(pattern, replacement);
        fixesApplied.push(reason);
      }
    }

    // 6. Clean Noisy Emojis from Headings
    const headerRegex = /^(#{1,4})\s*(.*?)$/gm;
    let headerCleanedCount = 0;
    bodyMarkdown = bodyMarkdown.replace(headerRegex, (match, hashes, title) => {
      if (this.EMOJI_REGEX.test(title)) {
        headerCleanedCount++;
        const cleanedTitle = title.replace(this.EMOJI_REGEX, '').replace(/\s+/g, ' ').trim();
        return `${hashes} ${cleanedTitle}`;
      }
      return match;
    });
    if (headerCleanedCount > 0) {
      fixesApplied.push(`Cleaned decorative emojis from ${headerCleanedCount} markdown heading(s)`);
    }

    // 7. Normalize FAQ Header for Schema.org compatibility
    if (/^##\s*.*(?:FAQ|Frequently Asked Questions).*$/gmi.test(bodyMarkdown)) {
      const beforeNorm = bodyMarkdown;
      bodyMarkdown = bodyMarkdown.replace(
        /^##\s*.*(?:FAQ|Frequently Asked Questions).*$/gmi,
        '## Frequently Asked Questions'
      );
      if (beforeNorm !== bodyMarkdown) {
        fixesApplied.push('Normalized FAQ heading to "## Frequently Asked Questions"');
      }
    }

    // 8. Reconstruct full clean content with Frontmatter
    const title = (parsedFrontmatter.title && parsedFrontmatter.title !== '>-')
      ? parsedFrontmatter.title
      : (defaultMeta.title || 'Dating Verification Dispatch');
    const description = (parsedFrontmatter.description && parsedFrontmatter.description !== '>-')
      ? parsedFrontmatter.description.slice(0, 160)
      : ((defaultMeta.description || 'Investigative protocol by Arthur Vance.').slice(0, 160));
    const pubDate = parsedFrontmatter.pubDate || defaultMeta.pubDate || new Date().toISOString().split('T')[0];
    const slug = parsedFrontmatter.slug || defaultMeta.slug || (title !== '>-' ? this.slugify(title) : 'dispatch');
    const canonicalUrl = `https://flirtcheck.site/blog/${slug}/`;
    const coverImage = parsedFrontmatter.coverImage || defaultMeta.coverImage || `/images/posts/${slug}.webp`;
    const tags = defaultMeta.tags || parsedFrontmatter.tags || ['Safety', 'Dating Advice', 'Verification'];
    const seoKeywords = defaultMeta.seoKeywords || parsedFrontmatter.seoKeywords || [title];
    const category = parsedFrontmatter.category || defaultMeta.category || 'safety-dossier';
    const caseId = parsedFrontmatter.caseId || defaultMeta.caseId || `FC-${Math.floor(Math.random() * 899 + 100)}-DOS`;
    const classification = parsedFrontmatter.classification || defaultMeta.classification || 'PUBLIC INVESTIGATION DOSSIER // DECLASSIFIED 2026';
    const telemetryRisk = parsedFrontmatter.telemetryRisk || defaultMeta.telemetryRisk || 'MEDIUM';
    const motto = parsedFrontmatter.motto || defaultMeta.motto;

    const cleanFrontmatter: ArticleMetadata = {
      title,
      description,
      pubDate,
      author: 'Arthur Vance',
      category,
      caseId,
      classification,
      telemetryRisk,
      motto,
      slug,
      canonicalUrl,
      coverImage,
      tags,
      seoKeywords,
    };

    const fullSanitizedMarkdown = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
pubDate: "${pubDate}"
category: ${JSON.stringify(category)}
caseId: ${JSON.stringify(caseId)}
classification: ${JSON.stringify(classification)}
author: "Arthur Vance"
telemetryRisk: ${JSON.stringify(telemetryRisk)}
${motto ? `motto: ${JSON.stringify(motto)}\n` : ''}tags: ${JSON.stringify(tags)}
seoKeywords: ${JSON.stringify(seoKeywords)}
canonicalUrl: "${canonicalUrl}"
coverImage: "${coverImage}"
image: "${coverImage}"
draft: false
---

${bodyMarkdown}
`;

    return {
      content: fullSanitizedMarkdown,
      frontmatter: cleanFrontmatter,
      bodyMarkdown,
      fixesApplied,
    };
  }

  /**
   * Validates markdown content against editorial quality criteria.
   */
  public validate(sanitizedContent: string): ValidationReport {
    const violations: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // 1. Word Count Check
    const cleanWords = sanitizedContent
      .replace(/---[\s\S]*?---/, '')
      .replace(/[#*`_\[\]()]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);

    const wordCount = cleanWords.length;
    if (wordCount < 700) {
      violations.push(`Article length is insufficient: ${wordCount} words (minimum 700 words required)`);
      score -= 30;
    } else if (wordCount < 800) {
      warnings.push(`Article length is marginal: ${wordCount} words (ideal is 850-1300 words)`);
      score -= 5;
    }

    // 2. Strict Zero Synthetic Hallucination Check
    const remainingSynthetics = [
      { pattern: /FlirtCheck('s)? Verified Portal/i, label: 'Unsanitized "FlirtCheck Verified Portal"' },
      { pattern: /VoiceGuard AI/i, label: 'Unsanitized "VoiceGuard AI"' },
      { pattern: /VisionScout/i, label: 'Unsanitized "VisionScout"' },
      { pattern: /Sensity AI/i, label: 'Unsanitized "Sensity AI"' },
      { pattern: /99% detection accuracy/i, label: 'Unsanitized "99% detection accuracy"' },
      { pattern: /98\.4%/i, label: 'Unsanitized "98.4%" metric' },
      { pattern: /30-секундный радар/i, label: 'Unsanitized "30-секундный радар"' },
    ];

    for (const { pattern, label } of remainingSynthetics) {
      if (pattern.test(sanitizedContent)) {
        violations.push(`Synthetic hallucination detected: ${label}`);
        score -= 25;
      }
    }

    // 3. Emoji in Headings Check
    const headerWithEmoji = /^(#{1,4})\s*.*[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}\u{1F191}-\u{1F251}]/gmu;
    if (headerWithEmoji.test(sanitizedContent)) {
      violations.push('Heading contains decorative emojis (strictly banned under Cheltenham Desk standard)');
      score -= 20;
    }

    // 4. Author Identity Check
    if (!/author:\s*"Arthur Vance"/i.test(sanitizedContent)) {
      violations.push('Author is not set to "Arthur Vance"');
      score -= 25;
    }

    // 5. Category Taxonomy Check
    const validCategories = [
      'algo-mechanics',
      'safety-dossier',
      'digital-dialogue',
      'modern-psychology',
      'first-dates',
      'romantic-essays'
    ];
    const catMatch = sanitizedContent.match(/^category:\s*["']?([a-z-]+)["']?/m);
    if (!catMatch || !validCategories.includes(catMatch[1].trim())) {
      violations.push(`Category is invalid or missing: "${catMatch ? catMatch[1] : 'none'}"`);
      score -= 20;
    }

    // 6. Schema.org FAQ Section Check
    if (!/##\s*Frequently Asked Questions/i.test(sanitizedContent)) {
      warnings.push('Missing standardized "## Frequently Asked Questions" heading for Schema.org FAQPage');
      score -= 10;
    }

    // 7. Signature Formula or Narrative Tone Check
    const hasLoveIsFormula = /Love is\.\.\./i.test(sanitizedContent);
    const hasAuthorialAnchor = /Arthur Vance|Cheltenham|forensic|spectrogram|OSINT|telemetry/i.test(sanitizedContent);
    if (!hasLoveIsFormula && !hasAuthorialAnchor) {
      warnings.push('Content lacks characteristic Arthur Vance narrative markers ("Love is..." formula or forensic investigative terminology)');
      score -= 10;
    }

    score = Math.max(0, Math.min(100, score));

    return {
      isValid: violations.length === 0,
      score,
      violations,
      warnings,
      wordCount,
    };
  }

  /**
   * Complete pipeline: Sanitize then Validate.
   * Throws Error if critical violations remain after sanitization.
   */
  public processAndValidate(rawContent: string, defaultMeta: ArticleMetadata = {}): SanitizedArticleResult {
    const sanitized = this.sanitize(rawContent, defaultMeta);
    const report = this.validate(sanitized.content);

    if (!report.isValid) {
      const issues = report.violations.join('; ');
      throw new Error(`[ArticleQualityGate] Article rejected by quality gate (Score: ${report.score}/100): ${issues}`);
    }

    return sanitized;
  }

  public slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 65);
  }
}

export const articleQualityGate = ArticleQualityGateService.getInstance();
