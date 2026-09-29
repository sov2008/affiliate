import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const apiKey = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';
console.log('Testing NVIDIA FLUX with key:', apiKey.slice(0, 10) + '...');

async function test() {
  const prompt = 'Cinematic editorial photography, a stylish young woman in a cozy evening cafe holding a modern smartphone with a subtle glowing screen, smiling thoughtfully at a text message, warm ambient string lights in the blurred background, 35mm film aesthetic, rich tones, shallow depth of field, Vogue lifestyle editorial, 16:9 aspect ratio';
  
  const startTime = Date.now();
  console.log('Sending request to NVIDIA FLUX.1-dev...');
  
  const res = await axios.post(
    'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev',
    { prompt, mode: 'base' },
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

  console.log('Status:', res.status, 'Time:', Date.now() - startTime, 'ms');
  if (res.status === 200) {
    console.log('Got direct 200 response!');
    const b64 = res.data?.artifacts?.[0]?.base64 || res.data?.data?.[0]?.b64_json || res.data?.image;
    console.log('Base64 length:', b64?.length);
  } else if (res.status === 202) {
    console.log('Got 202 queue, nvcf-reqid:', res.headers['nvcf-reqid']);
  } else {
    console.log('Error:', res.data);
  }
}

test();
