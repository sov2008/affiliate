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
  'High-end editorial lifestyle photography, 35mm film aesthetic, authentic natural lighting, shallow depth of field, elegant cinematic composition, contemporary Vogue and Kinfolk magazine aesthetic, rich color grading, photorealistic 8k, aspect ratio 16:9';

export const NEGATIVE_CONSTRAINTS =
  'avoid: vintage reel to reel tape recorder, audio cassettes, tape deck, yellow paper tax documents, handwritten paper clutter, messy office clutter, anime, cartoon, illustration, 3d render, cgi, plastic smooth skin, watermark, text typography overlay, distorted hands, oversaturated garish colors, low quality';

export const SAFE_EDITORIAL_SCENE =
  'A high-end editorial still life: a sleek modern smartphone resting on a designer travertine desk next to a white ceramic coffee cup and a minimalist notebook, soft natural Scandinavian morning daylight, elegant shadows, refined architectural aesthetic';

export function buildForensicPrompt(slug: string, category: string, title: string, isFallback: boolean = false): string {
  if (isFallback) {
    return `${MASTER_STYLE_ANCHOR}, ${SAFE_EDITORIAL_SCENE}, natural depth of field, photorealistic, no text, no watermark, aspect ratio 16:9. ${NEGATIVE_CONSTRAINTS}`;
  }

  const combined = `${slug} ${title}`.toLowerCase();

  let specificScene = '';

  if (/flirt|polite|chemistry|micro-flirting|rizz|interest|signal|attraction|secretly/.test(combined)) {
    specificScene = 'An elegant person sitting in a sunlit modern European cafe, calmly reading a message on a sleek smartphone, warm ambient daylight, thoughtful expression, candid documentary editorial photography';
  } else if (/first date|icebreaker|opener|banter|message examples|conversation|revive|reply|script|decline/.test(combined)) {
    specificScene = 'Two well-dressed friends sharing an engaging conversation at a bright cafe table, drinking coffee by a large sunlit window, candid documentary aesthetic';
  } else if (/screenshot|analyzer|chat|texting|whatsapp|dm|messages|chatgpt|loyalty/.test(combined)) {
    specificScene = 'Close-up of hands holding a modern smartphone with an elegant messaging application interface, sitting at a clean marble desk with soft morning daylight';
  } else if (/algorithm|most compatible|elo|hinge|tinder|bumble|mechanics|shadowban|active|reset|telemetry/.test(combined)) {
    specificScene = 'Modern tech lifestyle: hands holding a contemporary smartphone displaying mobile app cards, situated in a minimalist bright architectural workspace, clean Scandinavian interior';
  } else if (/scam|catfish|fake|deepfake|pig butchering|photo|reverse search|blackmail|sextortion|osint|verification/.test(combined)) {
    specificScene = 'Cinematic investigative journalism: a modern ultra-thin laptop open in a stylish dimly-lit urban apartment at dusk, screen displaying digital verification telemetry, warm desk lamp, moody tones';
  } else if (/burnout|disappear|ghost|matchesbutnoda|why you get matches|red flags|narcissist|infidelity|loyalty/.test(combined)) {
    specificScene = 'An introspective, cinematic portrait of a thoughtful person in a modern interior looking out of a large rain-streaked window, smartphone resting on a wooden table, soft atmospheric mood';
  } else if (/voice|audio|tone/.test(combined)) {
    specificScene = 'A stylish person wearing wireless earbuds walking through an airy city park in morning sunlight, holding a modern smartphone, candid editorial portrait';
  } else {
    switch (category) {
      case 'first-dates':
      case 'romantic-essays':
        specificScene = 'An authentic, cinematic moment of people enjoying coffee on an outdoor cafe terrace in a sun-drenched city, warm daylight';
        break;
      case 'digital-dialogue':
        specificScene = 'A modern smartphone resting on a designer cafe table in natural morning light, showing messaging app preview, beside a cup of coffee and notebook';
        break;
      case 'algo-mechanics':
        specificScene = 'Hands holding a modern smartphone navigating mobile dating application in a minimalist cafe, clean urban bokeh';
        break;
      case 'modern-psychology':
        specificScene = 'A candid, atmospheric portrait of a person thoughtfully checking their phone in a cozy modern apartment lounge';
        break;
      case 'safety-dossier':
      default:
        specificScene = 'A modern minimalist desk with a sleek laptop displaying digital verification interface, warm focused desk lamp, contemporary editorial style';
        break;
    }
  }

  return `${MASTER_STYLE_ANCHOR}, ${specificScene}, natural depth of field, photorealistic, no text, no watermark, aspect ratio 16:9. ${NEGATIVE_CONSTRAINTS}`;
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
    console.warn(`   ⚠️ FLUX attempt 1 failed for ${slug} (${err.message}). Trying safe editorial fallback in 3s...`);
    await sleep(3000);
    const fallbackPrompt = buildForensicPrompt(slug, category, title, true);
    try {
      rawBuffer = await generateViaNvidiaFlux(fallbackPrompt, fluxKey);
      usedProvider = 'NVIDIA NIM (FLUX.1-dev Safe Editorial Fallback)';
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
