const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const apiKey = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY;
console.log('Testing NVIDIA API with key:', apiKey ? apiKey.substring(0, 12) + '...' : 'NONE');

async function testFlux() {
  console.log('Testing FLUX.1-dev...');
  try {
    const res = await axios.post(
      'https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev',
      { prompt: 'a ceramic coffee cup on wooden table, soft morning light', mode: 'base' },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
        validateStatus: () => true,
      }
    );
    console.log('FLUX Response status:', res.status, res.headers);
    if (res.data) {
      console.log('FLUX Response data keys:', Object.keys(res.data));
    }
  } catch (err) {
    console.log('FLUX Error:', err.message, err.code);
  }
}

async function testSD35() {
  console.log('\nTesting SD 3.5 Large...');
  try {
    const res = await axios.post(
      'https://ai.api.nvidia.com/v1/genai/stabilityai/stable-diffusion-3.5-large',
      {
        prompt: 'a ceramic coffee cup on wooden table, soft morning light',
        negative_prompt: 'blurry, ugly',
        aspect_ratio: '16:9',
        mode: 'text-to-image',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 30000,
        validateStatus: () => true,
      }
    );
    console.log('SD 3.5 Response status:', res.status, res.headers);
    if (res.data) {
      console.log('SD 3.5 Response data keys:', Object.keys(res.data));
    }
  } catch (err) {
    console.log('SD 3.5 Error:', err.message, err.code);
  }
}

(async () => {
  await testFlux();
  await testSD35();
})();
