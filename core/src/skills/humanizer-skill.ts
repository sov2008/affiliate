import { z } from 'zod';
import { AIGateway } from '../services/aiGateway.js';

export interface HumanizedOutput {
  raw_input: string;
  humanized_hook: string;
  humanized_body: string;
  stealth_cta: string;
  ai_detection_risk: 'LOW' | 'MEDIUM' | 'HIGH';
  slang_markers_used: string[];
}

export const HumanizedSchema = z.preprocess((raw: any) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  return {
    raw_input: raw.raw_input ?? raw.rawInput ?? '',
    humanized_hook: raw.humanized_hook ?? raw.humanizedHook ?? raw.hook ?? '',
    humanized_body: raw.humanized_body ?? raw.humanizedBody ?? raw.body ?? '',
    stealth_cta: raw.stealth_cta ?? raw.stealthCta ?? raw.cta ?? '',
    ai_detection_risk: (['LOW', 'MEDIUM', 'HIGH'].includes(raw.ai_detection_risk ?? raw.aiDetectionRisk)
      ? (raw.ai_detection_risk ?? raw.aiDetectionRisk)
      : 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
    slang_markers_used: Array.isArray(raw.slang_markers_used ?? raw.slangMarkersUsed)
      ? (raw.slang_markers_used ?? raw.slangMarkersUsed)
      : ['tbh', 'lowkey'],
  };
}, z.object({
  raw_input: z.string(),
  humanized_hook: z.string(),
  humanized_body: z.string(),
  stealth_cta: z.string(),
  ai_detection_risk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  slang_markers_used: z.array(z.string()),
}));

export class HumanizerSkill {
  private static readonly BANNED_LLM_CLICHES = [
    /tired of/i,
    /let['’]s dive in/i,
    /in a world where/i,
    /\bhustle\b/i,
    /game[- ]changer/i,
    /look no further/i,
    /drop a comment/i,
    /in today['’]s fast[- ]paced/i,
    /unlock your/i,
    /here['’]s the secret/i,
    /testament to/i,
    /embark on/i,
    /delve into/i,
  ];

  /**
   * Transforms raw marketing copy into 100% human-sounding organic social posts.
   */
  public static async humanize(
    rawHook: string,
    rawBody: string,
    rawCta: string,
    context: { platform?: string; niche?: string; topic?: string } = {}
  ): Promise<HumanizedOutput> {
    const rawInputSummary = `Hook: "${rawHook}" | Body: "${rawBody}" | CTA: "${rawCta}"`;
    const platform = context.platform || 'Reddit / Social Community';
    const niche = context.niche || 'General';

    const systemPrompt = `You are a Senior NLP Engineer & Social Chameleon specializing in bypassing AI content detectors (GPTZero, Originality.ai, ZeroGPT).
Your job is to rewrite marketing copy so it sounds like a REAL human typed it casually on their phone at 11 PM.

CRITICAL HUMANIZATION RULES:
1. BANNED AI PHRASES (NEVER USE THESE):
   - "Tired of..."
   - "Let's dive in" / "Dive into"
   - "In a world where..."
   - "Hustle" / "Game-changer" / "Look no further"
   - "Drop a comment below" / "Leave your thoughts"
   - "In today's fast-paced world"
   - "Unlock your potential" / "Here's the secret"
   - "Delve", "Testament", "Beacon", "Embark"

2. AUTHENTIC USER BEHAVIOR TO INJECT:
   - Tone: Casual, slightly skeptical, anecdotal, informal, speaking from direct personal trial-and-error.
   - Slang & Fillers: Use authentic organic markers naturally ("tbh", "ngl", "idk", "honestly", "lowkey", "imo", "kinda", "wild", "fr", "basically").
   - Burstiness & Rhythm: Mix very short fragments (2-4 words) with natural conversational thoughts. Avoid cookie-cutter 3-part essay structures.
   - Stealth CTA: NO hard selling. Make the call-to-action look like an afterthought or a casual discovery (e.g., "idk worked for me, someone asked earlier so here's where I found it", "curious if anyone else noticed this?").

Respond with pure JSON:
{
  "raw_input": "${rawHook.slice(0, 40)}...",
  "humanized_hook": "casual organic first sentence",
  "humanized_body": "authentic story with bursty sentence lengths",
  "stealth_cta": "soft organic closing mention",
  "ai_detection_risk": "LOW",
  "slang_markers_used": ["tbh", "lowkey"]
}`;

    const userPrompt = `Target Platform: ${platform}
Niche: ${niche}

Transform this raw marketing copy into a human post:
Raw Hook: "${rawHook}"
Raw Body: "${rawBody}"
Raw CTA: "${rawCta}"`;

    const { data: output } = await AIGateway.generateJSON(systemPrompt, userPrompt, HumanizedSchema, {
      temperature: 0.8,
    });

    // Sanitize any remaining clichés via regex post-processing
    output.humanized_hook = this.scrubClichés(output.humanized_hook);
    output.humanized_body = this.scrubClichés(output.humanized_body);
    output.stealth_cta = this.scrubClichés(output.stealth_cta);
    output.raw_input = rawInputSummary;

    return output;
  }

  private static scrubClichés(text: string): string {
    let clean = text;
    clean = clean.replace(/tired of\s+/gi, 'honestly sick of ');
    clean = clean.replace(/let['’]s dive in/gi, 'here is what happened');
    clean = clean.replace(/game[- ]changer/gi, 'actually useful');
    clean = clean.replace(/look no further/gi, 'found this');
    clean = clean.replace(/drop a comment/gi, 'let me know');
    clean = clean.replace(/in a world where/gi, 'nowadays');
    return clean;
  }
}
