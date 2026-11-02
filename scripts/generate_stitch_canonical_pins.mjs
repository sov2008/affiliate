import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TARGET_OFFERS = [
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    headline: '49% OFF + 3 MO FREE',
    subhead: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway',
    code: 'EXPRESS49',
    category: 'VPN & Cyber Privacy Promo Codes',
    targetFile: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_expressvpn.png'
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    headline: 'EXTRA 12% OFF SITEWIDE',
    subhead: 'Save on Portable Solar Generators & Home Battery Stations • Fast Charging',
    code: 'EXTRA12',
    category: 'Electronics & Power Station Discounts',
    targetFile: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_allpowers.png'
  },
  {
    store: 'Whokeys',
    slug: 'whokeys',
    headline: '88% OFF WIN 11 + OFFICE',
    subhead: 'Official Genuine Software Licenses • Lifetime Global Activation Guarantee',
    code: 'WHO88',
    category: 'Web Hosting & Software Licenses',
    targetFile: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_whokeys.png'
  }
];

function buildStitchPrompt(offer) {
  return `A premium high-converting Pinterest Pin graphic (1000x1500 px, 2:3 vertical aspect ratio) for PromoRadar coupon radar portal. Top header: PromoRadar logo icon with radar waves and clean typography, subtitle 'VERIFIED VOUCHER RADAR • OCTOBER 2026'. Main hero focal point: An ultra sleek digital voucher ticket card with perforated circular ticket notches on the edges and delicate dashed lines. Inside ticket card: ${offer.store} logo / brand typography, vibrant bold headline '${offer.headline}', subhead '${offer.subhead}'. Voucher code display box styled like a physical perforated digital coupon with code '${offer.code}' in bold monospace cyber indigo typography, with a 'COPY & ACTIVATE' button badge. Trust elements: '100% QA VERIFIED AT CHECKOUT' badge in neon emerald green with a checkmark shield, '0% Dead-Link Guarantee', '4.9 ★ Top Verified Pick'. Background: Deep midnight dark navy #0B0F19 canvas with subtle cyber grid and soft elegant glowing gradients in cyber indigo (#4F46E5) and vibrant rose/coral (#F43F5E). Bottom CTA bar: 'Save Big on ${offer.store} at promoradar.store' with an arrow icon. Ultra sharp, professional product ad design, clean typography, conversion-focused Pinterest creative.`;
}

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  console.log('Connecting to Stitch Tool Client...');
  await client.connect();

  try {
    for (const offer of TARGET_OFFERS) {
      console.log(`\n--- Calling Stitch for ${offer.store} ---`);
      const prompt = buildStitchPrompt(offer);

      const res = await client.callTool('generate_screen_from_text', {
        projectId: '1424553323989134013',
        prompt: prompt,
        deviceType: 'MOBILE'
      });

      const screens = res.outputComponents?.[0]?.design?.screens || [];
      const screen = screens[0];
      const fileId = screen?.screenshot?.name;
      console.log(`Screen name: ${screen?.name}, screenshot file: ${fileId}`);

      if (fileId) {
        console.log(`Downloading file ${fileId}...`);
        const fileRes = await client.callTool('download_file', { name: fileId });
        let buf;
        if (Buffer.isBuffer(fileRes.image)) {
          buf = fileRes.image;
        } else if (typeof fileRes.image === 'string') {
          buf = Buffer.from(fileRes.image, 'base64');
        }

        if (buf) {
          fs.writeFileSync(offer.targetFile, buf);
          console.log(`✅ Saved ${offer.store} pin (${buf.length} bytes) to ${offer.targetFile}`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
