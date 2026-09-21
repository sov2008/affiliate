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

    if (availablePool.length === 0) {
      // Fallback if all defined topics are published: return pool sorted by tier
      return EDITORIAL_TAXONOMY_POOL.slice(0, count);
    }

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

    return sortedTopics.slice(0, count);
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
