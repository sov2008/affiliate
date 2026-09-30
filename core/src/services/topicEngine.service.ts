import fs from 'fs';
import path from 'path';
import {
  EDITORIAL_TAXONOMY_POOL,
  EditorialTopicDefinition,
  TaxonomyCategory,
  calculateCategoryDeficits
} from '../config/datingTaxonomy.js';

export interface CategoryStatsReport {
  totalPosts: number;
  distribution: Record<TaxonomyCategory, number>;
  deficits: Array<{
    category: TaxonomyCategory;
    count: number;
    deficitScore: number;
  }>;
  existingSlugsCount: number;
}

export class TopicEngineService {
  private static instance: TopicEngineService | null = null;

  private constructor() {}

  public static getInstance(): TopicEngineService {
    if (!this.instance) {
      this.instance = new TopicEngineService();
    }
    return this.instance;
  }

  /**
   * Resolves blog posts directory
   */
  public resolvePostsDir(): string {
    const candidateDirs = [
      path.resolve(process.cwd(), 'blog/src/content/posts'),
      path.resolve(process.cwd(), '../blog/src/content/posts'),
      path.resolve(__dirname, '../../../blog/src/content/posts'),
      path.resolve(__dirname, '../../blog/src/content/posts'),
      '/var/www/affiliate/blog/src/content/posts',
    ];

    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }

