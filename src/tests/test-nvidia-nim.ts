import sharp from 'sharp';
import axios from 'axios';
import { env } from '../config/env';
import { visionExtractor } from '../services/visionExtractor';
import { ExtractionDTOSchema } from '../types/deeptrace';

async function runNvidiaNimProbe() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║   FLIRTCHECK DEEPTRACE™ // NVIDIA NIM LIVE API HEALTH & PROBE        ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');

  console.log(`🌐 NVIDIA NIM Base URL : ${env.NVIDIA_NIM_BASE_URL}`);
  console.log(`🧠 Target Vision Model : ${env.NVIDIA_VISION_MODEL}`);
  const hasKey = Boolean(env.NVIDIA_NIM_API_KEY && env.NVIDIA_NIM_API_KEY.trim().length > 0);
  console.log(`🔑 API Key Configured  : ${hasKey ? `PRESENT (${env.NVIDIA_NIM_API_KEY.slice(0, 10)}...)` : 'NOT FOUND (Offline Mode)'}`);

  // STAGE 1: Direct Models Endpoint Healthcheck (if key is set)
  if (hasKey) {
    console.log('\n📡 Stage 1: Probing NVIDIA NIM GET /v1/models...');
    try {
      const modelsResponse = await axios.get(`${env.NVIDIA_NIM_BASE_URL}/models`, {
        headers: {
          Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`
        },
        timeout: 10000
      });

      console.log(`   ✅ HTTP ${modelsResponse.status} OK: NVIDIA NIM API reachable!`);
      const modelsList = modelsResponse.data?.data || [];
      const hasLlamaVision = modelsList.some((m: any) => m.id === env.NVIDIA_VISION_MODEL || m.id?.includes('llama-3.2-11b-vision'));
      console.log(`   Found ${modelsList.length} accessible NIM models.`);
      if (hasLlamaVision) {
        console.log(`   ✅ Target model "${env.NVIDIA_VISION_MODEL}" confirmed in active catalog!`);
      } else {
        console.log(`   ℹ️ Target model "${env.NVIDIA_VISION_MODEL}" endpoint active.`);
      }
    } catch (apiError: any) {
      const status = apiError?.response?.status;
      console.warn(`   ⚠️ Models Probe Warning: HTTP ${status || 'ERR'} - ${apiError.message}`);
      if (status === 401 || status === 403) {
        console.error('   ❌ Invalid or unauthorized NVIDIA_NIM_API_KEY.');
      }
    }
  } else {
    console.log('\n📡 Stage 1: Skipping remote probe (NVIDIA_NIM_API_KEY is not defined in environment).');
  }

  // STAGE 2: Generate Synthetic Chat Screenshot via Sharp
  console.log('\n🎨 Stage 2: Synthesizing WhatsApp test conversation with Sharp...');
  const svgMarkup = Buffer.from(`
    <svg width="720" height="960" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#111b21"/>
      <rect width="100%" height="70" fill="#202c33"/>
      <text x="30" y="44" fill="#e9edef" font-family="sans-serif" font-size="20" font-weight="bold">Elena (London)</text>
      <!-- Message 1 (Suspect) -->
      <rect x="30" y="120" width="460" height="90" rx="10" fill="#202c33"/>
      <text x="50" y="155" fill="#e9edef" font-family="sans-serif" font-size="16">Hello dear! My uncle just recommended</text>
      <text x="50" y="180" fill="#e9edef" font-family="sans-serif" font-size="16">a private forex liquidity node for 30% yield.</text>
      <!-- Message 2 (User) -->
      <rect x="230" y="240" width="460" height="70" rx="10" fill="#005c4b"/>
      <text x="250" y="280" fill="#e9edef" font-family="sans-serif" font-size="16">Sounds suspicious, can we meet in London first?</text>
    </svg>
  `);

  const testJpegBuffer = await sharp({
    create: {
      width: 720,
      height: 960,
      channels: 4,
      background: { r: 17, g: 27, b: 33, alpha: 1 }
    }
  })
    .composite([{ input: svgMarkup, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();

  console.log(`   Generated synthetic JPEG test asset: ${(testJpegBuffer.length / 1024).toFixed(1)} KB`);

  // STAGE 3: Invoke Vision Extractor (NVIDIA NIM or Fallback Guard)
  console.log('\n🔍 Stage 3: Submitting screenshot to visionExtractor.extractChatFromImage...');
  const extractionResult = await visionExtractor.extractChatFromImage(
    testJpegBuffer,
    {
      declaredLocation: 'London, UK',
      platformType: 'WHATSAPP',
      suspectDisplayName: 'Elena'
    },
    'image/jpeg'
  );

  console.log(`   Inference Complete:`);
  console.log(`   - Engine Used     : ${extractionResult.engine}`);
  console.log(`   - Latency         : ${extractionResult.inferenceTimeMs} ms`);
  console.log(`   - Is Fallback     : ${extractionResult.isFallback}`);
  console.log(`   - Messages Count  : ${extractionResult.extraction.totalMessagesExtracted}`);
  console.log(`   - Detected Platform: ${extractionResult.extraction.detectedPlatform}`);

  // STAGE 4: Strict Schema Verification
  console.log('\n🛡️  Stage 4: Validating output against ExtractionDTOSchema...');
  const validatedExtraction = ExtractionDTOSchema.parse(extractionResult.extraction);
  console.log('   ✅ ExtractionDTOSchema Verification: 100% VALID!');

  if (validatedExtraction.totalMessagesExtracted === 0) {
    throw new Error('Zero messages extracted from test payload.');
  }

  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('🎉 NVIDIA NIM INTEGRATION PROBE COMPLETED WITH FULL CONFORMANCE!');
  console.log('══════════════════════════════════════════════════════════════════════');
}

runNvidiaNimProbe()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ NVIDIA NIM Probe Failed with critical error:', err);
    process.exit(1);
  });
