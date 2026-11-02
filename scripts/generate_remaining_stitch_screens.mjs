import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as sdk from '@google/stitch-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PARTNERS = [
  {
    store: 'Whokeys',
    slug: 'whokeys',
    headline: '88% OFF WIN 11 + OFFICE',
    subhead: 'Official Genuine Software Licenses • Lifetime Global Activation Guarantee',
    code: 'WHO88'
  },
  {
    store: 'Abelssoft',
    slug: 'abelssoft',
    headline: '50% OFF LIFETIME SHIELD',
    subhead: 'Award-Winning Windows PC Privacy Shields & Deep Registry System Cleaners',
    code: 'ABELSSOFT50'
  },
  {
    store: 'Qustodio',
    slug: 'qustodio',
    headline: '20% OFF FAMILY SHIELD',
    subhead: 'Real-time Web Filtering, Screen Control & Instant Family Location Alerts',
    code: 'FAMILY20'
  },
  {
    store: 'OnlineSIM',
    slug: 'onlinesim',
    headline: '15% EXTRA CREDITS',
    subhead: 'Disposable Virtual Phone Numbers for WhatsApp & Google Across 90+ Countries',
    code: 'SIMSECURE15'
  },
  {
    store: 'Black Friday 2026',
    slug: 'black-friday',
    headline: 'UP TO 85% OFF DEALS',
    subhead: 'Early Access Exclusive Software, Cloud & Hosting Checkout Promo Codes',
    code: 'BF2026'
  },
  {
    store: 'Glasseslit',
    slug: 'glasseslit',
    headline: 'BUY 1 GET 1 + 20% OFF',
    subhead: 'Designer Prescription Glasses, Blue Light Blocking & Polarized Sunglasses',
    code: 'HCF20'
  },
  {
    store: 'NordVPN',
    slug: 'nordvpn',
    headline: '73% OFF + 3 MO FREE',
    subhead: 'Next-Gen Threat Protection Pro, Meshnet & Ultra-Fast Global VPN Servers',
    code: 'NORDDEAL'
  }
];

function buildStitchPinPrompt(p) {
  return `A premium high-converting Pinterest Pin graphic (1000x1500 px, 2:3 vertical aspect ratio) for PromoRadar coupon radar portal. Top header: PromoRadar logo icon with radar waves and clean typography, subtitle 'VERIFIED VOUCHER RADAR • OCTOBER 2026'. Main hero focal point: An ultra sleek digital voucher ticket card with perforated circular ticket notches on the edges and delicate dashed lines. Inside ticket card: ${p.store} logo / brand typography, vibrant bold headline '${p.headline}', subhead '${p.subhead}'. Voucher code display box styled like a physical perforated digital coupon with code '${p.code}' in bold monospace cyber indigo typography, with a 'COPY & ACTIVATE' button badge. Trust elements: '100% QA VERIFIED AT CHECKOUT' badge in neon emerald green with a checkmark shield, '0% Dead-Link Guarantee', '4.9 ★ Top Verified Pick'. Background: Deep midnight dark navy #0B0F19 canvas with subtle cyber grid and soft elegant glowing gradients in cyber indigo (#4F46E5) and vibrant rose/coral (#F43F5E). Bottom CTA bar: 'Save Big on ${p.store} at promoradar.store' with an arrow icon. Ultra sharp, professional product ad design, clean typography, conversion-focused Pinterest creative.`;
}

async function main() {
  const client = new sdk.StitchToolClient({ apiKey: process.env.STITCH_API_KEY });
  console.log('Connecting to Stitch Tool Client...');
  await client.connect();

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < PARTNERS.length; i++) {
    const p = PARTNERS[i];
    console.log(`\n[${i+4}/10] Generating raw Stitch screen for ${p.store}...`);
    const prompt = buildStitchPinPrompt(p);

    try {
      const res = await client.callTool('generate_screen_from_text', {
        projectId: '1424553323989134013',
        prompt: prompt,
        deviceType: 'MOBILE'
      });

      const screens = res.outputComponents?.[0]?.design?.screens || [];
      const fileId = screens[0]?.screenshot?.name;
      console.log(`  Screen created. FileId: ${fileId}`);

      if (fileId) {
        const fileRes = await client.callTool('download_file', { name: fileId });
        let buf;
        if (Buffer.isBuffer(fileRes.image)) buf = fileRes.image;
        else if (typeof fileRes.image === 'string') buf = Buffer.from(fileRes.image, 'base64');

        if (buf) {
          const outPath = path.join(outDir, `stitch_raw_${p.slug}.png`);
          fs.writeFileSync(outPath, buf);
          console.log(`  Saved ${buf.length} bytes to ${outPath} ✅`);
        }
      }
    } catch (err) {
      console.log(`  Stitch generation error for ${p.store}: ${err.message}`);
    }
  }

  await client.close();
}

main().catch(console.error);

