import fs from 'fs';
import path from 'path';
import { BaseAgent } from './base.agent.js';
import { GeneratedCreative, RawContext, Platform } from '../types/pipeline.js';
import { GoldCatalogService } from '../services/gold-catalog.service.js';
import { NetworkMemoryService } from '../services/network-memory.service.js';
import { CpaKnowledgeService, CpaNetwork } from '../services/cpa-knowledge.service.js';
import { KnowledgeService } from '../services/knowledge.service.js';

interface OrganicTrafficPlaybook {
  strategies?: Record<string, any>;
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
    strategies: {},
    anti_detection_heuristics: {
      forbidden_openers: ['Check this out', 'Looking for the best', 'I found this amazing app'],
      mandatory_stealth_markers: ['first_person_past_tense', 'acknowledgment_of_flaws', 'no_hyperbolic_adjectives'],
    },
  };
}

export interface CopywriterPayload {
  headline: string;
  body: string;
  callToAction: string;
  prelanderSlug: string;
  generatedPrompt: string;
}

export class CopywriterAgent extends BaseAgent {
  private readonly goldCatalog: GoldCatalogService;
  private readonly networkMemory: NetworkMemoryService;
  private readonly knowledgeService: KnowledgeService;

  constructor() {
    super('CopywriterAgent');
    this.goldCatalog = GoldCatalogService.getInstance();
    this.networkMemory = NetworkMemoryService.getInstance();
    this.knowledgeService = KnowledgeService.getInstance();
  }

