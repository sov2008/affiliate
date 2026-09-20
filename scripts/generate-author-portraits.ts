/**
 * Generate Arthur Vance Documentary Portraits
 * Engine: NVIDIA NIM (FLUX.1-dev)
 * Aesthetic: 35mm Documentary / British Intelligence Forensic Analyst (Cheltenham, UK)
 */

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const OUTPUT_DIR = path.resolve(process.cwd(), 'blog/public/images/author');

interface PortraitTask {
  filename: string;
  width: number;
  height: number;
  prompt: string;
  label: string;
}

const TASKS: PortraitTask[] = [
  {
    filename: 'arthur-vance-desk.webp',
    width: 1200,
    height: 800,
    label: 'Lead Forensic Desk Editorial Portrait (1200x800)',
    prompt:
      'Editorial documentary photograph, 35mm film grain, analog aesthetic, desk of a cyber intelligence investigator in Cheltenham UK, an investigator seated in profile at an oak desk working on a ThinkPad laptop, printed investigation dossier files, warm coffee mug, natural overcast window light, shallow depth of field, desaturated color grade, photorealistic 8k',
  },
  {
    filename: 'arthur-vance-avatar.webp',
    width: 600,
    height: 600,
    label: 'Forensic Investigator Close-up Avatar (600x600)',
    prompt:
      'Editorial documentary portrait photograph, 35mm film grain, British intelligence researcher in Cheltenham UK, serious thoughtful expression, dark sweater, natural diffused window lighting, blurred office background with book archive, analog Tri-X aesthetic, photorealistic 8k',
  },
];

function sleep(ms: number) {
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

async function run() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║  ARTHUR VANCE // PORTRAIT GENERATION PIPELINE (NVIDIA FLUX.1-dev)    ║');
  console.log('║  Location: Cheltenham, UK | 35mm Documentary Aesthetic               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const apiKey =
    process.env.NVIDIA_FLUX_DEV_API_KEY ||
    process.env.NVIDIA_NIM_API_KEY ||
    process.env.NVIDIA_API_KEY;

  if (!apiKey) {
    console.error('❌ Missing NVIDIA_FLUX_DEV_API_KEY in environment variables.');
    process.exit(1);
  }

  for (let i = 0; i < TASKS.length; i++) {
    const task = TASKS[i];
    const targetPath = path.join(OUTPUT_DIR, task.filename);
    console.log(`[${i + 1}/${TASKS.length}] Generating ${task.label}`);
    console.log(`    Target: ${targetPath}`);
    console.log(`    Prompt: ${task.prompt}`);

    const start = Date.now();
    try {
      const rawBuffer = await generateViaNvidiaFlux(task.prompt, apiKey);
      await sharp(rawBuffer)
        .resize(task.width, task.height, { fit: 'cover', position: 'attention' })
        .webp({ quality: 88, effort: 5 })
        .toFile(targetPath);

      const stats = fs.statSync(targetPath);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      console.log(`    ✅ Saved: ${task.filename} (${(stats.size / 1024).toFixed(1)} KB) in ${elapsed}s\n`);
    } catch (err: any) {
      console.error(`    ❌ Failed generating ${task.filename}:`, err.message);
      process.exit(1);
    }

    if (i < TASKS.length - 1) {
      await sleep(3000);
    }
  }

  console.log('🎉 All Arthur Vance portraits successfully generated and optimized!');
}

run();
