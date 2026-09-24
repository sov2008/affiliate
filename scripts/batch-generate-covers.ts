/**
 * Batch Generate Covers Pipeline (16:9 Documentary Forensic Evidence Photography)
 * Engine: NVIDIA NIM (FLUX.1-dev)
 * Aesthetic Core: British Technical Investigative Journalism (Wired / The Intercept / FT Weekend)
 * Desk Base: Cheltenham, UK
 * Usage:
 *   npx tsx scripts/batch-generate-covers.ts --slug <slug> [--force]
 *   npx tsx scripts/batch-generate-covers.ts [--all | --force] [--limit N] [--offset N]
 */

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const POSTS_DIR = path.resolve(process.cwd(), 'blog/src/content/posts');
const OUTPUT_DIR = path.resolve(process.cwd(), 'blog/public/images/posts');

// ---------------------------------------------------------------------------
// 1. Master Style Anchor & Negative Constraints
// ---------------------------------------------------------------------------

export const MASTER_STYLE_ANCHOR =
  'Editorial documentary photograph, 35mm film grain, analog surveillance aesthetic, forensic evidence shot, desk of a cyber intelligence investigator in Cheltenham UK, natural moody lighting, shallow depth of field, tactile paper and hardware textures, desaturated color grade with cold shadows, no anime, no cartoons, no CGI rendering, photorealistic 8k, aspect ratio 16:9';

export const NEGATIVE_CONSTRAINTS =
  'avoid: anime, manga, cartoon, illustration, drawing, painting, 3d render, cgi, smooth plastic skin, attractive smiling model, romantic couple, watermark, text typography overlay, neon glow cyberpunk, oversaturated colors, low quality';

// ---------------------------------------------------------------------------
// 2. Category Subject Matrix (5 Forensic Themes)
// ---------------------------------------------------------------------------

export const CATEGORY_SCENES: Record<string, string> = {
  'safety-dossier':
    'Printed blockchain ledger transactions on cluttered wooden desk, highlighted wallet addresses with yellow highlighter, redacted fake passport photocopies censored with black tape, stainless steel forensic tweezers, dim warm light from retro gooseneck desk lamp',
  'algo-mechanics':
    'Macro close-up shot of disassembled test smartphone on RF shielded testing workbench, open terminal debugger with scrolling code on matte ThinkPad laptop screen, vintage digital oscilloscope displaying telemetry waveforms, physical spiral notebook with handwritten probabilistic distribution curves',
  'digital-dialogue':
    'Vintage reel-to-reel magnetic tape deck and cassette recorder connected to a real-time audio spectrum analyzer, printed vocal spectrogram readout with red pen annotations marking synthetic speech anomalies, classic studio monitor headphones resting on dark oak desk',
  'modern-psychology':
    'Lone smartphone face-up on dark walnut nightstand in a quiet hotel room, soft diffused overcast window light on a rainy English afternoon, phone screen illuminating with a match alert, steaming ceramic mug of black tea, textured leather notebook with hand-drawn behavioral funnel diagrams',
  'first-dates':
    'Archival 35mm film contact sheet spread out on light table showing surveillance frames of London underground stations and quiet street cafes, selected negative frames marked with red grease pencil circles, Manila archive dossier envelope labeled Field Observation Notes',
  'romantic-essays':
    'Archival 35mm film contact sheet spread out on light table showing surveillance frames of London underground stations and quiet street cafes, selected negative frames marked with red grease pencil circles, Manila archive dossier envelope labeled Field Observation Notes',
};

// ---------------------------------------------------------------------------
// 3. Keyword Physical Object Modifiers
// ---------------------------------------------------------------------------

export function resolveKeywordModifier(slug: string, title: string): string {
  const combined = `${slug} ${title}`.toLowerCase();

  if (/crypto|pig butchering|whatsapp|steal|millions|scam/.test(combined)) {
    return 'Physical cold storage hardware wallet, printed cryptographic hash transaction logs, and international wire transfer slips on the desk.';
  }
  if (/deepfake|photo|reverse search|catfish|instagram|lens|stolen|image/.test(combined)) {
    return 'Forensic optical loupe and illuminated stereo microscope inspecting fine diffusion artifacts and edge inconsistencies on a glossy printed portrait photograph.';
  }
  if (/bot|algorithm|elo|tinder|hinge|bumble|slot machine|spambot|radar/.test(combined)) {
    return 'Hardware automated test rig with multi-device USB interface array, server metric log printouts, and calibrated signal measurement instruments.';
  }
  if (/voice|audio|phishing|call|phone|notes/.test(combined)) {
    return 'Precision audio measurement microphone, sound level meter, and waveform analyzer display highlighting acoustic frequency tampering.';
  }
  if (/narcissist|red flag|burnout|ghost|compatibility|decline|matchesbutnoda/.test(combined)) {
    return 'Annotated psychological research papers, underlined behavioral trait tables, and printed timeline charts mapping interaction frequency decay.';
  }

  return 'Forensic evidence tags, archival document sleeves, and calibrated photographic reference scale.';
}