  /**
   * Generates organic, high-converting, native ad copy and visual prompts
   * strictly tuned to target platform psychology and audience pain points.
   */
  public async execute(context: RawContext, prelanderSlug: string): Promise<GeneratedCreative> {
    this.checkEmergencyStop();

    const platform = (context.platform || 'reddit').toLowerCase() as Platform;
    const niche = this.goldCatalog.extractNiche(context);
    const fewShotSection = this.goldCatalog.getFewShotExamples(platform, niche, 3);

    // Resolve network for network-specific memory injection
    const rawNetwork = ((context.metadata?.network as string) || (context.metadata?.campaign_id as string) || '').toLowerCase();
    const network = (rawNetwork.includes('mylead') || rawNetwork.includes('lead') ? 'mylead' : rawNetwork.includes('lospollos') || rawNetwork.includes('los') ? 'lospollos' : 'mylead') as CpaNetwork;
    const networkFewShots = this.goldCatalog.getNetworkFewShotExamples(network, platform, niche, 3);
    const negativeExamples = this.goldCatalog.getNegativeFeedbackExamples(network, platform, 2);
    const networkMemoryPrompt = this.networkMemory.getFewShotPrompt(network, 3);

    const cpaKnowledge = new CpaKnowledgeService();
    const networkRules = cpaKnowledge.getNetworkRules(network) as {
      funnel_blueprint?: { type?: string };
      macro_syntax?: Record<string, string>;
      traffic_rules?: { prohibited?: string[] };
      mandatory_disclaimers?: string[];
    };
    const complianceDirectives = cpaKnowledge.getComplianceDirectives(network);
    const funnelBlueprint = cpaKnowledge.getRecommendedFunnel(network);

    const playbook = readOrganicTrafficPlaybook();
    const trafficMode = ((context.metadata?.traffic_strategy as string) || (context.metadata?.strategy as string) || '').toLowerCase();
    const resolvedMode = trafficMode.includes('quora')
      ? 'QUORA_LONGFORM_ANALYSIS'
      : trafficMode.includes('shorts') || trafficMode.includes('ugc') || trafficMode.includes('video')
        ? 'SHORTS_UGC_SCRIPT'
        : 'REDDIT_THREAD_INFILTRATION';

    const forbiddenOpeners = playbook.anti_detection_heuristics?.forbidden_openers ?? [];
    const stealthMarkers = playbook.anti_detection_heuristics?.mandatory_stealth_markers ?? [];

    const networkDirective = [
      `### MANDATORY CPA NETWORK OPERATING DIRECTIVE (${network.toUpperCase()}):`,
      `- Funnel Type: ${networkRules.funnel_blueprint?.type ?? funnelBlueprint.name ?? 'standard'}`,
      `- Required SubID/Macro scheme: ${JSON.stringify(networkRules.macro_syntax ?? cpaKnowledge.getMacroTemplate(network))}`,
      `- Prohibited terms & tactics: ${((networkRules.traffic_rules?.prohibited ?? []) as string[]).join(', ') || 'none'}`,
      `- Mandatory disclosures: ${(networkRules.mandatory_disclaimers ?? cpaKnowledge.getMandatoryDisclaimers(network)).join(', ') || 'none'}`,
      `- Conversion psychology blueprint: ${funnelBlueprint.steps.join(' -> ')}. Objective: ${funnelBlueprint.objective}. Keep the tone authentic, transparent, and fitting to the network policy.`,
      `- Network compliance satellite checklist: ${complianceDirectives.join(' | ')}`,
      '',
      `### ORGANIC TRAFFIC DIRECTIVE (${resolvedMode}):`,
      `- Required generation mode: ${resolvedMode}`,
      `- Forbidden openers: ${forbiddenOpeners.join(', ') || 'none'}`,
      `- Mandatory stealth markers: ${stealthMarkers.join(', ') || 'none'}`,
      `- CTA policy: Use profile-bridge or comment-thread context, never direct affiliate spam or 'click here' style copy.`,
      `- Output format rules: ${
        resolvedMode === 'QUORA_LONGFORM_ANALYSIS'
          ? 'Markdown with TL;DR, comparison table, risk note, and educational conclusion.'
          : resolvedMode === 'SHORTS_UGC_SCRIPT'
            ? 'Two-column script table: Visual Prompt / Voiceover Audio.'
            : 'Thread-native first-person response that reads like a comment in an active discussion, not a sales pitch.'
      }`,
      '',
    ].join('\n');

    const systemPrompt = `${networkDirective}
You are an elite Social Media Ghostwriter & Organic Copywriter specializing in ${platform.toUpperCase()}.
Your goal is to write a deeply relatable, conversational, authentic story/post that addresses the user's specific pain point.

CRITICAL TONE-OF-VOICE & ANTI-AI RULES:
1. NEVER use cliché marketing or AI words:
   - BANNED: "Tired of...", "Let's dive in", "In a world where...", "Hustle", "Game-changer", "Look no further", "Drop a comment below", "Unlock your potential", "Secret formula", "Discover the magic".
2. Tone:
   - Extremely natural, empathetic, slightly vulnerable, anecdotal.
   - Use natural sentence length variations (high burstiness) and conversational phrases ("tbh", "ngl", "idk", "honestly", "lowkey").
3. Bridge-Page / Pre-lander Framing & CTA:
   - Must read 100% like genuine, peer-to-peer advice from an experienced community member sharing personal workflows.
   - NEVER use 'link in bio', 'check my profile', 'click the link', or funnel pitches.
   - For Reddit/Quora, end the post with an organic conversation starter or offer to share notes/breakdown in the comments if anyone asks.
   - The post must deliver solid, standalone value to the community on its own.
   - Tone must be fully aligned with platform rules (e.g. Reddit Rule 9 - helpful, respectful, non-promotional).
4. Generated mode must match the traffic strategy.
   - REDDIT_THREAD_INFILTRATION: context-rich comment-like response, blended into active discussion, no overt sales language, no direct offer CTA.
   - QUORA_LONGFORM_ANALYSIS: markdown structure with TL;DR, comparison table, risk disclaimer, and educational conclusion.
   - SHORTS_UGC_SCRIPT: two-column format with 'Visual Prompt' and 'Voiceover Audio' labels.
5. Anti-detection constraints:
   - Avoid all forbidden openers: ${forbiddenOpeners.join(', ') || 'none'}
   - Retain stealth markers: ${stealthMarkers.join(', ') || 'none'}

You must respond ONLY with a JSON object in this exact schema:
{
  "headline": "Casual, organic title or discussion starter (no clickbait)",
  "body": "Relatable 2-3 paragraph post sharing authentic experience, practical nuances, and actionable advice OR a mode-specific markdown/script block",
  "callToAction": "Natural conversation closing that blends into the thread or profile-bridge, never a direct spam CTA",
  "prelanderSlug": "${prelanderSlug}",
  "generatedPrompt": "A photorealistic, highly cinematic prompt for FLUX/SDXL image generator depicting the practical lifestyle setup (NO text, NO UI overlays, 8k)"
}${fewShotSection}${networkFewShots}${negativeExamples}${networkMemoryPrompt}`;

    const userPrompt = `Target Platform: ${platform.toUpperCase()}
Source Context / Topic: "${context.topicTitle || 'Automated Systems 2026'}"
Source Reference Text: "${(context.sourceText || '').slice(0, 500)}"
Target Audience Pain: "${context.targetAudiencePain || 'Operational efficiency'}"
Pre-lander Slug: "${prelanderSlug}"
Metadata: ${JSON.stringify(context.metadata || {})}`;

    const result = await this.completeJson<CopywriterPayload>(systemPrompt, userPrompt, {
      temperature: 0.3,
    });

    const headline = result?.headline || 'Quantitative Arbitrage Strategy 2026';
    const generatedBody = result?.body || 'Verified institutional execution algorithms for low slippage.';
    const generatedCta = result?.callToAction || 'Curious how other devs handle this, happy to share notes in the comments';

    const normalizedMode = trafficMode.includes('quora')
      ? 'QUORA_LONGFORM_ANALYSIS'
      : trafficMode.includes('shorts') || trafficMode.includes('ugc') || trafficMode.includes('video')
        ? 'SHORTS_UGC_SCRIPT'
        : 'REDDIT_THREAD_INFILTRATION';

    const shortsScriptBody = `| Visual Prompt | Voiceover Audio |
| --- | --- |
| 0-3s: Close-up of a stressed user checking a crypto fee screen while the numbers jump unexpectedly. | "I kept thinking the chart looked fine until the fee surprise hit." |
| 3-15s: Split-screen showing hidden fee receipts and a wallet balance drop. | "The real cost wasn't the price move; it was the spread, network fee, and withdrawal charge stacked together." |
| 15-35s: Calm overhead shot of a compare table with risk and fee markers. | "Once I started tracking the actual costs, the difference between 'cheap' and 'worth it' was obvious." |
| 35-45s: End frame with a simple checklist and a soft CTA. | "If you’ve been burned by hidden fees, happy to share the rough breakdown in the comments if it helps. This is not financial advice, and capital at risk; do your own research and treat this as educational context." |`;

    const finalBody = normalizedMode === 'SHORTS_UGC_SCRIPT'
      ? shortsScriptBody
      : network === 'mylead'
        ? ((/risk|disclaimer|not financial advice|capital at risk|educational|research/i.test(generatedBody) || /risk|disclaimer|not financial advice|capital at risk|educational|research/i.test(generatedCta))
          ? generatedBody
          : `${generatedBody} This is an independent review and not financial advice. Capital at risk; fees and conditions vary. Do your own research and treat this as educational context.`)
        : generatedBody;

    const finalCta = normalizedMode === 'SHORTS_UGC_SCRIPT'
      ? 'Happy to share the rough breakdown in the comments if it helps. This is not financial advice, and capital at risk; do your own research.'
      : network === 'mylead'
        ? ((/risk|disclaimer|not financial advice|capital at risk|educational|research/i.test(generatedCta))
          ? generatedCta
          : `${generatedCta} This is not financial advice, and any capital at risk should be assessed with independent research.`)
        : generatedCta;

    const verifiedBody = this.knowledgeService.validateCopyAgainstGuard(finalBody, platform);
    const resolvedBody = verifiedBody.isValid ? finalBody : (verifiedBody.sanitizedCopy || finalBody);

    return {
      headline,
      body: resolvedBody,
      callToAction: finalCta,
      prelanderSlug: result?.prelanderSlug || prelanderSlug,
      generatedPrompt: result?.generatedPrompt || 'A photorealistic lifestyle workspace setup with dual monitors',
    };
  }

