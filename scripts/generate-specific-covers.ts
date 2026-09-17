import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const OUTPUT_DIR = path.resolve(process.cwd(), 'blog/public/images/posts');

const TARGETS = [
  { slug: '3question-compatibility-test-to-ask-before-the-first-date', action: 'examining case dossier folder at forensic desk, paper reports, ceramic coffee cup' },
  { slug: 'dating-scam-verification-guide-2026', action: 'inspecting printed investigative reports with magnifying glass, verifying forensic records' },
  { slug: 'dead-giveaways-in-bio-punctuation-llm-spambots-dating', action: 'circling syntax anomalies and text patterns with red marker on printed technical log' },
  { slug: 'how-to-avoid-catfishing-the-2026-online-dating-safety-guide-every', action: 'inspecting printed investigative reports with magnifying glass, verifying forensic records' },
  { slug: 'how-to-politely-decline-a-date-request-without-burning-the-bridge', action: 'examining case dossier folder at forensic desk, paper reports, ceramic coffee cup' },
  { slug: 'voice-prompts-on-hinge-what-vocal-tone-triggers-attraction-or-rep', action: 'listening to vintage cassette recorder with headphones, green audio spectrogram on oscilloscope' },
];

function buildStrictPrompt(categoryAction: string): string {
  return [
    "masterpiece, 2D retro anime comic panel, 1990s animation cel, bold clean black ink contour lines, flat colors, warm newsprint paper texture, 16:9 horizontal frame",
    "On the left: Asuka, vibrant copper-red hair in two high twin-tails, dark oversized turtleneck sweater, sharp focused analytical expression",
    "On the right: Shinji, short dark brown hair, crisp cream collared shirt, calm serious expression",
    categoryAction,
    "Setting: retro detective investigation office, CRT monitor screen, technical paper reports on desk, vintage equipment, warm ambient lighting",
    "flat 2D cel shading, classic 1990s anime aesthetic, sharp lineart, no 3D, no photorealism"
  ].join(", ");
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

async function pollNvcfQueue(reqId: string, apiKey: string, maxAttempts = 30): Promise<any> {
  const pollUrl = `https://api.nvcf.nvidia.com/v2/nvcf/pexec/status/${reqId}`;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await axios.get(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      validateStatus: () => true,
    });
    if (res.status === 200) return res.data;
    if (res.status !== 202) {
      throw new Error(`NVCF HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  }
  throw new Error(`NVCF timeout (${reqId})`);
}

async function generate(prompt: string, apiKey: string): Promise<Buffer> {
  const url = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';
  const res = await axios.post(
    url,
    { prompt, mode: 'base' },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 120000,
      validateStatus: () => true,
    }
  );

  let data = res.data;
  if (res.status === 202) {
    const reqId = res.headers['nvcf-reqid'] as string;
    data = await pollNvcfQueue(reqId, apiKey);
  } else if (res.status !== 200) {
    throw new Error(`NVIDIA HTTP ${res.status}: ${JSON.stringify(res.data)}`);
  }

  const b64 = extractBase64(data);
  if (!b64) throw new Error('No base64 in response');
  return Buffer.from(b64, 'base64');
}

async function run() {
  const apiKey = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';
  console.log(`Starting targeted generation for ${TARGETS.length} covers...`);

  for (let i = 0; i < TARGETS.length; i++) {
    const target = TARGETS[i];
    const outPath = path.join(OUTPUT_DIR, `${target.slug}.webp`);
    console.log(`[${i + 1}/${TARGETS.length}] Generating ${target.slug}...`);

    let rawBuffer: Buffer | null = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const prompt = buildStrictPrompt(target.action);
        rawBuffer = await generate(prompt, apiKey);
        break;
      } catch (err: any) {
        console.warn(`   ⚠️ Attempt ${attempt} failed (${err.message}). Retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    if (!rawBuffer) {
      console.error(`   ❌ All attempts failed for ${target.slug}`);
      continue;
    }

    await sharp(rawBuffer)
      .resize(1200, 675, { fit: 'cover', position: 'center' })
      .webp({ quality: 85 })
      .toFile(outPath);

    const stat = fs.statSync(outPath);
    console.log(`   ✅ Saved: ${path.basename(outPath)} (${(stat.size / 1024).toFixed(1)} KB)\n`);
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('Finished targeted run!');
}

run().catch(console.error);