export function buildForensicPrompt(slug: string, category: string, title: string): string {
  const scene = CATEGORY_SCENES[category] || CATEGORY_SCENES['safety-dossier'];
  const modifier = resolveKeywordModifier(slug, title);
  const cleanTitle = title.replace(/flirt(ing)?/gi, 'dialogue chemistry');

  return [
    MASTER_STYLE_ANCHOR,
    `Specific investigation scene: ${scene}`,
    `Focal objects: ${modifier}`,
    `Subject context: investigation of ${cleanTitle}`,
    NEGATIVE_CONSTRAINTS,
  ].join('. ');
}

// ---------------------------------------------------------------------------
// 4. NVIDIA NIM FLUX.1-dev Engine Invocation
// ---------------------------------------------------------------------------

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBase64(data: any): string | null {
  if (!data) return null;
  if (data.artifacts && Array.isArray(data.artifacts) && data.artifacts.length > 0) {
    if (data.artifacts[0].finishReason === 'CONTENT_FILTERED') {
      throw new Error('CONTENT_FILTERED');
    }
    return data.artifacts[0].base64 || data.artifacts[0].b64_json || null;
  }
  if (data.data && Array.isArray(data.data) && data.data.length > 0) {
    return data.data[0].b64_json || data.data[0].base64 || data.data[0].image || null;
  }
  if (data.image) return data.image;
  if (data.b64_json) return data.b64_json;
  return null;
}

async function pollNvcfQueue(reqId: string, apiKey: string, maxAttempts = 25): Promise<any> {
  const pollUrl = `https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`;
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts++;
    await sleep(2500);
    const pollRes = await axios.get(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      validateStatus: () => true,
    });
    if (pollRes.status === 200) {
      return pollRes.data;
    }
    if (pollRes.status !== 202) {
      throw new Error(`NVIDIA NVCF queue error (HTTP ${pollRes.status}): ${JSON.stringify(pollRes.data)}`);
    }
  }
  throw new Error(`NVIDIA NVCF inference timeout (${reqId})`);
}

async function generateViaNvidiaFlux(prompt: string, apiKey: string): Promise<Buffer> {
  const fluxUrl = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';
  let responseData: any = null;
  const timeoutMs = 90000;

  const res = await axios.post(
    fluxUrl,
    {
      prompt,
      mode: 'base',
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: timeoutMs,
      validateStatus: () => true,
    }
  );

  if (res.status === 200) {
    responseData = res.data;
  } else if (res.status === 202) {
    const reqId = res.headers['nvcf-reqid'] as string;
    if (!reqId) throw new Error('HTTP 202 returned without nvcf-reqid header');
    responseData = await pollNvcfQueue(reqId, apiKey);
  } else {
    throw new Error(`NVIDIA FLUX HTTP ${res.status}: ${JSON.stringify(res.data)}`);
  }

  const b64 = extractBase64(responseData);
  if (!b64) throw new Error('Failed to extract base64 from NVIDIA FLUX response');
  return Buffer.from(b64, 'base64');
}

