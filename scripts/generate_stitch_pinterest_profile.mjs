import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  console.log('Connecting to Stitch Tool Client...');
  await client.connect();

  console.log('Tasking Google Stitch to design complete Pinterest Account Assets for PromoRadar...');

  // 1. Pinterest Profile Banner (Cover Header, 800x450 or 1600x900, 16:9)
  const bannerPrompt = `A premium Pinterest Profile Header Banner (1600x900 px, 16:9 wide aspect ratio) for PromoRadar coupon radar portal (promoradar.store).
Brand: PROMORADAR - Verified Voucher & Coupon Radar.
Visual concept: An ultra sleek command desk / radar control hub displaying real-time discount telemetry. In the center: bold glowing PROMORADAR typography with radar sweep rings and emerald verified ping. Left & right sides: floating holographic physical digital vouchers (Hostinger 75% OFF, ExpressVPN 49% OFF, ALLPOWERS Solar Stations) with perforated notches, dashed coupon lines and glowing cyan/rose borders.
Background: Midnight deep navy #0B0F19 canvas with subtle dark cyber grid and soft ambient indigo/rose glows.
Trust tags: '100% CHECKOUT VERIFIED', 'ZERO EXPIRED CODES', 'BLACK FRIDAY 2026 EARLY ACCESS'. Clean, razor-sharp, luxury tech aesthetic matching the precision voucher pin design.`;

  // 2. Pinterest Profile Avatar (Square 800x800, 1:1)
  const avatarPrompt = `A luxury Pinterest Profile Avatar / Logo Icon (800x800 px, 1:1 square icon) for PromoRadar.
Center: A glowing 3D hexagonal radar shield emblem with concentric cyber radar sweep rings, electric cyan core ping node (#00F2FE), and emerald target ping.
Surrounding: Fine metallic dark obsidian bevels with subtle indigo back-glow (#4F46E5).
Bottom text inside icon: PROMORADAR in ultra-clean bold geometric modern sans typography.
Background: Dark obsidian navy #0B0F19. High-impact app icon / favicon style, instantly recognizable at tiny avatar scale.`;

  try {
    console.log('\n--- 1. Generating Pinterest Banner in Stitch ---');
    const bannerRes = await client.callTool('generate_screen_from_text', {
      projectId: '1424553323989134013',
      prompt: bannerPrompt,
      deviceType: 'DESKTOP'
    });
    console.log('Banner generation response received.');

    console.log('\n--- 2. Generating Pinterest Avatar in Stitch ---');
    const avatarRes = await client.callTool('generate_screen_from_text', {
      projectId: '1424553323989134013',
      prompt: avatarPrompt,
      deviceType: 'MOBILE'
    });
    console.log('Avatar generation response received.');

    const outJson = path.resolve(__dirname, '../scratch/stitch_pinterest_assets.json');
    fs.writeFileSync(outJson, JSON.stringify({ bannerRes, avatarRes }, null, 2), 'utf8');
    console.log('Saved raw response to:', outJson);

  } catch (err) {
    console.error('Error in Stitch generation:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);

