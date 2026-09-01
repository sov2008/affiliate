import { BaseAgent } from './base.agent.js';
import { ComplianceReport, GeneratedCreative, Platform } from '../types/pipeline.js';
import { LinkIntegrityService } from '../services/link-integrity.service.js';

export interface GuardEvaluationOptions {
  trackingUrl?: string;
  campaignId?: string;
  variant?: string;
}

interface RawCompliancePayload {
  score: number;
  flaggedKeywords: string[];
  reasoning: string;
  violationsDetected: string[];
}

export const BLACKLISTED_SPAM_PATTERNS = [
  'buy now',
  'click here',
  'limited time',
  'free money',
  'guaranteed profit',
  '100% success',
  'get rich quick',
  'earn $$$',
  'free access now',
  'download immediately',
  'secret formula',
  'guaranteed returns',
  'miracle cure',
];

export class ComplianceGuardAgent extends BaseAgent {
  constructor() {
    super('ComplianceGuardAgent');
  }

  /**
   * Evaluates generated creative copy against platform terms of service,
   * anti-spam policies, false claim regulations, and community guidelines.
   * Also verifies tracking URL integrity and landing page macros.
   */
  public async evaluate(
    creative: GeneratedCreative,
    platform: Platform,
    options: GuardEvaluationOptions = {}
  ): Promise<ComplianceReport> {
    this.checkEmergencyStop();

    // 1. Link & Macro Integrity Pre-flight Validation
    if (options.trackingUrl && options.campaignId) {
      const linkService = LinkIntegrityService.getInstance();
      const trackValidation = linkService.validatePostTrackingUrl(options.trackingUrl, options.campaignId);
      if (!trackValidation.isValid) {
        return {
          passed: false,
          score: 0,
          flaggedKeywords: ['BROKEN_TRACKING_URL'],
          reasoning: `Target tracking URL integrity failed: ${trackValidation.errors.join('; ')}`,
          violationsDetected: ['BROKEN_TARGET_LINK', 'MISSING_ATTRIBUTION_TAGS'],
        };
      }

      const landingReport = linkService.validateLandingPageLinks(options.campaignId, options.variant || 'v1');
      if (!landingReport.isValid) {
        return {
          passed: false,
          score: 0,
          flaggedKeywords: ['BROKEN_LANDING_MACROS'],
          reasoning: `Landing page macro integrity failed: ${landingReport.brokenLinks.concat(landingReport.missingMacros).join('; ')}`,
          violationsDetected: ['BROKEN_TARGET_LINK', 'CORRUPTED_CTA_MACRO'],
        };
      }
    }

    // 2. Deterministic Blacklist & Spam Trigger Pre-scan
    const combinedText = `${creative.headline} ${creative.body} ${creative.callToAction}`.toLowerCase();
    const locallyFlagged: string[] = [];

    for (const pattern of BLACKLISTED_SPAM_PATTERNS) {
      if (combinedText.includes(pattern)) {
        locallyFlagged.push(pattern);
      }
    }

    // Fast-path: Instant rejection on deterministic blacklisted triggers without wasting LLM calls
    if (locallyFlagged.length > 0) {
      return {
        passed: false,
        score: 0,
        flaggedKeywords: locallyFlagged,
        reasoning: `Deterministic anti-spam pre-scanner detected ${locallyFlagged.length} prohibited keyword(s): [${locallyFlagged.join(', ')}]. Blocked immediately with zero tolerance.`,
        violationsDetected: ['BLACKLISTED_SPAM_PATTERN_TRIGGERED', 'ZERO_TOLERANCE_POLICY'],
      };
    }

    const systemPrompt = `You are a Strict Platform Compliance Officer & Anti-Spam Auditor for ${platform.toUpperCase()}.
Your mission is to audit user-generated posts before publication and block any spam, deceptive marketing, aggressive claims, or platform ban triggers.

AUDIT CRITERIA:
1. Platform Guidelines (${platform.toUpperCase()}):
   - Reddit: Rule 9 self-promotion, spamming affiliate links, astroturfing.
   - Quora: Policy on spam, fake personal experience, commercial bots.
   - X (Twitter): Platform manipulation and spam policy.
   - Forums: Direct sales pitches, bot signatures, signature spam.
2. Claim Verification & Consumer Protection:
   - ZERO guaranteed income/investment/dating promises ("guaranteed to make $X", "100% success rate").
   - ZERO medical/financial claims without disclaimers.
3. Blacklisted Patterns:
   - Aggressive push ("BUY NOW", "CLICK HERE", "LIMITED TIME", "FREE MONEY").

SCORING RULES:
- Score is an integer from 0 to 100.
- 90-100: Flawless organic tone, 100% compliant, zero spam markers.
- 80-89: Safe, compliant, minor soft CTA.
- < 80: REJECTED (High risk, spam keywords, aggressive claims, or blatant pitch).

You must respond ONLY with a JSON object in this exact schema:
{
  "score": 88,
  "flaggedKeywords": ["word1", "word2"],
  "violationsDetected": ["reason1", "reason2"],
  "reasoning": "Clear explanation of the safety assessment and compliance evaluation."
}`;

    const userPrompt = `Target Platform: ${platform.toUpperCase()}
Pre-lander Slug: "${creative.prelanderSlug}"

POST HEADLINE:
"${creative.headline}"

POST BODY:
"${creative.body}"

CALL TO ACTION:
"${creative.callToAction}"

IMAGE PROMPT:
"${creative.generatedPrompt}"`;

    const result = await this.completeJson<RawCompliancePayload>(systemPrompt, userPrompt, {
      temperature: 0.1,
    });

    let normalizedScore = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    const allFlagged = Array.from(
      new Set([
        ...locallyFlagged,
        ...(Array.isArray(result.flaggedKeywords) ? result.flaggedKeywords : []),
      ])
    );

    // If blacklisted spam keywords detected locally, hard-clamp score below pass threshold
    if (locallyFlagged.length > 0) {
      normalizedScore = Math.min(normalizedScore, 45);
    }

    const passed = normalizedScore >= 80 && locallyFlagged.length === 0;

    let reasoning = result.reasoning || '';
    if (locallyFlagged.length > 0) {
      reasoning = `Rejected due to blacklisted spam triggers: [${locallyFlagged.join(', ')}]. ${reasoning}`.trim();
    } else if (!passed && !reasoning) {
      reasoning = `Failed compliance threshold (Score: ${normalizedScore}/100 < 80)`;
    } else if (passed && !reasoning) {
      reasoning = `Compliant with ${platform.toUpperCase()} organic community guidelines.`;
    }

    return {
      passed,
      score: normalizedScore,
      flaggedKeywords: allFlagged,
      reasoning,
    };
  }

  public async execute(creative: GeneratedCreative, platform: Platform): Promise<ComplianceReport> {
    return this.evaluate(creative, platform);
  }
}
