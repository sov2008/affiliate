/**
 * Генерация недостающей обложки для coffee-vs-dinner поста через NVIDIA NIM FLUX.1-dev
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const NVIDIA_API_KEY = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';
const SLUG = 'coffee-vs-dinner-date-one-why-low-investment-venues-win';
const OUTPUT_DIR = path.resolve(__dirname, '../../blog/public/images/posts');
const OUTPUT_PATH = path.join(OUTPUT_DIR, `${SLUG}.webp`);

const PROMPT = `Editorial documentary photograph, Fujifilm Pro 400H aesthetic, desaturated greens, muted cool shadow tones, organic analog grain, Tactile close-up shot with 85mm f/1.8 lens, shallow depth of field, razor-sharp foreground focus with soft bokeh, warm directional tungsten desk lamp casting soft long diagonal shadows across dark walnut wood. Intimate corner table set for two in a quiet vintage European bistro at dusk: two crystal glasses of sparkling water with lemon slices, worn leatherbound dinner menu, flickering small beeswax candle creating warm bokeh. High textural fidelity, tactile paper and hardware surfaces, desaturated muted color palette with rich realistic shadows, analog surveillance aesthetic, no anime, no cartoons, photorealistic 8k, aspect ratio 16:9. Subject context: Coffee vs Dinner on a First Date - Why Low-Investment Venues Yield Better Chemistry. Investigation focus: Love is finding magic over a simple morning coffee with zero forced expectations.`;

async function callNvidiaFlux() {
  console.log(`🎨 Generating cover for: ${SLUG}`);
  console.log(`🔑 API key: ${NVIDIA_API_KEY.substring(0, 12)}...`);
  
  if (!NVIDIA_API_KEY || !NVIDIA_API_KEY.startsWith('nvapi-')) {
    throw new Error('NVIDIA API key not found or invalid');
  }

  const payload = JSON.stringify({ prompt: PROMPT, mode: 'base' });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'ai.api.nvidia.com',
      path: '/v1/genai/black-forest-labs/flux.1-dev',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: 60000,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`📡 HTTP ${res.statusCode}`);
        
        if (res.statusCode === 202) {
          const reqId = res.headers['nvcf-reqid'];
          console.log(`⏳ Queued in NVIDIA NVCF (${reqId}), polling...`);
          pollQueue(reqId).then(resolve).catch(reject);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`NVIDIA HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
          return;
        }
        
        try {
          const json = JSON.parse(data);
          const b64 = extractBase64(json);
          if (!b64) {
            reject(new Error('No base64 in response'));
            return;
          }
          resolve(Buffer.from(b64, 'base64'));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    req.write(payload);
    req.end();
  });
}

function extractBase64(data) {
  if (data.artifacts && data.artifacts.length > 0) {
    if (data.artifacts[0].finishReason === 'CONTENT_FILTERED') throw new Error('CONTENT_FILTERED');
    return data.artifacts[0].base64 || data.artifacts[0].b64_json;
  }
  if (data.data && data.data.length > 0) {
    return data.data[0].b64_json || data.data[0].base64 || data.data[0].image;
  }
  return data.image || data.b64_json || null;
}

async function pollQueue(reqId, attempts = 0) {
  if (attempts >= 20) throw new Error(`Timeout polling NVCF queue for ${reqId}`);
  
  await new Promise(r => setTimeout(r, 3000));
  
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.nvcf.nvidia.com',
      path: `/v2/nvcf/pexec/status/${reqId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Accept': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            const b64 = extractBase64(json);
            if (!b64) { reject(new Error('No base64 in poll response')); return; }
            resolve(Buffer.from(b64, 'base64'));
          } catch (e) { reject(e); }
        } else if (res.statusCode === 202) {
          console.log(`   ⏳ Still processing... (attempt ${attempts + 1})`);
          pollQueue(reqId, attempts + 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`NVCF poll HTTP ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    const rawBuffer = await callNvidiaFlux();
    console.log(`✅ Received ${rawBuffer.length} bytes from NVIDIA`);

    // Use sharp to resize and convert to WebP
    const sharp = require('sharp');
    
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    await sharp(rawBuffer)
      .resize(1200, 675, { fit: 'cover', position: 'attention' })
      .webp({ quality: 86, effort: 6 })
      .toFile(OUTPUT_PATH);

    const fileSize = fs.statSync(OUTPUT_PATH).size;
    console.log(`\n📸 Cover saved: ${OUTPUT_PATH}`);
    console.log(`   Size: ${fileSize} bytes (${(fileSize / 1024).toFixed(1)} KB)`);
    console.log(`\n🎉 Done! Cover image ready for deployment.`);
  } catch (err) {
    console.error(`\n❌ Failed:`, err.message);
    process.exit(1);
  }
}

main();
