/**
 * Batch Generate Covers Pipeline (16:9 Cinematic 2D Cel-Shading WebP 1200x675)
 * Engine: PURE NVIDIA NIM Multi-Engine (FLUX.1-dev)
 * Aesthetic Core: 90s Gainax / Evangelion / Love is... Strict Forensic Anime Cel
 * Usage: npx tsx scripts/batch-generate-covers.ts [--all | --force] [--limit N]
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
// 1. Scene-First Cinematic Camera Angles Matrix (Angle-First Attention)
// ---------------------------------------------------------------------------

export interface CinematicAngle {
  id: number;
  name: string;
  prompt: string;
}

export const CINEMATIC_ANGLES: CinematicAngle[] = [
  {
    id: 1,
    name: 'Ракурс 1 (CRT Terminal Glow)',
    prompt:
      'Over-the-shoulder camera shot looking at a glowing green CRT terminal screen filled with dating algorithm code. In the dim background, 1990s anime girl with copper twin-tails crossed arms looking skeptical. Vintage cel shading, 16:9 aspect ratio.',
  },
  {
    id: 2,
    name: 'Ракурс 2 (Desk Evidence / Flat-lay angle)',
    prompt:
      'High angle shot looking down at a retro detective desk: open case folder, magnifying glass, red marker circling text on printed dating profile, ceramic coffee cup. Two investigators taking notes. 1990s anime cel style, 16:9.',
  },
  {
    id: 3,
    name: 'Ракурс 3 (Rainy Window Noir)',
    prompt:
      'Moody vintage cafe window with heavy raindrops and neon reflections. Inside, a dark-haired young man in cream shirt analyzing printed server logs, serious expression. 1990s anime aesthetic, 16:9.',
  },
  {
    id: 4,
    name: 'Ракурс 4 (Corkboard Conspiracy)',
    prompt:
      'Investigation corkboard with red yarn connecting suspect dating profile photos and printed chat screenshots. Anime girl with red hair pointing wooden stick at evidence board. 1990s anime cel art, 16:9.',
  },
  {
    id: 5,
    name: 'Ракурс 5 (Audio Lab / Oscilloscope)',
    prompt:
      'Close-up of vintage cassette tape recorder and audio oscilloscope with green sine wave. Anime boy wearing bulky 90s headphones taking analytical notes. Retro 90s animation cel, 16:9.',
  },
  {
    id: 6,
    name: 'Ракурс 6 (Hardware / Micro Forensic)',
    prompt:
      'Macro close-up shot of precision tweezers inspecting a damaged smartphone circuit board on forensic workbench. In the background, two anime investigators focused intently. 1990s anime cel style, 16:9.',
  },
];

export const ATMOSPHERIC_ENVIRONMENTS: string[] = [
  'retro navy archive with subtle desk illumination',
  'warm amber desk light and tungsten desk lamp glow',
  'rainy retro neon reflection with cool cyan and magenta highlights',
  'green phosphor CRT terminal glow in dark 90s laboratory',
];

export interface CinematicSetup {
  angle: CinematicAngle;
  environment: string;
}

export function resolveCinematicSetup(slug: string, category: string): CinematicSetup {
  let hash = 0;
  const combined = `${slug}_${category}`;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const angleIndex = absHash % CINEMATIC_ANGLES.length;
  const envIndex = (absHash >> 3) % ATMOSPHERIC_ENVIRONMENTS.length;

  return {
    angle: CINEMATIC_ANGLES[angleIndex],
    environment: ATMOSPHERIC_ENVIRONMENTS[envIndex],
  };
}

export function buildStrictPrompt(setup: CinematicSetup): string {
  return [
    setup.angle.prompt,
    '1990s animation cel style, masterpiece 2D retro anime comic panel, bold clean black ink contour lines, flat colors, warm newsprint paper texture, 16:9 horizontal frame',
    `Atmospheric setting: ${setup.environment}, vintage equipment, paper investigative reports`,
    'flat 2D cel shading, classic 1990s anime aesthetic, sharp lineart, no 3D, no photorealism',
  ].join(', ');
}

// ---------------------------------------------------------------------------
// 2. Pure NVIDIA NIM Engine (FLUX.1-dev)
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

/**
 * Primary Engine: NVIDIA NIM FLUX.1-dev
 */
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

/**
 * Robust NVIDIA NIM Cover Generation with Angle-First Architecture
 */
export async function generateCoverForPost(
  slug: string,
  category: string,
  outputPath: string
): Promise<{ success: boolean; size: number; durationMs: number; provider: string; angleName: string }> {
  const setup = resolveCinematicSetup(slug, category);
  const prompt = buildStrictPrompt(setup);

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
    usedProvider = 'NVIDIA NIM (FLUX.1-dev Angle-First)';
  } catch (err: any) {
    console.warn(`   ⚠️ FLUX attempt 1 failed for ${slug} (${err.message}). Retrying in 3s...`);
    await sleep(3000);
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

  // Optimize with sharp strictly matching specs (1200x675 WebP, quality 85)
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
    angleName: setup.angle.name,
  };
}

// ---------------------------------------------------------------------------
// 3. Batch Orchestrator
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all') || args.includes('--force');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : Infinity;

  console.log('=================================================================');
  console.log('⚡ PURE NVIDIA NIM 2D COVER GENERATOR (FLUX.1-dev Angle-First)');
  console.log('🎬 Style: Gainax / Evangelion / Love is... 6 Cinematic Angles');
  console.log('=================================================================');
  console.log(`Directory: ${POSTS_DIR}`);
  console.log(`Output:    ${OUTPUT_DIR}`);
  console.log(`Mode:      ${forceAll ? 'FORCE OVERWRITE (ALL COVERS)' : 'INCREMENTAL'}`);
  if (limit !== Infinity) console.log(`Limit:     ${limit} articles`);
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

    const setup = resolveCinematicSetup(slug, category);
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
      setup,
      outputPath,
      exists,
    };
  });

  const pendingTasks = tasks.filter((t) => forceAll || !t.exists).slice(0, limit);

  console.log(`🎯 Total articles:           ${tasks.length}`);
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
    console.log(`   🎬 Camera:    ${task.setup.angle.name}`);
    console.log(`   🌆 Env:       ${task.setup.environment}`);
    console.log(`   🏷️ Category:  ${task.category}`);

    try {
      const result = await generateCoverForPost(
        task.slug,
        task.category,
        task.outputPath
      );

      console.log(
        `   ✅ [${result.provider}] Saved: ${path.basename(task.outputPath)} (${(result.size / 1024).toFixed(1)} KB) in ${result.durationMs}ms\n`
      );
      completed++;
    } catch (err: any) {
      console.error(`   ❌ ERROR generating ${task.slug}: ${err.message}\n`);
      failed++;
    }

    // Rate-limit delay between generations (1.8s)
    if (i < pendingTasks.length - 1) {
      await sleep(1800);
    }
  }

  const totalTimeSec = ((Date.now() - batchStart) / 1000).toFixed(1);
  console.log('=================================================================');
  console.log(`🏁 Finished batch: ${completed} succeeded, ${failed} failed in ${totalTimeSec}s`);
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
