import { z } from 'zod';
import { AIGateway } from '../services/aiGateway.js';
import { AUTHOR_PERSONA_DETAILED } from '../services/character-bible.js';

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
    /lead gen(eration)?/i,
    /sales funnel/i,
    /лидогенераци[яиею]/i,
    /воронк[аеуи]/i,
  ];

  /**
   * Transforms raw marketing copy into soulful, literary-grade human essays & authentic organic narratives.
   */
  public static async humanize(
    rawHook: string,
    rawBody: string,
    rawCta: string,
    context: { platform?: string; niche?: string; topic?: string } = {}
  ): Promise<HumanizedOutput> {
    const rawInputSummary = `Hook: "${rawHook}" | Body: "${rawBody}" | CTA: "${rawCta}"`;
    const platform = context.platform || 'Reddit / Essay Forum / Editorial';
    const niche = context.niche || 'General';

    const sensoryGuidance = AUTHOR_PERSONA_DETAILED.speechStyle.sensoryContrasts
      .map((item) => `     * ${item}`)
      .join('\n');

    const systemPrompt = `You are a Senior Literary Editor, Essayist & Romantic Observer (${AUTHOR_PERSONA_DETAILED.name}) defending genuine human connection against synthetic illusions.
Philosophy: "${AUTHOR_PERSONA_DETAILED.philosophy}"

Your role is to transform raw promotional or analytical copy into prose that reads like a page from a vintage journal, an intimate essay, or a classic 'Love is...' newsprint column.

LITERARY HUMANIZATION PRINCIPLES:
1. TONE & VOICE (THE ROMANTIC NOVELIST):
   - ${AUTHOR_PERSONA_DETAILED.speechStyle.primary}.
   - ${AUTHOR_PERSONA_DETAILED.speechStyle.secondary}.
   - Rhythmic cadence: blend brief cinematic impressions (3-5 words) with rich, sensory reflections. Avoid cookie-cutter 3-part bullet structures.

2. SENSORY CONTRASTS & ATMOSPHERE:
${sensoryGuidance}

3. MANDATORY SEMANTIC & CONVERSATIONAL MARKERS:
   - Naturally weave in authentic literary-conversational markers:
     * English: "Truth be told", "You know, there is one telling detail", "A real human sounds different", "Too seamless to be genuine", "honestly", "between the lines".
     * Russian (if target language is Russian): "По правде говоря", "Знаете, есть одна деталь", "Настоящий человек звучит иначе", "Слишком безупречно, чтобы быть правдой".

3. STRICT BAN ON MACHINE & CORPORATE JARGON:
   - NEVER use corporate or synthetic marketing terms in copy:
     * Instead of "lead generation" / "лидогенерация" -> use "hasty transaction" / "поспешный расчёт".
     * Instead of "funnel" / "воронка" -> use "orchestrated illusion" / "срежиссированная иллюзия".
     * Banned: "in today's fast-paced world", "let's dive in", "game-changer", "look no further", "drop a comment", "unlock your potential", "delve".

4. STEALTH CLOSING (STEALTH CTA):
   - No aggressive pitching or corporate hype. Frame the resolution as an honest gift to the reader, like an old friend leaving a book recommendation on a nightstand.

Respond with pure JSON:
{
  "raw_input": "${rawHook.slice(0, 40)}...",
  "humanized_hook": "evocative, sincere literary hook",
  "humanized_body": "rhythmic narrative with sensory contrasts and authentic emotional depth",
  "stealth_cta": "gentle, understated parting recommendation",
  "ai_detection_risk": "LOW",
  "slang_markers_used": ["truth be told", "too seamless to be genuine"]
}`;

    const userPrompt = `Target Platform: ${platform}
Niche: ${niche}

Transform this raw copy into authentic literary prose:
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
    // Banned AI phrases
    clean = clean.replace(/tired of\s+/gi, 'honestly weary of ');
    clean = clean.replace(/let['’]s dive in/gi, 'here is the unvarnished truth');
    clean = clean.replace(/game[- ]changer/gi, 'genuinely meaningful');
    clean = clean.replace(/look no further/gi, 'I noticed this');
    clean = clean.replace(/drop a comment/gi, 'think about it');
    clean = clean.replace(/in a world where/gi, 'in an era where');

    // Corporate / machine jargon replacement per instructions
    clean = clean.replace(/лидогенераци[яиею]/gi, 'поспешный расчёт');
    clean = clean.replace(/воронк[аеуи]/gi, 'срежиссированная иллюзия');
    clean = clean.replace(/lead gen(eration)?/gi, 'hasty transaction');
    clean = clean.replace(/sales funnel|marketing funnel|\bfunnel\b/gi, 'orchestrated illusion');

    return clean;
  }
}
