const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Load original Stitch Hostinger image base64
const stitchHostingerPath = '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png';
const stitchHostingerBase64 = fs.readFileSync(stitchHostingerPath).toString('base64');

const PARTNERS = [
  {
    store: 'Hostinger',
    slug: 'hostinger',
    logoSvg: `
      <svg class="merchant-logo-svg" viewBox="0 0 160 36" fill="currentColor">
        <path d="M12 6h8v24h-8zm16 0h8v9.6h12V6h8v24h-8V21.6H36V30h-8zM66 14.4c0-4.8 3.6-8.4 8.4-8.4s8.4 3.6 8.4 8.4v15.6h-7.2V15c0-1.8-1.2-3-2.8-3s-2.8 1.2-2.8 3v15H62.8V14.4zm24 0c0-4.8 3.6-8.4 8.4-8.4s8.4 3.6 8.4 8.4v15.6h-7.2V15c0-1.8-1.2-3-2.8-3s-2.8 1.2-2.8 3v15H90V14.4z"/>
      </svg>
    `,
    headline: '75% OFF',
    headlineSecond: '+ FREE DOMAIN',
    subhead: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed',
    code: 'HOSTING75',
    ctaText: 'Save Big on Hostinger at promoradar.store →'
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    logoSvg: `
      <div style="display:flex;align-items:center;gap:12px;">
        <svg style="width:36px;height:36px;color:#E11D48;" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        <span style="font-size:34px;font-weight:900;letter-spacing:1px;color:#FFFFFF;">ExpressVPN</span>
      </div>
    `,
    headline: '49% OFF',
    headlineSecond: '+ 3 MO FREE',
    subhead: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway',
    code: 'EXPRESS49',
    ctaText: 'Save Big on ExpressVPN at promoradar.store →'
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    logoSvg: `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:38px;font-weight:900;letter-spacing:3px;color:#FFFFFF;">⚡ ALLPOWERS</span>
      </div>
    `,
    headline: 'EXTRA 12%',
    headlineSecond: 'OFF SITEWIDE',
    subhead: 'Save on Portable Solar Generators & Home Battery Stations • Fast Charging',
    code: 'EXTRA12',
    ctaText: 'Save Big on ALLPOWERS at promoradar.store →'
  }
];

