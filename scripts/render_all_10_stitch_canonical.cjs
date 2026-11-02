const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = path.resolve(__dirname, 'promoradar_stitch_canonical_overlay.html');

const ALL_10_STITCH_RAW = [
  { store: 'Hostinger', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png', label: '75% OFF + FREE DOMAIN' },
  { store: 'ExpressVPN', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_expressvpn.png', label: '49% OFF + 3 MO FREE' },
  { store: 'ALLPOWERS', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_pin_allpowers.png', label: 'EXTRA 12% OFF SITEWIDE' },
  { store: 'Whokeys', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_whokeys.png', label: '88% OFF WIN 11 + OFFICE' },
  { store: 'Abelssoft', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_abelssoft.png', label: '50% OFF LIFETIME SHIELD' },
  { store: 'Qustodio', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_qustodio.png', label: '20% OFF FAMILY SHIELD' },
  { store: 'OnlineSIM', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_onlinesim.png', label: '15% EXTRA CREDITS' },
  { store: 'Black Friday 2026', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_black-friday.png', label: 'UP TO 85% OFF DEALS' },
  { store: 'Glasseslit', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_glasseslit.png', label: 'BUY 1 GET 1 + 20% OFF' },
  { store: 'NordVPN', file: '/var/www/affiliate/scratch/pins_promoradar/stitch_raw_10/stitch_raw_nordvpn.png', label: '73% OFF + 3 MO FREE' }
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

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/stitch_10_canonical_final';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const processedList = [];

  for (let i = 0; i < ALL_10_STITCH_RAW.length; i++) {
    const item = ALL_10_STITCH_RAW[i];
    console.log(`[${i+1}/10] Overlaying canonical logo on raw Stitch art for ${item.store}...`);

    const imgBase64 = fs.readFileSync(item.file).toString('base64');
    const filledHtml = rawHtml.replace('{{STITCH_RAW_IMAGE}}', `data:image/png;base64,${imgBase64}`);

    await page.setContent(filledHtml, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const outPath = path.join(outDir, `canonical_stitch_${i+1}_${item.store.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  Saved: ${outPath} ✅`);

    processedList.push({
      ...item,
      path: outPath,
      b64: fs.readFileSync(outPath).toString('base64')
    });
  }

  // 10-Pin Grid Showcase Image (2 rows of 5)
  console.log('Rendering 10-Pin Showcase Image...');
  const gridPage = await browser.newPage({
    viewport: { width: 3350, height: 2150 },
    deviceScaleFactor: 1
  });

  const cardsHtml = processedList.map((p, idx) => `
    <div style="background:#0F172A;border-radius:24px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.12);text-align:center;">
      <img src="data:image/png;base64,${p.b64}" style="width:580px;height:870px;border-radius:18px;display:block;" />
      <div style="font-size:20px;font-weight:900;margin-top:14px;color:#FFF;">${idx+1}. ${p.store}</div>
      <div style="font-size:15px;color:#38BDF8;font-weight:700;margin-top:4px;">${p.label}</div>
    </div>
  `).join('');

  const gridHtml = `<!DOCTYPE html><html><head><style>
    body { margin:0; background:#06080F; padding:40px 30px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#FFF; }
    h1 { text-align:center; font-size:38px; margin-bottom:10px; font-weight:900; letter-spacing:0.5px; }
    p.sub { text-align:center; font-size:18px; color:#94A3B8; margin-bottom:35px; }
    .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:26px; justify-content:center; }
  </style></head><body>
    <h1>10 Боевых Пинов: 100% Оригинальный Арт Google Stitch + Канонический Логотип PromoRadar</h1>
    <p class="sub">Каждый пин индивидуально сгенерирован в Google Stitch под своего партнера. Верхний бренд-блок идентичен сайту PromoRadar (Header.astro).</p>
    <div class="grid">
      ${cardsHtml}
    </div>
  </body></html>`;

  await gridPage.setContent(gridHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/stitch_10_canonical_showcase.png';
  await gridPage.screenshot({ path: showcasePath, fullPage: true });
  console.log(`📸 Saved final 10-pin showcase to: ${showcasePath}`);

  await browser.close();
}

main().catch(console.error);

