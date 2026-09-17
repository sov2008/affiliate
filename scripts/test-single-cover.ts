/**
 * Isolated Single Cover Calibration Script
 * Calibrates single cover: the-slot-machine-algorithm-how-dating-apps-engineer-loneliness.webp
 * Providers: NVIDIA NIM FLUX.1-dev / Pollinations FLUX with auth fallback
 */

import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

// Load environment credentials
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const OUTPUT_DIR = path.resolve(process.cwd(), 'scratch');
const PNG_OUTPUT = path.join(OUTPUT_DIR, 'test_single_output.png');
const WEBP_OUTPUT = path.join(OUTPUT_DIR, 'test_single_output.webp');

const PROMPT =
  '2D vintage comic strip panel, 1990s anime cel shading, newsprint paper texture, black ink contour lines, flat colors. On the left: Asuka with red twin-tails pointing at a board. On the right: Shinji looking at paper logs. Bold outlines, retro newspaper illustration, 16:9 aspect ratio, no 3D, no realistic shading';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBase64(data: any): string | null {
  if (!data) return null;
  if (data.artifacts && Array.isArray(data.artifacts) && data.artifacts.length > 0) {
    if (data.artifacts[0].finishReason === 'CONTENT_FILTERED') {
      throw new Error('Response filtered by NVIDIA content safety filter');
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

async function pollNvcfQueue(reqId: string, apiKey: string, maxAttempts = 20): Promise<any> {
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

async function tryNvidiaGeneration(apiKey: string): Promise<Buffer> {
  console.log('⚡ Attempting NVIDIA NIM FLUX.1-dev generation...');
  const fluxUrl = 'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev';

  const res = await axios.post(
    fluxUrl,
    {
      prompt: PROMPT,
      mode: 'base',
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 60000,
      validateStatus: () => true,
    }
  );

  let responseData: any = null;
  if (res.status === 200) {
    responseData = res.data;
  } else if (res.status === 202) {
    const reqId = res.headers['nvcf-reqid'] as string;
    if (!reqId) throw new Error('HTTP 202 returned without nvcf-reqid header');
    console.log(`   ⏳ Enqueued in NVIDIA NIM NVCF (reqId: ${reqId}), polling...`);
    responseData = await pollNvcfQueue(reqId, apiKey);
  } else {
    throw new Error(`NVIDIA NIM returned HTTP ${res.status}: ${JSON.stringify(res.data)}`);
  }

  const b64 = extractBase64(responseData);
  if (!b64) throw new Error('Failed to extract base64 from NVIDIA NIM response');
  return Buffer.from(b64, 'base64');
}

async function tryPollinationsGeneration(): Promise<Buffer> {
  console.log('🌸 Attempting Pollinations FLUX generation...');
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
    PROMPT
  )}?width=1200&height=675&nologo=true&model=flux&seed=${seed}`;

  const apiKey = process.env.POLLINATIONS_API_KEY;
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) FlirtCheck/2.0',
    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  return Buffer.from(res.data);
}

async function main() {
  console.log('=================================================================');
  console.log('🎯 SINGLE COVER CALIBRATION PIPELINE');
  console.log('=================================================================');
  console.log(`Target:  the-slot-machine-algorithm-how-dating-apps-engineer-loneliness.webp`);
  console.log(`Prompt:  "${PROMPT}"\n`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const nvidiaKey =
    process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY;

  let rawBuffer: Buffer | null = null;
  let usedProvider = '';
  const startTime = Date.now();

  if (nvidiaKey && nvidiaKey.startsWith('nvapi-')) {
    try {
      rawBuffer = await tryNvidiaGeneration(nvidiaKey);
      usedProvider = 'NVIDIA NIM (FLUX.1-dev)';
    } catch (err: any) {
      console.warn(`   ⚠️ NVIDIA failed: ${err.message}. Falling back to Pollinations...`);
    }
  }

  if (!rawBuffer) {
    try {
      rawBuffer = await tryPollinationsGeneration();
      usedProvider = 'Pollinations (FLUX model)';
    } catch (err: any) {
      console.error(`   ❌ Pollinations failed: ${err.message}`);
      throw err;
    }
  }

  const apiDurationMs = Date.now() - startTime;
  console.log(`\n🎉 API Generation successful via [${usedProvider}] in ${apiDurationMs}ms!`);
  console.log(`   📦 Raw buffer size: ${(rawBuffer.length / 1024).toFixed(1)} KB`);

  // Save raw PNG
  fs.writeFileSync(PNG_OUTPUT, rawBuffer);
  console.log(`   💾 Saved raw PNG:   ${PNG_OUTPUT}`);

  // Convert & resize via sharp to 1200x675 WebP (quality 85)
  console.log('🖼️  Converting to 1200x675 WebP (Quality 85)...');
  await sharp(rawBuffer)
    .resize(1200, 675, { fit: 'cover', position: 'center' })
    .webp({ quality: 85 })
    .toFile(WEBP_OUTPUT);

  const webpStats = fs.statSync(WEBP_OUTPUT);
  const totalDurationMs = Date.now() - startTime;

  console.log(`   ✅ Saved 16:9 WebP: ${WEBP_OUTPUT} (${(webpStats.size / 1024).toFixed(1)} KB)`);
  console.log(`⏱️  Total pipeline latency: ${totalDurationMs}ms\n`);
  console.log('=================================================================');
}

main().catch((err) => {
  console.error('\n💥 Calibration failed:', err.message);
  process.exit(1);
});