  /**
   * Generates a 100-word peer-to-peer Reddit reply with zero URLs and profile bio bridge
   * strictly enriched with Behavior Matrix & Lexicon Guard
   */
  public async generateRedditHitlComment(topicTitle: string, selftext: string, subreddit: string = 'dating'): Promise<string> {
    const lexicon = this.knowledgeService.getLexiconRules('reddit');
    const hook = this.knowledgeService.getBehaviorHook('dating', 'elo_trap') || {
      hook: 'Why mainstream apps deliberately throttle your visibility once you hit the free engagement ceiling.',
      barnum_effect_formula: 'Matches drop off sharply after the first week of creating an account due to algorithmic ELO decay.',
    };

    const systemPrompt = `You are an authentic, empathetic Reddit user who experienced dating app burnout and found a much better direct local matching method.
CRITICAL CONSTRAINTS:
1. WORD COUNT: Approximately 85-110 words total.
2. STRICT ZERO URLS: Absolutely NO links, http, https, or domain names.
3. BANNED COMMERCIAL TRIGGERS: Never use words like: ${lexicon.banned_commercial_triggers.join(', ')}.
4. PSYCHOLOGICAL HOOK: Address the core issue: "${hook.hook}". Mention: "${hook.barnum_effect_formula}".
5. NATIVE SLANG: Use natural conversational slang (e.g. ${lexicon.native_slang.slice(0, 5).join(', ')}).
6. MANDATORY PROFILE BRIDGE: End with an authentic, non-pushy closing: "Documented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check."
7. You must return a JSON object with a single string field: { "comment": "the exact reply text" }`;

    const userPrompt = `Subreddit: r/${subreddit}
Post Title: "${topicTitle}"
Post Content: "${selftext.slice(0, 300)}"`;

    try {
      const result = await this.completeJson<{ comment: string }>(systemPrompt, userPrompt, { temperature: 0.4 });
      let text = (result?.comment || '').trim();
      if (!text) {
        throw new Error('Empty comment returned from LLM');
      }
      const check = this.knowledgeService.validateCopyAgainstGuard(text, 'reddit');
      return check.sanitizedCopy || text;
    } catch {
      const fallback = `Honestly, the biggest scam isn’t even the $30/month subscriptions—it’s how their algorithm deliberately throttles active profiles once you hit the free engagement ceiling. When an app treats dating like an infinite slot machine, ghosting is inevitable because nobody values a single conversation. Once I stopped feeding their paywalls and switched to direct activity-based local matching, the response rate jumped immediately.\n\nDocumented the full breakdown and the filtering bot I use in my profile bio if anyone needs a sanity check. Save your energy.`;
      const check = this.knowledgeService.validateCopyAgainstGuard(fallback, 'reddit');
      return check.sanitizedCopy || fallback;
    }
  }

