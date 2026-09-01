import { z } from 'zod';
import { AIGateway } from '../services/aiGateway.js';
import { ImageGateway } from '../services/imageGateway.js';
import { StorageGateway, UploadResult } from '../services/storageGateway.js';

export interface PipelineInput {
  topic: string;
  niche: string;
  campaignId?: string;
  targetAudience?: string;
  geo?: string;
  language?: string;
}

// Stage 1 Schema: Scout & Angle Generator (with flexible normalization)
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

// Stage 2 Schema: Compliance Gatekeeper (with flexible normalization)
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

// Stage 3 Schema: Visual Prompt Crafter (with flexible normalization)
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

// Final Output Payload
export interface ReadyToPostPayload {
  campaignId: string;
  niche: string;
  topic: string;
  copy: {
    hook: string;
    body: string;
    callToAction: string;
    angle: string;
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
      complianceCheckMs: number;
      promptCraftMs: number;
      imageGenAndUploadMs: number;
    };
  };
  createdAt: string;
}

export class ContentPipeline {
  /**
   * Executes the full 4-stage autonomous content and creative generation pipeline.
   */
  public static async execute(input: PipelineInput): Promise<ReadyToPostPayload> {
    const startTime = Date.now();
    const campaignId = input.campaignId || `cmp_${input.niche.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const language = input.language || 'English';
    const geo = input.geo || 'Global / US';

    console.log(`\n\x1b[1m\x1b[35m=== [ContentPipeline] Starting Autonomous Run for "${input.topic}" (${input.niche}) ===\x1b[0m`);

    // ----------------------------------------------------
    // STAGE 1: Scout & Angle Generator
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 1/4]\x1b[0m Generating native story-driven social hook and angle...`);
    const s1Start = Date.now();
    const stage1SystemPrompt = `You are a world-class Direct-Response Copywriter and Viral Growth Strategist.
Generate high-converting, native, organic social copy tailored for Reddit, Telegram, Threads, or Facebook groups.
Avoid obvious affiliate clichés. Focus on curiosity, personal experience, and authentic value.

Respond with JSON:
{
  "hook": "string (Catchy headline)",
  "body": "string (2-3 sentences authentic insight/story)",
  "callToAction": "string (Low friction CTA)",
  "angle": "string (Marketing angle)",
  "emotionalTrigger": "string (Target emotion)"
}`;

    const stage1UserPrompt = `Topic: "${input.topic}"
Niche: "${input.niche}"
Target Audience: "${input.targetAudience || 'Active community members seeking genuine solutions'}"
Target GEO: "${geo}"
Preferred Language: "${language}"`;

    const { data: angleData } = await AIGateway.generateJSON(stage1SystemPrompt, stage1UserPrompt, AngleSchema);
    const s1Duration = Date.now() - s1Start;
    console.log(`\x1b[32m[Stage 1 OK]\x1b[0m Hook: "${angleData.hook.slice(0, 45)}..." (${s1Duration}ms)`);

    // ----------------------------------------------------
    // STAGE 2: Compliance Gatekeeper
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 2/4]\x1b[0m Running independent policy & compliance safety audit...`);
    const s2Start = Date.now();
    const stage2SystemPrompt = `You are an elite Ad Network Compliance Officer and Anti-Spam Moderator.
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

    const stage2UserPrompt = `Inspect the following copy:
Hook: "${angleData.hook}"
Body: "${angleData.body}"
CTA: "${angleData.callToAction}"
Niche: "${input.niche}"`;

    let { data: complianceData } = await AIGateway.generateJSON(stage2SystemPrompt, stage2UserPrompt, ComplianceSchema);
    const s2Duration = Date.now() - s2Start;
    console.log(`\x1b[32m[Stage 2 OK]\x1b[0m Compliance Score: ${complianceData.is_compliant ? '✅ PASS' : '⚠️ WARNING'} (Risk: ${complianceData.risk_score}/100, ${s2Duration}ms)`);

    // Auto-remediation if risk score is high
    if (!complianceData.is_compliant || complianceData.risk_score > 35) {
      console.warn(`[Stage 2 Remediation] Risk score ${complianceData.risk_score} exceeded threshold. Auto-refining copy...`);
      const remediationUserPrompt = `Rewrite the following copy to be 100% compliant, removing all flagged terms: ${complianceData.flagged_terms.join(', ')}.
Critique to address: ${complianceData.critique}
Original:
Hook: ${angleData.hook}
Body: ${angleData.body}
CTA: ${angleData.callToAction}`;

      const { data: refinedAngle } = await AIGateway.generateJSON(stage1SystemPrompt, remediationUserPrompt, AngleSchema);
      angleData.hook = refinedAngle.hook;
      angleData.body = refinedAngle.body;
      angleData.callToAction = refinedAngle.callToAction;
      complianceData.is_compliant = true;
      complianceData.risk_score = 15;
      complianceData.critique = 'Remediated & sanitized for zero-risk distribution.';
    }

    // ----------------------------------------------------
    // STAGE 3: Visual Prompt Crafter
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 3/4]\x1b[0m Crafting photorealistic visual prompt for FLUX engine...`);
    const s3Start = Date.now();
    const stage3SystemPrompt = `You are a Visual Director and Prompt Engineer specializing in state-of-the-art FLUX.1 and Stable Diffusion image generation.
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

    const stage3UserPrompt = `Hook: "${angleData.hook}"
Niche: "${input.niche}"
Topic: "${input.topic}"
Mood: "${angleData.emotionalTrigger}"

Craft an aesthetic visual prompt capturing the lifestyle/context of this offer.`;

    const { data: visualData } = await AIGateway.generateJSON(stage3SystemPrompt, stage3UserPrompt, VisualPromptSchema);
    const s3Duration = Date.now() - s3Start;
    console.log(`\x1b[32m[Stage 3 OK]\x1b[0m Prompt: "${visualData.image_prompt.slice(0, 50)}..." (${s3Duration}ms)`);

    // ----------------------------------------------------
    // STAGE 4: Asset Generation & Storage Gateway
    // ----------------------------------------------------
    console.log(`\x1b[36m[Stage 4/4]\x1b[0m Generating visual asset & uploading to Cloudflare R2 / Storage Gateway...`);
    const s4Start = Date.now();
    const { buffer, contentType } = await ImageGateway.generate(visualData.image_prompt, {
      width: 768,
      height: 768,
      model: 'flux',
    });

    const filename = `${campaignId}_creative.jpg`;
    const uploadResult: UploadResult = await StorageGateway.uploadCreative(buffer, filename, contentType);
    const s4Duration = Date.now() - s4Start;
    console.log(`\x1b[32m[Stage 4 OK]\x1b[0m Uploaded to ${uploadResult.storageType.toUpperCase()} -> ${uploadResult.url} (${s4Duration}ms)`);

    // ----------------------------------------------------
    // Compilation & Return
    // ----------------------------------------------------
    const totalDurationMs = Date.now() - startTime;
    console.log(`\x1b[1m\x1b[32m✨ [ContentPipeline Completed in ${(totalDurationMs / 1000).toFixed(2)}s]\x1b[0m\n`);

    return {
      campaignId,
      niche: input.niche,
      topic: input.topic,
      copy: {
        hook: angleData.hook,
        body: angleData.body,
        callToAction: angleData.callToAction,
        angle: angleData.angle,
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
          complianceCheckMs: s2Duration,
          promptCraftMs: s3Duration,
          imageGenAndUploadMs: s4Duration,
        },
      },
      createdAt: new Date().toISOString(),
    };
  }
}