export async function generateCoverForPost(
  slug: string,
  category: string,
  outputPath: string,
  title: string
): Promise<{ success: boolean; size: number; durationMs: number; provider: string; prompt: string }> {
  const prompt = buildForensicPrompt(slug, category, title);

  const fluxKey =
    process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';

  if (!fluxKey || !fluxKey.startsWith('nvapi-')) {
    throw new Error('NVIDIA API Key not found or invalid (must start with nvapi-)');
  }

  const startTime = Date.now();
  let rawBuffer: Buffer | null = null;
  let usedProvider = '';

  try {
    rawBuffer = await generateViaNvidiaFlux(prompt, fluxKey);
    usedProvider = 'NVIDIA NIM (FLUX.1-dev Forensic Evidence)';
  } catch (err: any) {
    console.warn(`   ⚠️ FLUX attempt 1 failed for ${slug} (${err.message}). Retrying in 4s...`);
    await sleep(4000);
    try {
      rawBuffer = await generateViaNvidiaFlux(prompt, fluxKey);
      usedProvider = 'NVIDIA NIM (FLUX.1-dev Retry)';
    } catch (retryErr: any) {
      throw new Error(`NVIDIA Pipeline Error: ${retryErr.message}`);
    }
  }

  if (!rawBuffer || rawBuffer.length < 2000) {
    throw new Error(`NVIDIA Pipeline Error: Received empty or invalid buffer (${rawBuffer?.length || 0} bytes)`);
  }

  // Optimize with sharp: 1200x675 WebP, quality 85, strictly 16:9
  await sharp(rawBuffer)
    .resize(1200, 675, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(outputPath);

  const stats = fs.statSync(outputPath);
  const durationMs = Date.now() - startTime;

  return {
    success: true,
    size: stats.size,
    durationMs,
    provider: usedProvider,
    prompt,
  };
}

// ---------------------------------------------------------------------------
// 5. Batch & Single Runner Orchestrator
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all') || args.includes('--force');
  const offsetIndex = args.indexOf('--offset');
  const offset = offsetIndex !== -1 ? parseInt(args[offsetIndex + 1], 10) : 0;
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : Infinity;

  const slugIndex = args.indexOf('--slug');
  const singleSlug = slugIndex !== -1 ? args[slugIndex + 1] : null;

  console.log('=================================================================');
  console.log('🔍 FORENSIC EVIDENCE COVER GENERATOR (NVIDIA NIM FLUX.1-dev)');
  console.log('🇬🇧 Desk Base: Cheltenham, UK | 35mm Documentary Evidence Aesthetic');
  console.log('=================================================================');
  console.log(`Directory: ${POSTS_DIR}`);
  console.log(`Output:    ${OUTPUT_DIR}`);
  if (singleSlug) {
    console.log(`Target:    SINGLE SLUG [${singleSlug}]`);
  } else {
    console.log(`Mode:      ${forceAll ? 'FORCE OVERWRITE (ALL COVERS)' : 'INCREMENTAL'}`);
    if (offset > 0) console.log(`Offset:    ${offset} articles`);
    if (limit !== Infinity) console.log(`Limit:     ${limit} articles`);
  }
  console.log('-----------------------------------------------------------------\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const tasks = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');

    const catMatch = content.match(/^category:\s*["']?([^"'\r\n]+)["']?/m);
    const category = catMatch ? catMatch[1].trim() : 'safety-dossier';

    const titleMatch = content.match(/^title:\s*["']?([^"'\r\n]+)["']?/m);
    const title = titleMatch ? titleMatch[1].trim() : slug;

    const outputPath = path.join(OUTPUT_DIR, `${slug}.webp`);

    const exists =
      fs.existsSync(outputPath) &&
      fs.statSync(outputPath).size > 5000 &&
      !outputPath.includes('default-cover.webp');

    return {
      file,
      slug,
      title,
      category,
      outputPath,
      exists,
    };
  });

  let pendingTasks = tasks;
  if (singleSlug) {
    pendingTasks = tasks.filter((t) => t.slug === singleSlug);
    if (pendingTasks.length === 0) {
      console.error(`❌ Error: Post with slug "${singleSlug}" not found in ${POSTS_DIR}`);
      process.exit(1);
    }
  } else {
    const filteredTasks = tasks.filter((t) => forceAll || !t.exists);
    pendingTasks = filteredTasks.slice(offset, offset + limit);
  }

  console.log(`🎯 Total candidate pool:     ${tasks.length}`);
  console.log(`🚀 Queue to generate:        ${pendingTasks.length}\n`);

  if (pendingTasks.length === 0) {
    console.log('✨ All covers are already generated and up to date! Nothing to do.');
    return;
  }

  let completed = 0;
  let failed = 0;
  const batchStart = Date.now();

  for (let i = 0; i < pendingTasks.length; i++) {
    const task = pendingTasks[i];
    console.log(
      `[${i + 1}/${pendingTasks.length}] Generating: ${task.slug}.webp`
    );
    console.log(`   🏷️ Category:  ${task.category}`);
    console.log(`   📄 Title:     ${task.title}`);

    try {
      const result = await generateCoverForPost(
        task.slug,
        task.category,
        task.outputPath,
        task.title
      );

      console.log(
        `   ✅ [${result.provider}] Saved: ${path.basename(task.outputPath)} (${(result.size / 1024).toFixed(1)} KB) in ${(result.durationMs / 1000).toFixed(1)}s\n`
      );
      completed++;
    } catch (err: any) {
      console.error(`   ❌ ERROR generating ${task.slug}: ${err.message}\n`);
      failed++;
    }

    // Rate-limit delay between generations (2.5s)
    if (i < pendingTasks.length - 1) {
      await sleep(2500);
    }
  }

  const totalTimeSec = ((Date.now() - batchStart) / 1000).toFixed(1);
  console.log('=================================================================');
  console.log(`🏁 Finished: ${completed} succeeded, ${failed} failed in ${totalTimeSec}s`);
  console.log('=================================================================');
}

if (
  process.argv[1] &&
  (process.argv[1].endsWith('batch-generate-covers.ts') || process.argv[1].endsWith('batch-generate-covers.js'))
) {
  main().catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}
