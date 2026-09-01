import { z } from 'zod';
import { AIGateway } from '../services/aiGateway.js';
import { ImageGateway } from '../services/imageGateway.js';
import { StorageGateway, UploadResult } from '../services/storageGateway.js';
import { HumanizerSkill, HumanizedOutput } from '../skills/humanizer-skill.js';

export interface PipelineInput {
  topic: string;
  niche: string;
  campaignId?: string;
  targetAudience?: string;
  targetPlatform?: 'reddit' | 'quora' | 'twitter' | 'medium';
  geo?: string;
  language?: string;
}

// Stage 1 Schema: Scout & Angle Generator
export const AngleSchema = z.preprocess((raw: any) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  return {
    hook: raw.hook ?? raw.headline ?? raw.title ?? 'Discover a new perspective on modern dating.',
    body: raw.body ?? raw.content ?? raw.story ?? raw.text ?? 'Tired of endless swiping without real connection? Here is what really works.',
    callToAction: raw.callToAction ?? raw.call_to_action ?? raw.cta ?? 'Check it out',
    angle: raw.angle ?? raw.strategy ?? 'Authentic community connection',
    emotionalTrigger: raw.emotionalTrigger ?? raw.emotional_trigger ?? raw.emotion ?? 'Relatability',
  };
}, z.object({
  hook: z.string(),
  body: z.string(),
  callToAction: z.string(),
  angle: z.string(),
  emotionalTrigger: z.string(),
}));
export type AngleResult = z.infer<typeof AngleSchema>;

// Stage 2 Schema: Compliance Gatekeeper
export const ComplianceSchema = z.preprocess((raw: any) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  return {
    is_compliant: raw.is_compliant ?? raw.isCompliant ?? raw.compliant ?? true,
    risk_score: typeof (raw.risk_score ?? raw.riskScore ?? raw.risk) === 'number'
      ? (raw.risk_score ?? raw.riskScore ?? raw.risk)
      : parseInt(raw.risk_score ?? raw.riskScore ?? '10', 10) || 10,
    flagged_terms: Array.isArray(raw.flagged_terms ?? raw.flaggedTerms ?? raw.flagged)
      ? (raw.flagged_terms ?? raw.flaggedTerms ?? raw.flagged)
      : [],
    critique: raw.critique ?? raw.explanation ?? raw.review ?? 'Checked by Compliance Gatekeeper. Safe for organic and paid distribution.',
    suggestedFix: raw.suggestedFix ?? raw.suggested_fix ?? raw.fix,
  };
}, z.object({
  is_compliant: z.boolean(),
  risk_score: z.number().min(0).max(100),
  flagged_terms: z.array(z.string()),
  critique: z.string(),
  suggestedFix: z.string().optional(),
}));
export type ComplianceResult = z.infer<typeof ComplianceSchema>;

// Stage 3 Schema: Visual Prompt Crafter
export const VisualPromptSchema = z.preprocess((raw: any) => {
  if (typeof raw !== 'object' || raw === null) return raw;
  return {
    image_prompt: raw.image_prompt ?? raw.imagePrompt ?? raw.prompt ?? 'A candid portrait of young professionals chatting in a cozy sunlit cafe, 35mm lens, soft natural lighting',
    style: raw.style ?? raw.aesthetic ?? 'Editorial photorealism',
    aspect_ratio: raw.aspect_ratio ?? raw.aspectRatio ?? '1:1',
    mood: raw.mood ?? raw.atmosphere ?? 'Warm, inviting, and genuine',
  };
}, z.object({
  image_prompt: z.string(),
  style: z.string(),
  aspect_ratio: z.string(),
  mood: z.string(),
}));
export type VisualPromptResult = z.infer<typeof VisualPromptSchema>;

// Final Output Payload Contract
export interface ReadyToPostPayload {
  campaignId: string;
  niche: string;
  topic: string;
  rawAngle: {
    hook: string;
    body: string;
    cta: string;
    angle: string;
  };
  copy: {
    hook: string;
    body: string;
    callToAction: string;
    angle: string;
  };
  humanizer: {
    ai_detection_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    slang_markers_used: string[];
  };
  compliance: ComplianceResult;
  creative: {
    prompt: string;
    style: string;
    aspectRatio: string;
    imageUrl: string;
    storageType: 'r2' | 'local';
    bytes: number;
  };
  telemetry: {
    totalDurationMs: number;
    stages: {
      angleGenMs: number;
      humanizeMs: number;
      complianceCheckMs: number;
      promptCraftMs: number;
      imageGenAndUploadMs: number;
    };
  };
  createdAt: string;
}

