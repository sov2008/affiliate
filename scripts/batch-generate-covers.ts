/**
 * Batch Generate Covers Pipeline (16:9 Cinematic 2D Cel-Shading WebP 1200x675)
 * Engine: PURE NVIDIA NIM Multi-Engine (FLUX.1-dev + Stable Diffusion 3.5 Large)
 * Aesthetic Core: 90s Cel Gazette / Love is... Strict Neutral Forensic Comic Style
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
// 1. Strict Anti-Blush 2D Forensic Prompt Architecture
// ---------------------------------------------------------------------------

const BASE_PROMPT =
  '2D vintage comic strip panel, 1990s anime cel shading, newsprint paper texture, black ink contour lines, flat colors. On the left: Asuka with red twin-tails pointing at cyber equipment. On the right: Shinji looking at forensic logs. Serious focused forensic investigators, pale unblushing skin, completely neutral facial expressions, no blush, no cheek stripes, working at forensic desk with cyber equipment. Bold outlines, retro newspaper illustration, 16:9 aspect ratio, no 3D, no realistic shading';

const SANITIZED_SAFE_PROMPT =
  'vintage 1990s anime cel shading, retro comic panel, two forensic analysts working with vintage computers, black ink outlines, flat colors, no blush, pale skin, 16:9 aspect ratio';

export type SceneArchetype =
  | 'algo-mechanics'
  | 'safety-dossier'
  | 'voice-and-acoustics'
  | 'bot-syntax'
  | 'modern-psychology'
  | 'romantic-essays';

const SCENE_ACTIONS: Record<SceneArchetype, string> = {
  'algo-mechanics':
    'analyzing glowing algorithm ranking chart on wall, data flow curves',
  'safety-dossier':
    'holding magnifying glass over smartphone screen, forensic inspection of user profile',
  'voice-and-acoustics':
    'listening to vintage cassette recorder with headphones, green audio spectrogram on oscilloscope',
  'bot-syntax':
    'circling syntax anomalies and em-dashes with red marker on printed log',
  'modern-psychology':
    'examining case file at forensic desk in rain, coffee cup, document dossier',
  'romantic-essays':
    'vintage typewriter on wooden desk, ink pen, unscripted reality case log',
};

/**
 * Resolves post archetype based on category, slug, and title keywords
 */
function resolvePostArchetype(
  category: string,
  slug: string,
  title: string
): SceneArchetype {
  const text = `${category} ${slug} ${title}`.toLowerCase();

  if (
    text.includes('voice') ||
    text.includes('audio') ||
    text.includes('acoustic') ||
    text.includes('soundwave') ||
    text.includes('deepfake-audio') ||
    text.includes('phishing')
  ) {
    return 'voice-and-acoustics';
  }

  if (
    text.includes('punctuation') ||
    text.includes('llm') ||
    text.includes('syntax') ||
    text.includes('em-dash') ||
    text.includes('spambot')
  ) {
    return 'bot-syntax';
  }

  if (
    category === 'algo-mechanics' ||
    text.includes('elo') ||
    text.includes('slot-machine') ||
    text.includes('algorithm') ||
    text.includes('ranking') ||
    text.includes('shadowban')
  ) {
    return 'algo-mechanics';
  }

  if (
    category === 'safety-dossier' ||
    text.includes('scam') ||
    text.includes('pig-butchering') ||
    text.includes('crypto') ||
    text.includes('whatsapp') ||
    text.includes('reverse-image') ||
    text.includes('catfish') ||
    text.includes('military') ||
    text.includes('bot-farm') ||
    text.includes('checkmark')
  ) {
    return 'safety-dossier';
  }

  if (category === 'romantic-essays' || text.includes('essay') || text.includes('unscripted')) {
    return 'romantic-essays';
  }

  return 'modern-psychology';
}

// ---------------------------------------------------------------------------
// 2. Pure NVIDIA NIM Engine (FLUX.1-dev + Stable Diffusion 3.5 Large)
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
 * Robust NVIDIA NIM Cover Generation (Primary FLUX.1-dev with Sanitized Retry)
 */
async function generateCoverForPost(
  slug: string,
  archetype: SceneArchetype,
  outputPath: string
): Promise<{ success: boolean; size: number; durationMs: number; provider: string }> {
  const action = SCENE_ACTIONS[archetype];
  const fullPrompt = `${BASE_PROMPT}, ${action}`;

  const fluxKey =
    process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';

  if (!fluxKey || !fluxKey.startsWith('nvapi-')) {
    throw new Error('NVIDIA API Key not found or invalid (must start with nvapi-)');
  }

  const startTime = Date.now();
  let rawBuffer: Buffer | null = null;
  let usedProvider = '';

  // Attempt 1: Standard full prompt
  try {
    rawBuffer = await generateViaNvidiaFlux(fullPrompt, fluxKey);
    usedProvider = 'NVIDIA NIM (FLUX.1-dev)';
  } catch (err: any) {
    const isFiltered = err.message.includes('CONTENT_FILTERED');
    if (isFiltered) {
      console.warn(`   🛡️ Safety filter triggered for ${slug}. Retrying with sanitized forensic prompt...`);
    } else {
      console.warn(`   ⚠️ FLUX attempt 1 failed for ${slug} (${err.message}). Retrying in 3s...`);
      await sleep(3000);
    }

    // Attempt 2: Retry with Sanitized Safe Prompt if filtered, or retry full prompt if transient error
    try {
      const retryPrompt = isFiltered ? SANITIZED_SAFE_PROMPT : fullPrompt;
      rawBuffer = await generateViaNvidiaFlux(retryPrompt, fluxKey);
      usedProvider = isFiltered ? 'NVIDIA NIM (FLUX.1-dev Sanitized)' : 'NVIDIA NIM (FLUX.1-dev Retry)';
    } catch (retryErr: any) {
      // Attempt 3: Final attempt with Sanitized prompt if not already tried
      if (!isFiltered) {
        console.warn(`   🛡️ Falling back to clean sanitized prompt for ${slug}...`);
        await sleep(3000);
        try {
          rawBuffer = await generateViaNvidiaFlux(SANITIZED_SAFE_PROMPT, fluxKey);
          usedProvider = 'NVIDIA NIM (FLUX.1-dev SafeFallback)';
        } catch (finalErr: any) {
          throw new Error(`NVIDIA Pipeline Error: ${finalErr.message}`);
        }
      } else {
        throw new Error(`NVIDIA Pipeline Error: ${retryErr.message}`);
      }
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
  console.log('⚡ PURE NVIDIA NIM 2D COVER GENERATOR (FLUX.1-dev + SD 3.5 Large)');
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

    const archetype = resolvePostArchetype(category, slug, title);
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
      archetype,
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
    console.log(`   🏷️  Category:  ${task.category}  ->  Archetype: [${task.archetype}]`);
    console.log(`   📖 Action:    "${SCENE_ACTIONS[task.archetype]}"`);

    try {
      const result = await generateCoverForPost(
        task.slug,
        task.archetype,
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

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
