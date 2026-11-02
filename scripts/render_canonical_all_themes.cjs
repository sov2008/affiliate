const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = path.resolve(__dirname, 'promoradar_pin_canonical_template.html');

const STITCH_THEMES = [
  {
    id: 'cyber_indigo',
    name: '1. Dark Obsidian & Cyber Indigo (Базовый)',
    vars: `
      --bg-canvas: #0B0F19;
      --grid-color: rgba(79, 70, 229, 0.06);
      --glow-left-color: rgba(79, 70, 229, 0.35);
      --glow-right-color: rgba(244, 63, 94, 0.25);
      --accent-pill-text: #818CF8;
      --card-glow: linear-gradient(135deg, rgba(79, 70, 229, 0.7), rgba(244, 63, 94, 0.6));
      --card-bg: rgba(15, 23, 42, 0.88);
      --card-border: rgba(255, 255, 255, 0.15);
      --headline-gradient: linear-gradient(135deg, #FEF08A 0%, #F59E0B 40%, #EF4444 100%);
      --code-border: rgba(99, 102, 241, 0.6);
      --code-color: #38BDF8;
      --btn-gradient: linear-gradient(135deg, #4F46E5 0%, #E11D48 100%);
      --cta-bg: linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(49, 46, 129, 0.95) 100%);
      --cta-border: rgba(99, 102, 241, 0.4);
    `,
    offer: {
      store: 'Hostinger',
      slug: 'hostinger',
      headline: '75% OFF + FREE DOMAIN',
      subhead: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed Architecture',
      code: 'HOSTING75'
    }
  },
  {
    id: 'electric_cyan',
    name: '2. Electric Cyan & Ice Blue (Неоновый лед)',
    vars: `
      --bg-canvas: #050B14;
      --grid-color: rgba(0, 242, 254, 0.08);
      --glow-left-color: rgba(0, 242, 254, 0.35);
      --glow-right-color: rgba(37, 99, 235, 0.35);
      --accent-pill-text: #38BDF8;
      --card-glow: linear-gradient(135deg, rgba(0, 242, 254, 0.8), rgba(37, 99, 235, 0.7));
      --card-bg: rgba(8, 20, 38, 0.9);
      --card-border: rgba(56, 189, 248, 0.4);
      --headline-gradient: linear-gradient(135deg, #E0F2FE 0%, #38BDF8 50%, #0284C7 100%);
      --code-border: rgba(56, 189, 248, 0.7);
      --code-color: #00F2FE;
      --btn-gradient: linear-gradient(135deg, #0284C7 0%, #2563EB 100%);
      --cta-bg: linear-gradient(135deg, rgba(8, 47, 73, 0.85) 0%, rgba(30, 58, 138, 0.95) 100%);
      --cta-border: rgba(56, 189, 248, 0.4);
    `,
    offer: {
      store: 'ExpressVPN',
      slug: 'expressvpn',
      headline: '49% OFF + 3 MO FREE',
      subhead: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway',
      code: 'EXPRESS49'
    }
  },
  {
    id: 'crimson_sunset',
    name: '3. Crimson & Coral Sunset (Пламенный закат)',
    vars: `
      --bg-canvas: #12070A;
      --grid-color: rgba(244, 63, 94, 0.08);
      --glow-left-color: rgba(225, 29, 72, 0.35);
      --glow-right-color: rgba(249, 115, 22, 0.3);
      --accent-pill-text: #FB7185;
      --card-glow: linear-gradient(135deg, rgba(225, 29, 72, 0.8), rgba(249, 115, 22, 0.7));
      --card-bg: rgba(30, 10, 18, 0.9);
      --card-border: rgba(244, 63, 94, 0.4);
      --headline-gradient: linear-gradient(135deg, #FFF1F2 0%, #FB7185 40%, #E11D48 100%);
      --code-border: rgba(244, 63, 94, 0.7);
      --code-color: #FDA4AF;
      --btn-gradient: linear-gradient(135deg, #E11D48 0%, #EA580C 100%);
      --cta-bg: linear-gradient(135deg, rgba(76, 5, 25, 0.85) 0%, rgba(124, 45, 18, 0.95) 100%);
      --cta-border: rgba(244, 63, 94, 0.4);
    `,
    offer: {
      store: 'Black Friday 2026',
      slug: 'black-friday',
      headline: 'UP TO 85% OFF DEALS',
      subhead: 'Early Access Exclusive Software & Hosting Promo Codes • Limited Time',
      code: 'BF2026'
    }
  },
  {
    id: 'emerald_mint',
    name: '4. Emerald Mint & Electric Jade (Изумрудный траст)',
    vars: `
      --bg-canvas: #06110D;
      --grid-color: rgba(16, 185, 129, 0.08);
      --glow-left-color: rgba(16, 185, 129, 0.35);
      --glow-right-color: rgba(20, 184, 166, 0.3);
      --accent-pill-text: #34D399;
      --card-glow: linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(20, 184, 166, 0.7));
      --card-bg: rgba(6, 30, 22, 0.9);
      --card-border: rgba(52, 211, 153, 0.4);
      --headline-gradient: linear-gradient(135deg, #ECFDF5 0%, #34D399 40%, #059669 100%);
      --code-border: rgba(52, 211, 153, 0.7);
      --code-color: #6EE7B7;
      --btn-gradient: linear-gradient(135deg, #059669 0%, #0D9488 100%);
      --cta-bg: linear-gradient(135deg, rgba(6, 44, 33, 0.85) 0%, rgba(19, 78, 74, 0.95) 100%);
      --cta-border: rgba(52, 211, 153, 0.4);
    `,
    offer: {
      store: 'ALLPOWERS',
      slug: 'allpowers',
      headline: 'EXTRA 12% OFF SITEWIDE',
      subhead: 'Save on Portable Solar Generators & Home Battery Stations • Fast Charging',
      code: 'EXTRA12'
    }
  }
];

