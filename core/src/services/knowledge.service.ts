import fs from 'fs';
import path from 'path';

export interface LexiconRules {
  native_slang: string[];
  banned_commercial_triggers: string[];
  bridge_phrase_variations: string[];
}

export interface BehaviorHook {
  name: string;
  hook: string;
  psychological_trigger: string;
  open_loop: string;
  barnum_effect_formula: string;
  resolution_bridge: string;
}

export interface CopyGuardValidationResult {
  isValid: boolean;
  violations: string[];
  wordCount: number;
  hasBridge: boolean;
  hasUrl: boolean;
  sanitizedCopy?: string;
}

export class KnowledgeService {
  private static instance: KnowledgeService | null = null;
  private readonly knowledgeDir: string;
  private lexiconData: any = null;
  private behaviorData: any = null;
  private funnelData: any = null;

  private constructor(customDir?: string) {
    if (customDir) {
      this.knowledgeDir = customDir;
    } else {
      const candidates = [
        path.resolve(process.cwd(), 'core/data/knowledge'),
        path.resolve(process.cwd(), 'data/knowledge'),
      ];
      const existing = candidates.find((dir) => fs.existsSync(dir));
      this.knowledgeDir = existing ?? candidates[0];
    }
    this.loadAllAssets();
  }

  public static getInstance(customDir?: string): KnowledgeService {
    if (!this.instance || (customDir && this.instance.knowledgeDir !== customDir)) {
      this.instance = new KnowledgeService(customDir);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private loadAllAssets(): void {
    this.lexiconData = this.readJson('lexicon_guard.json');
    this.behaviorData = this.readJson('behavior_matrix.json');
    this.funnelData = this.readJson('funnel_blueprints.json');
  }

  private readJson(filename: string): any {
    const filePath = path.join(this.knowledgeDir, filename);
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (err) {
        console.warn(`[KnowledgeService] Error parsing ${filename}:`, err);
      }
    }
    return {};
  }

  /**
   * Returns platform-specific slang, banned triggers, and bridge variations
   */
  public getLexiconRules(platform: string = 'reddit'): LexiconRules {
    const normalized = platform.toLowerCase();
    const platRules = this.lexiconData?.platforms?.[normalized] || this.lexiconData?.platforms?.reddit || {};

    return {
      native_slang: platRules.native_slang || ['tbh', 'ngl', 'sanity check', 'dating app fatigue'],
      banned_commercial_triggers: platRules.banned_commercial_triggers || [
        'click here',
        'link in bio',
        'promo code',
        'affiliate',
      ],
      bridge_phrase_variations: platRules.bridge_phrase_variations || [
        'Documented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check.',
      ],
    };
  }

  /**
   * Returns behavior psychology hooks for a given vertical and angle
   */
  public getBehaviorHook(vertical: string = 'dating', angle: string = 'elo_trap'): BehaviorHook | null {
    if (this.behaviorData?.vertical === vertical && this.behaviorData?.angles?.[angle]) {
      return this.behaviorData.angles[angle];
    }
    // Fallback search across any matching angle key
    if (this.behaviorData?.angles) {
      for (const [key, val] of Object.entries(this.behaviorData.angles)) {
        if (key.toLowerCase().includes(angle.toLowerCase())) {
          return val as BehaviorHook;
        }
      }
    }
    return null;
  }

  /**
   * Returns all available behavior hooks for a vertical
   */
  public getAllBehaviorHooks(vertical: string = 'dating'): Record<string, BehaviorHook> {
    if (this.behaviorData?.vertical === vertical && this.behaviorData?.angles) {
      return this.behaviorData.angles;
    }
    return {};
  }

  /**
   * Returns the funnel blueprint schema and rules
   */
  public getFunnelBlueprint(): any {
    return this.funnelData || {};
  }

  /**
   * Returns tailored greeting based on source subreddit
   */
  public getMessageMatchGreeting(subreddit?: string): string {
    if (!subreddit) {
      return this.funnelData?.message_match_rules?.default || '👋 Welcome! Let\'s find your perfect local match.';
    }

    const rules = this.funnelData?.message_match_rules || {};
    return rules[subreddit] || rules.default || '👋 Welcome! Let\'s find your perfect local match.';
  }

  /**
   * Validates generated copy against Lexicon Guard rules:
   * 1. Strictly zero external URLs
   * 2. No commercial banned triggers
   * 3. Presence of a subtle profile bridge cue
   * 4. Word count limits
   */
  public validateCopyAgainstGuard(text: string, platform: string = 'reddit'): CopyGuardValidationResult {
    const violations: string[] = [];
    const rules = this.getLexiconRules(platform);

    // 1. Zero external URLs rule
    const urlRegex = /https?:\/\/[^\s]+/gi;
    const hasUrl = urlRegex.test(text);
    if (hasUrl) {
      violations.push('BANNED_EXTERNAL_URL: Copy contains forbidden direct URLs');
    }

    // 2. Banned commercial triggers check
    const lowerText = text.toLowerCase();
    for (const trigger of rules.banned_commercial_triggers) {
      if (lowerText.includes(trigger.toLowerCase())) {
        violations.push(`BANNED_COMMERCIAL_TRIGGER: "${trigger}" detected in copy`);
      }
    }

    // 3. Profile bio bridge check
    const bridgePatterns = [
      'profile bio',
      'in my bio',
      'in my profile',
      'my bio',
      'profile description',
      'pinned in bio',
      'pinned on my profile',
      'author bio',
    ];
    const hasBridge =
      bridgePatterns.some((pattern) => lowerText.includes(pattern)) ||
      (lowerText.includes('bio') && (lowerText.includes('bot') || lowerText.includes('filter') || lowerText.includes('breakdown') || lowerText.includes('tool')));
    if (!hasBridge) {
      violations.push('MISSING_BIO_BRIDGE: Copy lacks mandatory native profile bio bridge cue');
    }

    // 4. Word count check
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const isQuora = platform.toLowerCase() === 'quora';
    const minWords = isQuora ? 120 : (this.lexiconData?.universal_rules?.min_word_count || 45);
    const maxWords = isQuora ? 240 : (this.lexiconData?.universal_rules?.max_word_count || 135);

    if (wordCount < minWords) {
      violations.push(`WORD_COUNT_TOO_LOW: ${wordCount} words (minimum required: ${minWords})`);
    } else if (wordCount > maxWords) {
      violations.push(`WORD_COUNT_TOO_HIGH: ${wordCount} words (maximum allowed: ${maxWords})`);
    }

    let sanitizedCopy = text;
    // Auto-sanitizer: strip URLs if present
    if (hasUrl) {
      sanitizedCopy = sanitizedCopy.replace(urlRegex, '').trim();
    }
    // Auto-sanitizer: append bridge if missing
    if (!hasBridge) {
      const defaultBridge = rules.bridge_phrase_variations[0] || 'Documented the full breakdown and the filtering bot I use in my profile bio.';
      sanitizedCopy += `\n\n${defaultBridge}`;
    }

    return {
      isValid: violations.length === 0,
      violations,
      wordCount,
      hasBridge,
      hasUrl,
      sanitizedCopy,
    };
  }
}

export const knowledgeService = KnowledgeService.getInstance();
