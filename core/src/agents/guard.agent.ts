import fs from 'fs';
import path from 'path';
import { BaseAgent } from './base.agent.js';
import { ComplianceReport, GeneratedCreative, Platform } from '../types/pipeline.js';
import { LinkIntegrityService } from '../services/link-integrity.service.js';
import { CpaKnowledgeService, CpaNetwork } from '../services/cpa-knowledge.service.js';

interface OrganicTrafficPlaybook {
  anti_detection_heuristics?: {
    forbidden_openers?: string[];
    mandatory_stealth_markers?: string[];
  };
}

function readOrganicTrafficPlaybook(): OrganicTrafficPlaybook {
  const candidates = [
    path.resolve(process.cwd(), 'core/data/knowledge/organic_traffic_playbook.json'),
    path.resolve(process.cwd(), 'data/knowledge/organic_traffic_playbook.json'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8')) as OrganicTrafficPlaybook;
      } catch {
        break;
      }
    }
  }

  return {
    anti_detection_heuristics: {
      forbidden_openers: ['Check this out', 'Looking for the best', 'I found this amazing app'],
      mandatory_stealth_markers: ['first_person_past_tense', 'acknowledgment_of_flaws', 'no_hyperbolic_adjectives'],
    },
  };
}

export interface GuardEvaluationOptions {
  trackingUrl?: string;
  campaignId?: string;
  variant?: string;
  network?: CpaNetwork;
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