  /**
   * Generates a warm, authentic, highly empathetic and expert peer-to-peer Reddit reply
   * strictly for Organic Karma Warmup (Cold Seed phase).
   * ZERO URLs, ZERO promotion, ZERO bio mentions, ZERO AI artifacts.
   */
  public async generateKarmaWarmupComment(
    topicTitle: string,
    selftext: string,
    subreddit: string
  ): Promise<string> {
    const systemPrompt = `You are a genuine, helpful, thoughtful, and articulate Reddit user participating in r/${subreddit}.
CRITICAL CONSTRAINTS:
1. TONE: Warm, conversational, relatable, and authentic peer-to-peer personal perspective.
2. LENGTH: 1 to 3 short paragraphs (between 60 and 120 words total).
3. STRICT ZERO URLS: Absolutely NO links, http, https, markdown [text](url), or domain names.
4. STRICT ZERO PROMOTION: Absolutely NO mentions of products, services, bots, links, "bio", "profile", "check out", "my page", or self-promotion.
5. NO AI ARTIFACTS: Do NOT start with "As an AI...", "Great question!", "Ah,", "Hello fellow Redditors", or cliché chatbot phrases. Start naturally straight into the thought, personal reflection or practical tip.
6. RELEVANCE: Directly answer the question or react to the story with genuine insight, empathy, or a practical tip.
7. Return a JSON object with a single string field: { "comment": "the exact reply text" }`;

    const userPrompt = `Subreddit: r/${subreddit}
Post Title: "${topicTitle}"
Post Body: "${(selftext || '').slice(0, 500) || 'None provided'}"`;

    try {
      const result = await this.completeJson<{ comment: string }>(systemPrompt, userPrompt, { temperature: 0.65 });
      let text = (result?.comment || '').trim();
      if (!text) {
        throw new Error('Empty comment returned from LLM');
      }
      // Sanitize any accidental links or bio hooks
      text = text.replace(/https?:\/\/[^\s]+/gi, '').trim();
      text = text
        .split('\n')
        .filter((l) => !l.toLowerCase().includes('bio') && !l.toLowerCase().includes('profile'))
        .join('\n')
        .trim();
      return text;
    } catch {
      return `That’s a really solid point. In my experience, the biggest shift came from focusing on small, consistent habits instead of waiting for a huge breakthrough. Once you remove the pressure of having everything figured out immediately, momentum naturally starts building up.`;
    }
  }
}
