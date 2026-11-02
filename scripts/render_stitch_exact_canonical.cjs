const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = path.resolve(__dirname, 'promoradar_stitch_canonical_overlay.html');

const VARIANTS = [
  {
    name: '1. Dark Obsidian & Cyber Indigo',
    rawPath: '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png',
    outPath: '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_hostinger.png'
  },
  {
    name: '2. Electric Cyan & Ice Blue',
    rawPath: '/var/www/affiliate/scratch/stitch_pin_variants/stitch_theme_3c38d2e7b2244ed9bf9c3395b8713a4c.png',
    outPath: '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_cyan.png'
  },
  {
    name: '3. Crimson & Coral Sunset',
    rawPath: '/var/www/affiliate/scratch/stitch_pin_variants/stitch_theme_d03551f52bcf4cae9bc441e7ad69ef06.png',
    outPath: '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_crimson.png'
  },
  {
    name: '4. Emerald Mint & Electric Jade',
    rawPath: '/var/www/affiliate/scratch/stitch_pin_variants/stitch_theme_360446acf4b34a6294a79b15407bfd88.png',
    outPath: '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_emerald.png'
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

  const base64List = [];

  for (const v of VARIANTS) {
    console.log(`Processing: ${v.name}...`);
    const imgBase64 = fs.readFileSync(v.rawPath).toString('base64');
    const filledHtml = rawHtml.replace('{{STITCH_RAW_IMAGE}}', `data:image/png;base64,${imgBase64}`);

    await page.setContent(filledHtml, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    await page.screenshot({ path: v.outPath, type: 'png' });
    console.log(`Saved: ${v.outPath}`);
    base64List.push(fs.readFileSync(v.outPath).toString('base64'));
  }

  // Render side-by-side showcase
  console.log('Rendering side-by-side showcase of 100% original Stitch art with canonical logo...');
  const showcasePage = await browser.newPage({
    viewport: { width: 3350, height: 1350 },
    deviceScaleFactor: 1
  });

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
    <h1>100% Оригинальный внешний вид Google Stitch + Канонический логотип PromoRadar</h1>
    <p class="sub">Вся оригинальная графика Stitch сохранена без малейших изменений. Заменен только логотип и бренд на канонические (76x76px, Header.astro).</p>
    <div class="grid">
      <div class="card">
        <img src="data:image/png;base64,${base64List[0]}" />
        <div class="title">1. Dark Obsidian &amp; Cyber Indigo</div>
        <div class="desc">Оригинальный арт Stitch + Логотип PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${base64List[1]}" />
        <div class="title">2. Electric Cyan &amp; Ice Blue</div>
        <div class="desc">Оригинальный арт Stitch + Логотип PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${base64List[2]}" />
        <div class="title">3. Crimson &amp; Coral Sunset</div>
        <div class="desc">Оригинальный арт Stitch + Логотип PromoRadar</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${base64List[3]}" />
        <div class="title">4. Emerald Mint &amp; Electric Jade</div>
        <div class="desc">Оригинальный арт Stitch + Логотип PromoRadar</div>
      </div>
    </div>
  </body></html>`;

  await showcasePage.setContent(showcaseHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/stitch_original_canonical_showcase.png';
  await showcasePage.screenshot({ path: showcasePath, fullPage: true });
  console.log('Showcase saved to:', showcasePath);

  await browser.close();
}

main().catch(console.error);

