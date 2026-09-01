import { BaseAgent } from './base.agent.js';
import { GeneratedCreative, RawContext } from '../types/pipeline.js';
import { GoldCatalogService } from '../services/gold-catalog.service.js';

export interface CopywriterPayload {
  headline: string;
  body: string;
  callToAction: string;
  prelanderSlug: string;
  generatedPrompt: string;
}

export class CopywriterAgent extends BaseAgent {
  private readonly goldCatalog: GoldCatalogService;

  constructor() {
    super('CopywriterAgent');
    this.goldCatalog = GoldCatalogService.getInstance();
  }

  /**
   * Generates organic, high-converting, native ad copy and visual prompts
   * strictly tuned to target platform psychology and audience pain points.
   */
  public async execute(context: RawContext, prelanderSlug: string): Promise<GeneratedCreative> {
    this.checkEmergencyStop();

    const niche = this.goldCatalog.extractNiche(context);
    const fewShotSection = this.goldCatalog.getFewShotExamples(context.platform, niche, 3);

    const systemPrompt = `You are an elite Social Media Ghostwriter & Organic Copywriter specializing in ${context.platform.toUpperCase()}.
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

You must respond ONLY with a JSON object in this exact schema:
{
  "headline": "Casual, organic title or discussion starter (no clickbait)",
  "body": "Relatable 2-3 paragraph post sharing authentic experience, practical nuances, and actionable advice",
  "callToAction": "Natural conversation closing (e.g. 'Curious how other nomads handle this, or happy to drop my checklist in the comments if helpful')",
  "prelanderSlug": "${prelanderSlug}",
  "generatedPrompt": "A photorealistic, highly cinematic prompt for FLUX/SDXL image generator depicting the practical lifestyle setup (NO text, NO UI overlays, 8k)"
}${fewShotSection}`;

    const userPrompt = `Target Platform: ${context.platform.toUpperCase()}
Source Context / Topic: "${context.topicTitle}"
Source Reference Text: "${context.sourceText.slice(0, 500)}"
Target Audience Pain: "${context.targetAudiencePain}"
Pre-lander Slug: "${prelanderSlug}"
Metadata: ${JSON.stringify(context.metadata)}`;

    const result = await this.completeJson<CopywriterPayload>(systemPrompt, userPrompt, {
      temperature: 0.3,
    });

    return {
      headline: result.headline,
      body: result.body,
      callToAction: result.callToAction,
      prelanderSlug: result.prelanderSlug || prelanderSlug,
      generatedPrompt: result.generatedPrompt,
    };
  }
}
