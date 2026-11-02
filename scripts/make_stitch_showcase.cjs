const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const v1 = fs.readFileSync(path.resolve(__dirname, '../scratch/stitch_pin_variants/stitch_theme_8c0ff40a5aa44d7588312509554575ee.png')).toString('base64');
  const v2 = fs.readFileSync(path.resolve(__dirname, '../scratch/stitch_pin_variants/stitch_theme_3c38d2e7b2244ed9bf9c3395b8713a4c.png')).toString('base64');
  const v3 = fs.readFileSync(path.resolve(__dirname, '../scratch/stitch_pin_variants/stitch_theme_d03551f52bcf4cae9bc441e7ad69ef06.png')).toString('base64');
  const v4 = fs.readFileSync(path.resolve(__dirname, '../scratch/stitch_pin_variants/stitch_theme_360446acf4b34a6294a79b15407bfd88.png')).toString('base64');

  const html = `<!DOCTYPE html><html><head><style>
    body { margin:0; background:#07090E; padding:50px 40px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#FFF; }
    h1 { text-align:center; font-size:32px; margin-bottom:40px; letter-spacing:1px; color:#E2E8F0; }
    .grid { display:flex; justify-content:center; gap:36px; }
    .card { background:#0F172A; border-radius:28px; padding:20px; border:1px solid rgba(255,255,255,0.12); box-shadow:0 25px 60px rgba(0,0,0,0.8); text-align:center; }
    .card img { width:560px; height:840px; border-radius:20px; display:block; object-fit:cover; }
    .title { font-size:20px; font-weight:800; margin-top:18px; color:#38BDF8; }
    .desc { font-size:14px; color:#94A3B8; margin-top:6px; max-width:560px; }
  </style></head><body>
    <h1>Google Stitch AI: 4 ключевых дизайн-варианта шаблона пина PromoRadar</h1>
    <div class="grid">
      <div class="card">
        <img src="data:image/png;base64,${v1}" />
        <div class="title">1. Dark Obsidian &amp; Cyber Indigo (Базовый)</div>
        <div class="desc">Глубокий ночной фон, двойной индиго-розовый градиент карточки, неоновые бейджи.</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${v2}" />
        <div class="title">2. Electric Cyan &amp; Ice Blue</div>
        <div class="desc">Холодный неоновый лед, светящиеся бирюзовые контуры ваучера, акцентная кнопка.</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${v3}" />
        <div class="title">3. Crimson &amp; Coral Sunset</div>
        <div class="desc">Пламенный багрово-коралловый градиент, высокая срочность скидки, дерзкий контраст.</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${v4}" />
        <div class="title">4. Emerald Mint &amp; Electric Jade</div>
        <div class="desc">Изумрудный траст-стиль fintech, повышенное доверие к верификации чекаута.</div>
      </div>
    </div>
  </body></html>`;

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 2600, height: 1150 } });
  await page.setContent(html, { waitUntil: 'load' });
  const outPath = '/var/www/affiliate/scratch/stitch_pin_variants/stitch_all_variations_showcase.png';
  await page.screenshot({ path: outPath, fullPage: true });
  await browser.close();
  console.log('Showcase saved to:', outPath);
}

main().catch(console.error);