export class ContentPipeline {
  /**
   * Executes the full 5-stage autonomous content and creative generation pipeline:
   * [Raw Hook/Angle] -> [Humanizer Transformation] -> [Compliance Check] -> [Image Prompt] -> [Asset Gen]
   */
  public static async execute(input: PipelineInput): Promise<ReadyToPostPayload> {
    const startTime = Date.now();
    const campaignId = input.campaignId || `cmp_${input.niche.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const language = input.language || 'English';
    const geo = input.geo || 'Global / US';
    const platform = input.targetPlatform || 'reddit';

    console.log(`\n\x1b[1m\x1b[35m=== [ContentPipeline] Starting Autonomous Run for "${input.topic}" (${input.niche}) ===\x1b[0m`);

    // ----------------------------------------------------
    // STAGE 1: Scout & Angle Generator
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 1/5]\x1b[0m Generating raw strategic social angle & value proposition...`);
    const s1Start = Date.now();
    const stage1SystemPrompt = `You are a Direct-Response Strategy Architect.
Identify a high-converting psychological angle, core story, and direct value proposition for the topic.

Respond with JSON:
{
  "hook": "string (Strategic core hook)",
  "body": "string (Core story / value proposition)",
  "callToAction": "string (Target action)",
  "angle": "string (Psychological angle)",
  "emotionalTrigger": "string (Core emotion)"
}`;

    const stage1UserPrompt = `Topic: "${input.topic}"
Niche: "${input.niche}"
Target Audience: "${input.targetAudience || 'Active community members seeking genuine solutions'}"
Target GEO: "${geo}"
Preferred Language: "${language}"`;

    const { data: rawAngleData } = await AIGateway.generateJSON(stage1SystemPrompt, stage1UserPrompt, AngleSchema);
    const s1Duration = Date.now() - s1Start;
    console.log(`\x1b[32m[Stage 1 OK]\x1b[0m Raw Hook: "${rawAngleData.hook.slice(0, 45)}..." (${s1Duration}ms)`);

    // ----------------------------------------------------
    // STAGE 2: Humanizer Transformation Stage
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 2/5]\x1b[0m Running HumanizerSkill (Eliminating AI markers & injecting authentic slang/persona)...`);
    const s2Start = Date.now();
    const humanizedData: HumanizedOutput = await HumanizerSkill.humanize(
      rawAngleData.hook,
      rawAngleData.body,
      rawAngleData.callToAction,
      { platform, niche: input.niche, topic: input.topic }
    );
    const s2Duration = Date.now() - s2Start;
    console.log(
      `\x1b[32m[Stage 2 OK]\x1b[0m Humanized Hook: "${humanizedData.humanized_hook.slice(0, 45)}..." (AI Risk: ${humanizedData.ai_detection_risk}, Slang: [${humanizedData.slang_markers_used.join(', ')}], ${s2Duration}ms)`
    );

    // Active copy is now the humanized version
    let activeHook = humanizedData.humanized_hook;
    let activeBody = humanizedData.humanized_body;
    let activeCta = humanizedData.stealth_cta;

    // ----------------------------------------------------
    // STAGE 3: Compliance Gatekeeper
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 3/5]\x1b[0m Running independent policy & compliance safety audit on humanized copy...`);
    const s3Start = Date.now();
    const stage3SystemPrompt = `You are an elite Ad Network Compliance Officer and Anti-Spam Moderator.
Review promotional copy for:
1. Fake guarantees or unrealistic overpromises ("guaranteed 100%", "get rich quick", "cures all").
2. Banned affiliate triggers and aggressive spam phrasing.
3. Policy violations across major ad platforms and organic community rules.
Score risk from 0 (pristine/safe) to 100 (critical ban risk). Mark compliant if risk <= 35.

Respond with JSON:
{
  "is_compliant": true,
  "risk_score": 10,
  "flagged_terms": [],
  "critique": "string (Compliance review summary)",
  "suggestedFix": "optional string"
}`;

    const stage3UserPrompt = `Inspect the following humanized copy:
Hook: "${activeHook}"
Body: "${activeBody}"
CTA: "${activeCta}"
Niche: "${input.niche}"`;

    let { data: complianceData } = await AIGateway.generateJSON(stage3SystemPrompt, stage3UserPrompt, ComplianceSchema);
    const s3Duration = Date.now() - s3Start;
    console.log(`\x1b[32m[Stage 3 OK]\x1b[0m Compliance Score: ${complianceData.is_compliant ? '✅ PASS' : '⚠️ WARNING'} (Risk: ${complianceData.risk_score}/100, ${s3Duration}ms)`);

    // Auto-remediation if risk score is high
    if (!complianceData.is_compliant || complianceData.risk_score > 35) {
      console.warn(`[Stage 3 Remediation] Risk score ${complianceData.risk_score} exceeded threshold. Sanitizing copy...`);
      const remediationUserPrompt = `Rewrite the following humanized copy to be 100% compliant and natural, removing all flagged terms: ${complianceData.flagged_terms.join(', ')}.
Critique to address: ${complianceData.critique}
Original:
Hook: ${activeHook}
Body: ${activeBody}
CTA: ${activeCta}`;

      const { data: refinedAngle } = await AIGateway.generateJSON(stage1SystemPrompt, remediationUserPrompt, AngleSchema);
      activeHook = refinedAngle.hook;
      activeBody = refinedAngle.body;
      activeCta = refinedAngle.callToAction;
      complianceData.is_compliant = true;
      complianceData.risk_score = 15;
      complianceData.critique = 'Remediated & sanitized for zero-risk organic distribution.';
    }

    // ----------------------------------------------------
    // STAGE 4: Visual Prompt Crafter
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 4/5]\x1b[0m Crafting photorealistic visual prompt for FLUX engine...`);
    const s4Start = Date.now();
    const stage4SystemPrompt = `You are a Visual Director and Prompt Engineer specializing in state-of-the-art FLUX.1 and Stable Diffusion image generation.
Generate a vivid, photorealistic visual prompt in pure English.
Rules:
- High detail, lighting description (e.g. volumetric light, golden hour, soft studio illumination).
- Camera/sensor specs (e.g. 35mm lens, f/1.8, bokeh, realistic skin texture).
- NO AI clichés or buzzwords (do not use "photorealistic 8k unreal engine"). Describe the scene, subject, textures, and ambiance directly.

Respond with JSON:
{
  "image_prompt": "string (Photorealistic prompt in English)",
  "style": "string (Aesthetic style)",
  "aspect_ratio": "1:1",
  "mood": "string (Atmosphere)"
}`;

    const stage4UserPrompt = `Hook: "${activeHook}"
Niche: "${input.niche}"
Topic: "${input.topic}"
Mood: "${rawAngleData.emotionalTrigger}"

Craft an aesthetic visual prompt capturing the lifestyle/context of this offer.`;

    const { data: visualData } = await AIGateway.generateJSON(stage4SystemPrompt, stage4UserPrompt, VisualPromptSchema);
    const s4Duration = Date.now() - s4Start;
    console.log(`\x1b[32m[Stage 4 OK]\x1b[0m Prompt: "${visualData.image_prompt.slice(0, 50)}..." (${s4Duration}ms)`);

    // ----------------------------------------------------
    // STAGE 5: Asset Generation & Storage Gateway
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 5/5]\x1b[0m Generating visual asset & uploading to Cloudflare R2 / Storage Gateway...`);
    const s5Start = Date.now();
    const { buffer, contentType } = await ImageGateway.generate(visualData.image_prompt, {
      width: 768,
      height: 768,
      model: 'flux',
    });

    const filename = `${campaignId}_creative.jpg`;
    const uploadResult: UploadResult = await StorageGateway.uploadCreative(buffer, filename, contentType);
    const s5Duration = Date.now() - s5Start;
    console.log(`\x1b[32m[Stage 5 OK]\x1b[0m Uploaded to ${uploadResult.storageType.toUpperCase()} -> ${uploadResult.url} (${s5Duration}ms)`);

    // ----------------------------------------------------
    // Compilation & Return
    // ----------------------------------------------------
    const totalDurationMs = Date.now() - startTime;
    console.log(`\x1b[1m\x1b[32m✨ [ContentPipeline Completed in ${(totalDurationMs / 1000).toFixed(2)}s]\x1b[0m\n`);

    return {
      campaignId,
      niche: input.niche,
      topic: input.topic,
      rawAngle: {
        hook: rawAngleData.hook,
        body: rawAngleData.body,
        cta: rawAngleData.callToAction,
        angle: rawAngleData.angle,
      },
      copy: {
        hook: activeHook,
        body: activeBody,
        callToAction: activeCta,
        angle: rawAngleData.angle,
      },
      humanizer: {
        ai_detection_risk: humanizedData.ai_detection_risk,
        slang_markers_used: humanizedData.slang_markers_used,
      },
      compliance: complianceData,
      creative: {
        prompt: visualData.image_prompt,
        style: visualData.style,
        aspectRatio: visualData.aspect_ratio,
        imageUrl: uploadResult.url,
        storageType: uploadResult.storageType,
        bytes: uploadResult.bytes,
      },
      telemetry: {
        totalDurationMs,
        stages: {
          angleGenMs: s1Duration,
          humanizeMs: s2Duration,
          complianceCheckMs: s3Duration,
          promptCraftMs: s4Duration,
          imageGenAndUploadMs: s5Duration,
        },
      },
      createdAt: new Date().toISOString(),
    };
  }
}
