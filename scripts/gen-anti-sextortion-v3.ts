import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const apiKey = process.env.NVIDIA_FLUX_DEV_API_KEY || process.env.NVIDIA_API_KEY || '';

const prompt = 'Dramatic cinematic 35mm film photograph, high-end editorial portrait of a handsome young man in a dark modern apartment at night, sitting on a leather armchair holding a sleek smartphone, looking at the screen with intense concern and serious expression, ambient warm light from a table lamp, city skyline bokeh through large window, authentic film grain, Vogue GQ editorial documentary style, 16:9 aspect ratio, 8k resolution, photorealistic';

async function generate() {
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

  if (res.status !== 200) {
    throw new Error(`NVIDIA status: ${res.status} ${JSON.stringify(res.data)}`);
  }

  const b64 = res.data?.artifacts?.[0]?.base64 || res.data?.data?.[0]?.b64_json || res.data?.image;
  if (!b64) throw new Error('No base64 returned');

  const buffer = Buffer.from(b64, 'base64');
  const targetWebp = path.resolve(process.cwd(), 'blog/public/images/posts/what-to-do-if-dating-match-blackmails-you-anti-sextortion-protocol-v3.webp');
  
  await sharp(buffer)
    .resize(1200, 675, { fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(targetWebp);

  console.log('Successfully saved to:', targetWebp, 'Size:', fs.statSync(targetWebp).size);
}

generate().catch(console.error);