    return path.resolve(process.cwd(), 'blog/src/content/posts');
  }

  /**
   * Scans posts on disk and returns current category distribution & existing slugs
   */
  public getCategoryStats(): CategoryStatsReport {
    const postsDir = this.resolvePostsDir();
    const distribution: Record<TaxonomyCategory, number> = {
      'algo-mechanics': 0,
      'safety-dossier': 0,
      'digital-dialogue': 0,
      'modern-psychology': 0,
      'first-dates': 0,
      'romantic-essays': 0,
    };

    let totalPosts = 0;
    const existingSlugs = new Set<string>();

    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      totalPosts = files.length;

      for (const file of files) {
        const slug = file.replace(/\.md$/, '').toLowerCase();
        existingSlugs.add(slug);

        try {
          const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
          const catMatch = content.match(/^category:\s*["']?([a-z-]+)["']?/m);
          if (catMatch && catMatch[1] in distribution) {
            distribution[catMatch[1] as TaxonomyCategory]++;
          } else {
            // Default fallback if unspecified
            distribution['safety-dossier']++;
          }
        } catch {}
      }
    }

    const deficits = calculateCategoryDeficits(distribution);

    return {
      totalPosts,
      distribution,
      deficits,
      existingSlugsCount: existingSlugs.size,
    };
  }

  /**
   * Selects next optimal topic batch balanced across under-represented categories
   * and avoiding any topic that has already been published.
   */
  public getBalancedNextTopicBatch(count: number = 5): EditorialTopicDefinition[] {
    const stats = this.getCategoryStats();
    const postsDir = this.resolvePostsDir();
    const existingSlugs = new Set<string>();

    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        existingSlugs.add(file.replace(/\.md$/, '').toLowerCase());
      }
    }

    // Filter out already published topics
    const availablePool = EDITORIAL_TAXONOMY_POOL.filter(t => !existingSlugs.has(t.slug.toLowerCase()));

    // Sort available topics by priority:
    // 1. Deficit score of category (highest deficit first)
    // 2. Search volume tier (TIER_1_MASS > TIER_2_CORE > TIER_3_NICHE)
    const categoryDeficitMap = new Map<TaxonomyCategory, number>();
    stats.deficits.forEach(d => categoryDeficitMap.set(d.category, d.deficitScore));

    const tierWeight: Record<string, number> = {
      'TIER_1_MASS': 3,
      'TIER_2_CORE': 2,
      'TIER_3_NICHE': 1,
    };

    const sortedTopics = [...availablePool].sort((a, b) => {
      const deficitA = categoryDeficitMap.get(a.category) || 0;
      const deficitB = categoryDeficitMap.get(b.category) || 0;

      if (Math.abs(deficitA - deficitB) > 0.05) {
        return deficitB - deficitA; // Prioritize highest deficit
      }

      // Tie-breaker: search volume tier
      const tierScoreA = tierWeight[a.searchVolumeTier] || 1;
      const tierScoreB = tierWeight[b.searchVolumeTier] || 1;
      return tierScoreB - tierScoreA;
    });

    const selected = sortedTopics.slice(0, count);
    if (selected.length >= count) {
      return selected;
    }

    // If available topics are fewer than requested, synthesize dynamic topics to avoid duplicates
    const needed = count - selected.length;
    const synthesized = this.synthesizeDynamicTopics(needed, existingSlugs, stats);
    return [...selected, ...synthesized];
  }

  /**
   * Synthesizes brand-new topics for deficit categories when predefined taxonomy pool is exhausted
   */
  private synthesizeDynamicTopics(
    count: number,
    existingSlugs: Set<string>,
    stats: CategoryStatsReport
  ): EditorialTopicDefinition[] {
    const dynamicTopics: EditorialTopicDefinition[] = [];
    const deficits = stats.deficits.length > 0 ? stats.deficits : [
      { category: 'safety-dossier' as TaxonomyCategory, count: 0, deficitScore: 1 },
      { category: 'algo-mechanics' as TaxonomyCategory, count: 0, deficitScore: 0.9 },
      { category: 'digital-dialogue' as TaxonomyCategory, count: 0, deficitScore: 0.8 },
      { category: 'first-dates' as TaxonomyCategory, count: 0, deficitScore: 0.7 },
      { category: 'modern-psychology' as TaxonomyCategory, count: 0, deficitScore: 0.6 },
      { category: 'romantic-essays' as TaxonomyCategory, count: 0, deficitScore: 0.5 }
    ];

    const templatesByCategory: Record<TaxonomyCategory, Array<{
      titleTpl: string;
      slugTpl: string;
      keyword: string;
      intent: EditorialTopicDefinition['intent'];
      prefix: EditorialTopicDefinition['caseIdPrefix'];
      risk: EditorialTopicDefinition['telemetryRisk'];
      motto: string;
    }>> = {
      'safety-dossier': [
        {
          titleTpl: 'AI Voice Cloning Romance Scams 2026: Acoustic Telemetry & Detection',
          slugTpl: 'ai-voice-cloning-romance-scams-acoustic-telemetry-detection',
          keyword: 'ai voice cloning romance scam 2026',
          intent: 'scam_verification',
          prefix: 'DOS',
          risk: 'CRITICAL',
          motto: 'Love is... verifying authentic vocal resonance before opening your heart.'
        },
        {
          titleTpl: 'Telegram Sextortion Blackmail Syndicates: Forensic Defense Blueprint',
          slugTpl: 'telegram-sextortion-blackmail-syndicates-forensic-defense-blueprint',
          keyword: 'telegram sextortion scam recovery guide',
          intent: 'scam_verification',
          prefix: 'DOS',
          risk: 'CRITICAL',
          motto: 'Love is... zero compromise with digital extortion syndicates.'
        }
      ],
      'algo-mechanics': [
        {
          titleTpl: 'Hinge Standouts Algorithm 2026: Collaborative Filtering & Exposure Matrix',
          slugTpl: 'hinge-standouts-algorithm-collaborative-filtering-exposure-matrix',
          keyword: 'how hinge standouts algorithm works',
          intent: 'algorithm_optimization',
          prefix: 'ALG',
          risk: 'HIGH',
          motto: 'Love is... escaping artificial paywalls to find real emotional resonance.'
        },
        {
          titleTpl: 'Tinder Secret ELO Decay Rate: Inactivity Penalties & Recovery Timelines',
          slugTpl: 'tinder-secret-elo-decay-rate-inactivity-penalties-recovery',
          keyword: 'tinder elo score decay inactivity',
          intent: 'algorithm_optimization',
          prefix: 'ALG',
          risk: 'MEDIUM',
          motto: 'Love is... knowing when the algorithm resets and your humanity begins.'
        }
      ],
      'digital-dialogue': [
        {
          titleTpl: 'The 15-Minute Rule: Pacing Dating App Replies to Prevent Conversation Death',
          slugTpl: '15-minute-rule-dating-app-reply-pacing-conversation-retention',
          keyword: 'how fast should you reply on dating apps',
          intent: 'chat_mastery',
          prefix: 'TXT',
          risk: 'LOW',
          motto: 'Love is... intentional cadence over compulsive notification checking.'
        }
      ],
      'modern-psychology': [
        {
          titleTpl: 'Situationship Attachment Traps: Neurochemical Bonding & Exit Strategy',
          slugTpl: 'situationship-attachment-traps-neurochemical-bonding-exit-strategy',
          keyword: 'situationship emotional trauma exit',
          intent: 'psychological_insight',
          prefix: 'PSY',
          risk: 'MEDIUM',
          motto: 'Love is... choosing unambiguous commitment over endless ambiguity.'
        }
      ],
      'first-dates': [
        {
          titleTpl: 'First Date Environmental Safety Audit: Neutral Venues, Exit Vectors & Telemetry',
          slugTpl: 'first-date-environmental-safety-audit-neutral-venues-exit-vectors',
          keyword: 'first date safety checklist venues',
          intent: 'first_date_prep',
          prefix: 'DAT',
          risk: 'LOW',
          motto: 'Love is... feeling safe enough to drop your defenses.'
        }
      ],
      'romantic-essays': [
        {
          titleTpl: 'Analog Dating in an Algorithmic World: The Art of Spontaneous Eye Contact',
          slugTpl: 'analog-dating-in-algorithmic-world-spontaneous-eye-contact',
          keyword: 'how to meet people offline organic dating',
          intent: 'philosophical_essay',
          prefix: 'ESS',
          risk: 'LOW',
          motto: 'Love is... looking up from the glass screen to see a real human soul.'
        }
      ]
    };

    let round = 0;
    while (dynamicTopics.length < count && round < 10) {
      for (const deficit of deficits) {
        if (dynamicTopics.length >= count) break;
        const cat = deficit.category;
        const templates = templatesByCategory[cat] || templatesByCategory['safety-dossier'];
        const chosen = templates[round % templates.length];

        let candidateSlug = chosen.slugTpl;
        if (existingSlugs.has(candidateSlug) || dynamicTopics.some(t => t.slug === candidateSlug)) {
          const suffix = Math.floor(1000 + Math.random() * 9000);
          candidateSlug = `${chosen.slugTpl}-case-${suffix}`;
        }

        if (!existingSlugs.has(candidateSlug)) {
          dynamicTopics.push({
            id: `dyn_${cat.slice(0, 3)}_${Date.now()}_${dynamicTopics.length}`,
            topic: chosen.titleTpl,
            slug: candidateSlug,
            keyword: chosen.keyword,
            category: cat,
            searchVolumeTier: 'TIER_2_CORE',
            intent: chosen.intent,
            seoKeywords: [chosen.keyword, `${cat} analysis`, 'dating safety 2026'],
            tags: [cat, 'Investigation', 'Dossier', '2026'],
            motto: chosen.motto,
            caseIdPrefix: chosen.prefix,
            telemetryRisk: chosen.risk,
          });
        }
      }
      round++;
    }

    return dynamicTopics;
  }

  /**
   * Generates case identifier for Arthur Vance dossier
   */
  public generateCaseId(prefix: string, seed: string): string {
    const num = Math.abs(this.hashCode(seed)) % 900 + 100;
    return `FC-${num}-${prefix.toUpperCase()}`;
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

export const topicEngine = TopicEngineService.getInstance();