  private detectNetworkRuleViolation(combinedText: string, network: CpaNetwork): string | null {
    const lowerText = combinedText.toLowerCase();
    const knowledge = new CpaKnowledgeService();
    const directives = knowledge.getComplianceDirectives(network);
    const directiveSentence = directives.join(' ').toLowerCase();

    if (network === 'mylead') {
      const financeKeywords = /(finance|crypto|trading|forex|investment|yield|risk|bitcoin|wallet)/i;
      const reviewKeywords = /(review|comparison|best|ranked|recommendation)/i;

      if (financeKeywords.test(lowerText) && !/(risk warning|risk disclosure|risk notice|not financial advice|disclaimer|educational|research)/i.test(lowerText)) {
        return 'MYLEAD_FINANCE_RISK_DISCLOSURE_MISSING';
      }

      if (reviewKeywords.test(lowerText) && !/(ftc|disclosure|not sponsored|independent review|affiliate disclosure)/i.test(lowerText)) {
        return 'MYLEAD_REVIEW_DISCLOSURE_MISSING';
      }

      if (financeKeywords.test(lowerText) && !/(capital at risk|not financial advice|risk disclosure|risk warning|disclaimer)/i.test(lowerText)) {
        return 'MYLEAD_FINANCE_POST_REJECTED_NO_RISK_DISCLOSURE';
      }
    }

    if (network === 'lospollos') {
      if (/(guaranteed|free money|secret formula|click here|download immediately|limited time)/i.test(lowerText)) {
        return 'LOSPOLLOS_AFFILIATE_POLICY_VIOLATION';
      }
    }

    if (directiveSentence.includes('risk warning') && !/(risk warning|risk disclosure|risk notice|not financial advice|disclaimer)/i.test(lowerText)) {
      return `${network.toUpperCase()}_MANDATORY_RISK_NOTICE_MISSING`;
    }

    return null;
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

    const network = options.network ?? 'mylead';

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
    const organicPlaybook = readOrganicTrafficPlaybook();
    const forbiddenOpeners = organicPlaybook.anti_detection_heuristics?.forbidden_openers ?? [];
    const normalizedCta = creative.callToAction.toLowerCase();

    for (const pattern of BLACKLISTED_SPAM_PATTERNS) {
      if (combinedText.includes(pattern)) {
        locallyFlagged.push(pattern);
      }
    }

    for (const opener of forbiddenOpeners) {
      const needle = opener.toLowerCase();
      if (needle && (combinedText.includes(needle) || creative.headline.toLowerCase().includes(needle))) {
        locallyFlagged.push(opener);
      }
    }

    const directSpamCta = /(click here|buy now|link in bio|check my profile|visit now|use code|dm me now|message me now|instant access|guaranteed)/i.test(normalizedCta);
    const profileBridgeCTA = /(profile|bio|comments|happy to share|if helpful|if anyone|send a note|dm if|message me if|drop a note|curious|would love to|happy to break down|happy to share notes)/i.test(normalizedCta);
    if (directSpamCta) {
      locallyFlagged.push('DIRECT_SPAM_CTA');
    }
    if (creative.callToAction.trim().length > 0 && !profileBridgeCTA && !/^(curious|happy to|if helpful|if anyone|would love to)/i.test(creative.callToAction)) {
      // Allow thread-native, conversational CTAs even when they don't explicitly mention profile bridge.
      // Only reject direct spam patterns and overtly aggressive commercial phrasing.
      const commercialPhrase = /(best option|top choice|limited offer|exclusive deal|instant results|start now|must try|make money|save money)/i.test(normalizedCta);
      if (commercialPhrase) {
        locallyFlagged.push('CTA_STEALTH_POLICY_VIOLATION');
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

    const knowledge = new CpaKnowledgeService();
    const rules = knowledge.getNetworkRules(network) as {
      traffic_rules?: { prohibited?: string[] };
      mandatory_disclaimers?: string[];
      verticals?: string[];
    };
    const prohibitedTerms = (rules.traffic_rules?.prohibited ?? []) as string[];
    const mandatoryDisclosures = rules.mandatory_disclaimers ?? [];
    const violationReasons: string[] = [];

    for (const prohibitedTerm of prohibitedTerms) {
      const normalized = prohibitedTerm.toLowerCase().replace(/_/g, ' ');
      if (normalized && combinedText.includes(normalized)) {
        violationReasons.push(`Network prohibited tactic matched: ${prohibitedTerm}`);
      }
    }

    const myleadFinanceSignals = /(finance|crypto|trading|forex|investment|yield|wallet|vpn)/i;
    const verticals = (rules.verticals ?? []).map((value) => value.toLowerCase());
    const isFinanceNetwork = network === 'mylead' && (verticals.includes('finance') || verticals.includes('crypto') || myleadFinanceSignals.test(combinedText));
    if (isFinanceNetwork) {
      const hasRiskNotice = /(capital at risk|risk warning|risk disclosure|not financial advice|disclaimer|educational only)/i.test(combinedText);
      if (!hasRiskNotice) {
        violationReasons.push('MyLead finance/crypto post missing required risk disclaimer.');
      }
    }

    const scorePenalty = violationReasons.length > 0 ? 35 * violationReasons.length : 0;
    if (violationReasons.length > 0) {
      const networkViolation = this.detectNetworkRuleViolation(combinedText, network);
      if (networkViolation) {
        return {
          passed: false,
          score: 0,
          flaggedKeywords: [networkViolation],
          reasoning: `Affiliate network compliance reject triggered: ${networkViolation}. This content violates the required CPA network terms and must be rejected automatically.`,
          violationsDetected: ['AFFILIATE_NETWORK_POLICY_VIOLATION', networkViolation],
        };
      }
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

    if (violationReasons.length > 0) {
      normalizedScore = Math.max(0, normalizedScore - scorePenalty);
      allFlagged.push(...violationReasons);
    }

    const passed = normalizedScore >= 80 && locallyFlagged.length === 0 && violationReasons.length === 0;

    if (directSpamCta || (creative.callToAction.trim().length > 0 && !profileBridgeCTA && /(best option|top choice|limited offer|exclusive deal|instant results|start now|must try|make money|save money)/i.test(normalizedCta))) {
      return {
        passed: false,
        score: 0,
        flaggedKeywords: Array.from(new Set([...locallyFlagged, 'CTA_STEALTH_POLICY_VIOLATION'])),
        reasoning: 'CTA violates the stealth policy: direct spam or overtly commercial CTA is not allowed for organic traffic placement.',
        violationsDetected: ['CTA_STEALTH_POLICY_VIOLATION', 'DIRECT_SPAM_CTA'],
      };
    }

    let reasoning = result.reasoning || '';
    if (locallyFlagged.length > 0) {
      reasoning = `Rejected due to blacklisted spam triggers: [${locallyFlagged.join(', ')}]. ${reasoning}`.trim();
    } else if (violationReasons.length > 0) {
      reasoning = `CPA compliance penalty applied: ${violationReasons.join(' ; ')}. Score deducted by ${scorePenalty} points.`;
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
