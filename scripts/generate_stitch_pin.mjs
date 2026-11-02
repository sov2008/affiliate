import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { stitch } from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const projectId = '1424553323989134013';
  const project = stitch.project(projectId);

  console.log('Testing stitch generate_screen_from_text for Pinterest Pin...');
  
  const prompt = `A high-converting Pinterest Pin (1000x1500 px, 2:3 vertical aspect ratio) for PromoRadar discount portal.
Brand: Hostinger.
Offer: 75% OFF Cloud Hosting + Free Domain Name.
Promo code voucher: HOSTING75.
Style: Dark luxury tech, deep navy #0B0F19 background, neon electric cyan and violet accents, scissors perforation line around code box, verified green badge, bold direct response typography, clear call to action to visit promoradar.store.`;

  try {
    const newScreen = await project.generateScreen({
      prompt: prompt,
      deviceType: 'MOBILE'
    });
    console.log('Generated screen:', newScreen);
  } catch (err) {
    console.error('generateScreen error:', err);
  }
}

main().catch(console.error);

