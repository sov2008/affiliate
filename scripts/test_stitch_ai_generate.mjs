import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  console.log('Connecting client...');
  await client.connect();
  console.log('Client connected! Calling generate_screen_from_text via client.callTool...');

  const prompt = `A premium high-converting Pinterest Pin (1000x1500 px, 2:3 ratio) for PromoRadar coupon portal.
Offer: Hostinger Cloud Hosting 75% OFF + Free Domain.
Voucher code: HOSTING75.
Style: Modern precision design system with dark navy #0B0F19 canvas, cyber indigo and vibrant rose accents, voucher ticket card with dashed border, 100% verified badge, and bold call to action.`;

  try {
    const res = await client.callTool('generate_screen_from_text', {
      projectId: '1424553323989134013',
      prompt: prompt,
      deviceType: 'MOBILE'
    });
    console.log('generate_screen_from_text response:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('CallTool generate_screen_from_text error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