function buildHtml(item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1000px;
      height: 1500px;
      position: relative;
      overflow: hidden;
      background: #0B0F19;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
    }

    /* 100% НЕИЗМЕННЫЙ ОРИГИНАЛЬНЫЙ АРТ STITCH */
    .stitch-original-art {
      position: absolute;
      inset: 0;
      width: 1000px;
      height: 1500px;
      object-fit: cover;
      z-index: 1;
    }

    /* 1. ПЕРЕКРЫТИЕ ВЕРХНЕГО ЛОГОТИПА НА КАНОНИЧЕСКИЙ ЛОГОТИП САЙТА (Header.astro) */
    .top-canonical-header-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 1000px;
      height: 290px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 60px;
      background: radial-gradient(ellipse 700px 180px at 50% 30%, #07090F 85%, rgba(7,9,15,0.95) 92%, transparent 100%);
    }
    .brand-cluster {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 22px;
    }
    .canonical-logo-badge {
      width: 82px;
      height: 82px;
      border-radius: 24px;
      background: linear-gradient(135deg, #4F46E5 0%, #4338CA 50%, #E11D48 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 14px 32px -4px rgba(79, 70, 229, 0.6), 0 0 0 1.5px rgba(255, 255, 255, 0.22);
      flex-shrink: 0;
    }
    .canonical-logo-badge svg {
      width: 46px;
      height: 46px;
      color: #FFFFFF;
    }
    .brand-meta {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .brand-title {
      font-size: 54px;
      font-weight: 900;
      letter-spacing: -1.5px;
      color: #FFFFFF;
      line-height: 1;
    }
    .brand-subtitle {
      font-size: 16px;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.5px;
      margin-top: 6px;
    }
    .status-pill {
      margin-top: 18px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 24px;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #818CF8;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .status-pill .ping {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 12px #10B981;
    }

    /* 2. ЕСЛИ ЭТО ДРУГОЙ ПАРТНЕР — СУРГУЧНАЯ ЗАМЕНА ВНУТРЕННОСТЕЙ ТИКЕТА БЕЗ ПОВРЕЖДЕНИЯ СТИЛЯ STITCH */
    ${item.store !== 'Hostinger' ? `
    .ticket-content-overlay {
      position: absolute;
      top: 360px;
      left: 145px;
      width: 710px;
      height: 480px;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: radial-gradient(ellipse 650px 420px at 50% 50%, #0F1424 70%, rgba(15, 20, 36, 0.95) 90%, transparent 100%);
    }
    .code-text-overlay {
      position: absolute;
      top: 980px;
      left: 145px;
      width: 440px;
      height: 90px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #080C18;
      font-family: 'JetBrains Mono', monospace;
      font-size: 46px;
      font-weight: 800;
      color: #38BDF8;
      letter-spacing: 4px;
    }
    .bottom-cta-text-overlay {
      position: absolute;
      top: 1418px;
      left: 60px;
      width: 820px;
      height: 40px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0B1124;
      font-size: 21px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
    }
    ` : ''}

    .merchant-logo-slot {
      margin-bottom: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .headline-main {
      font-size: 82px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -2px;
      background: linear-gradient(135deg, #FEF08A 0%, #F59E0B 45%, #EF4444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .headline-second {
      font-size: 64px;
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -1.5px;
      background: linear-gradient(135deg, #FDE047 0%, #FB7185 50%, #E11D48 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 22px;
    }
    .subhead-desc {
      font-size: 22px;
      font-weight: 600;
      color: #CBD5E1;
      line-height: 1.45;
      max-width: 650px;
    }
  </style>
</head>
<body>
  <!-- ОРИГИНАЛЬНАЯ ПОДЛОЖКА STITCH СО ВСЕМИ НЕОНАМИ, БЕЙДЖАМИ, ВАУЧЕРОМ И ТРАСТОМ -->
  <img class="stitch-original-art" src="data:image/jpeg;base64,${stitchHostingerBase64}" />

  <!-- КАНОНИЧЕСКИЙ ЛОГОТИП САЙТА PROMORADAR (Header.astro) -->
  <div class="top-canonical-header-overlay">
    <div class="brand-cluster">
      <div class="canonical-logo-badge">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" stroke-width="2" opacity="0.4"></circle>
          <circle cx="12" cy="12" r="5" stroke-width="2" opacity="0.75"></circle>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 12l6-6"></path>
          <circle cx="12" cy="2" fill="currentColor"></circle>
        </svg>
      </div>
      <div class="brand-meta">
        <span class="brand-title">PromoRadar</span>
        <span class="brand-subtitle">Verified Promo Codes &amp; Deals</span>
      </div>
    </div>
    <div class="status-pill">
      <span class="ping"></span>
      <span>VERIFIED VOUCHER RADAR • OCTOBER 2026</span>
    </div>
  </div>

  ${item.store !== 'Hostinger' ? `
  <div class="ticket-content-overlay">
    <div class="merchant-logo-slot">${item.logoSvg}</div>
    <div class="headline-main">${item.headline}</div>
    <div class="headline-second">${item.headlineSecond}</div>
    <div class="subhead-desc">${item.subhead}</div>
  </div>
  <div class="code-text-overlay">${item.code}</div>
  <div class="bottom-cta-text-overlay">${item.ctaText}</div>
  ` : ''}
</body>
</html>`;
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_exact';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const generated = [];

  for (const item of PARTNERS) {
    console.log(`Generating exact Stitch art for ${item.store}...`);
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    const outPath = path.join(outDir, `exact_${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`Saved: ${outPath}`);
    generated.push({ ...item, path: outPath, b64: fs.readFileSync(outPath).toString('base64') });
  }

  // Showcase side-by-side
  const showcasePage = await browser.newPage({
    viewport: { width: 2500, height: 1250 },
    deviceScaleFactor: 1
  });

  const showcaseHtml = `<!DOCTYPE html><html><head><style>
    body { margin:0; background:#05070D; padding:40px; font-family:-apple-system,sans-serif; color:#FFF; }
    h1 { text-align:center; font-size:32px; margin-bottom:8px; font-weight:900; }
    p.sub { text-align:center; font-size:16px; color:#94A3B8; margin-bottom:30px; }
    .grid { display:flex; justify-content:center; gap:36px; }
    .card { background:#0F172A; border-radius:24px; padding:18px; box-shadow:0 20px 50px rgba(0,0,0,0.8); border:1px solid rgba(255,255,255,0.12); text-align:center; }
    .card img { width:700px; height:1050px; border-radius:18px; display:block; }
    .title { font-size:22px; font-weight:900; margin-top:14px; }
  </style></head><body>
    <h1>100% Оригинальный Stitch Арт (сохранена вся физика, неоны, пазы и бейджи)</h1>
    <p class="sub">Вся графика от Stitch сохранена 1:1, а логотип и бренд приведены к единому каноническому стандарту сайта PromoRadar</p>
    <div class="grid">
      <div class="card">
        <img src="data:image/png;base64,${generated[0].b64}" />
        <div class="title">1. Hostinger (Оригинальный Stitch Ticket)</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${generated[1].b64}" />
        <div class="title">2. ExpressVPN (100% графика Stitch)</div>
      </div>
      <div class="card">
        <img src="data:image/png;base64,${generated[2].b64}" />
        <div class="title">3. ALLPOWERS (100% графика Stitch)</div>
      </div>
    </div>
  </body></html>`;

  await showcasePage.setContent(showcaseHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/stitch_exact_3pins_comparison.png';
  await showcasePage.screenshot({ path: showcasePath, fullPage: true });
  console.log(`Saved comparison showcase: ${showcasePath}`);

  await browser.close();
}

main().catch(console.error);

