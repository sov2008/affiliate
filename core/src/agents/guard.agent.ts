import { BaseAgent } from './base.agent.js';
import { ComplianceReport, GeneratedCreative, Platform } from '../types/pipeline.js';

interface RawCompliancePayload {
  score: number;
  flaggedKeywords: string[];
  reasoning: string;
  violationsDetected: string[];
}

export class ComplianceGuardAgent extends BaseAgent {
  constructor() {
    super('ComplianceGuardAgent');
  }

  /**
   * Evaluates generated creative copy against platform terms of service,
   * anti-spam policies, false claim regulations, and community guidelines.
   */
  public async evaluate(creative: GeneratedCreative, platform: Platform): Promise<ComplianceReport> {
    this.checkEmergencyStop();

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

    const normalizedScore = Math.max(0, Math.min(100, Math.round(Number(result.score) || 0)));
    const passed = normalizedScore >= 80;

    return {
      passed,
      score: normalizedScore,
      flaggedKeywords: Array.isArray(result.flaggedKeywords) ? result.flaggedKeywords : [],
      reasoning: result.reasoning || (passed ? 'Compliant with platform rules' : 'Failed compliance threshold (< 80)'),
    };
  }

  public async execute(creative: GeneratedCreative, platform: Platform): Promise<ComplianceReport> {
    return this.evaluate(creative, platform);
  }
}
