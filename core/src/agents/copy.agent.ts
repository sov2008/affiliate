import { BaseAgent } from './base.agent.js';
import { GeneratedCreative, RawContext } from '../types/pipeline.js';

export interface CopywriterPayload {
  headline: string;
  body: string;
  callToAction: string;
  prelanderSlug: string;
  generatedPrompt: string;
}

export class CopywriterAgent extends BaseAgent {
  constructor() {
    super('CopywriterAgent');
  }

  /**
   * Generates organic, high-converting, native ad copy and visual prompts
   * strictly tuned to target platform psychology and audience pain points.
   */
  public async execute(context: RawContext, prelanderSlug: string): Promise<GeneratedCreative> {
    this.checkEmergencyStop();

    const systemPrompt = `You are an elite Social Media Ghostwriter & Organic Copywriter specializing in ${context.platform.toUpperCase()}.
Your goal is to write a deeply relatable, conversational, authentic story/post that addresses the user's specific pain point.

CRITICAL TONE-OF-VOICE & ANTI-AI RULES:
1. NEVER use cliché marketing or AI words:
   - BANNED: "Tired of...", "Let's dive in", "In a world where...", "Hustle", "Game-changer", "Look no further", "Drop a comment below", "Unlock your potential", "Secret formula", "Discover the magic".
2. Tone:
   - Extremely natural, empathetic, slightly vulnerable, anecdotal.
   - Use natural sentence length variations (high burstiness) and conversational phrases ("tbh", "ngl", "idk", "honestly", "lowkey").
3. Bridge-Page / Pre-lander Framing:
   - Mention the solution naturally as a personal discovery, routine tool, or interactive breakdown (e.g. "I found this free 2-minute quiz/guide that filtered out the noise").
   - Do NOT sound like an affiliate pitch.

You must respond ONLY with a JSON object in this exact schema:
{
  "headline": "Casual, hooky title or opening line (no clickbait spam)",
  "body": "Relatable 2-3 paragraph story addressing the pain point and explaining the practical routine/approach",
  "callToAction": "Subtle, organic recommendation pointing to the resource",
  "prelanderSlug": "${prelanderSlug}",
  "generatedPrompt": "A photorealistic, highly cinematic prompt for FLUX/SDXL image generator depicting the mood, lifestyle, or practical setup of the post (NO text, NO UI overlays, 8k, photorealistic)"
}`;

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