async function main() {
  const rawHtml = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  const generatedFiles = [];

  for (const theme of STITCH_THEMES) {
    console.log(`Rendering theme: ${theme.name}...`);
    const filledHtml = rawHtml
      .replace('{{THEME_STYLE_VARS}}', theme.vars)
      .replace(/{{MERCHANT_NAME}}/g, theme.offer.store)
      .replace(/{{MERCHANT_SLUG}}/g, theme.offer.slug)
      .replace(/{{HEADLINE_DISCOUNT}}/g, theme.offer.headline)
      .replace(/{{HEADLINE_SUBHEAD}}/g, theme.offer.subhead)
      .replace(/{{COUPON_CODE}}/g, theme.offer.code);

    await page.setContent(filledHtml, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    const outPath = path.resolve(__dirname, `../scratch/pins_promoradar/canonical_${theme.id}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ Saved ${theme.id} to ${outPath}`);
    generatedFiles.push({ ...theme, path: outPath });
  }

  // Render Showcase (All 4 with 100% Identical Canonical Header side-by-side)
  console.log('Rendering 4-in-1 comparison showcase...');
  const showcasePage = await browser.newPage({
    viewport: { width: 3350, height: 1350 },
    deviceScaleFactor: 1
  });

  const f1 = fs.readFileSync(generatedFiles[0].path).toString('base64');
  const f2 = fs.readFileSync(generatedFiles[1].path).toString('base64');
  const f3 = fs.readFileSync(generatedFiles[2].path).toString('base64');
  const f4 = fs.readFileSync(generatedFiles[3].path).toString('base64');

  const showcaseHtml = `<!DOCTYPE html><html><head><style>
    body { margin:0; background:#07090E; padding:50px 40px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#FFF; }
    h1 { text-align:center; font-size:36px; margin-bottom:12px; font-weight:900; letter-spacing:0.5px; color:#F8FAFC; }
    p.sub { text-align:center; font-size:18px; color:#94A3B8; margin-bottom:45px; }
    .grid { display:flex; justify-content:center; gap:36px; }
    .card { background:#0F172A; border-radius:28px; padding:22px; border:1px solid rgba(255,255,255,0.12); box-shadow:0 25px 60px rgba(0,0,0,0.8); text-align:center; }
    .card img { width:700px; height:1050px; border-radius:20px; display:block; object-fit:cover; }
    .title { font-size:22px; font-weight:800; margin-top:20px; color:#FFFFFF; }
    .desc { font-size:15px; color:#38BDF8; font-weight:600; margin-top:6px; }
  </style></head><body>
    <h1>Канонизированный логотип PromoRadar на всех 4 шаблонах Google Stitch</h1>
    <p class="sub">100% повторяемость логотипа и леттеринга Header.astro (фирменный сквиркл 76x76px, одинаковый масштаб, координаты и шрифты во всех темах)</p>
    <div class="grid">
      <div class="card">
        <img src="data:image/png;base64,${f1}" />
        <div class="title">1. Cyber Indigo (Базовый)</div>
        <div class="desc">Идентичный верхний блок PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${f2}" />
        <div class="title">2. Electric Cyan (VPN / Софт)</div>
        <div class="desc">Идентичный верхний блок PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${f3}" />
        <div class="title">3. Crimson Sunset (Black Friday)</div>
        <div class="desc">Идентичный верхний блок PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${f4}" />
        <div class="title">4. Emerald Jade (Электроника)</div>
        <div class="desc">Идентичный верхний блок PromoRadar</div>
      </div>
    </div>
  </body></html>`;

  await showcasePage.setContent(showcaseHtml, { waitUntil: 'load' });
  const showcasePath = path.resolve(__dirname, '../scratch/pins_promoradar/canonical_all_4themes_showcase.png');
  await showcasePage.screenshot({ path: showcasePath, fullPage: true });
  console.log(`📸 Saved final showcase to: ${showcasePath}`);

  await browser.close();
}

main().catch(console.error);

