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
    headlineMain: '75% OFF',
    headlineSecond: '+ FREE DOMAIN',
    subheadFeatures: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed',
    code: 'HOSTING75',
    ctaText: 'Save Big on Hostinger at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FFF099 0%, #FF9933 45%, #FF3366 100%)',
    codeColor: '#4F46E5'
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    headlineMain: '49% OFF',
    headlineSecond: '+ 3 MO FREE',
    subheadFeatures: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway Protocol',
    code: 'EXPRESS49',
    ctaText: 'Save Big on ExpressVPN at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FB7185 45%, #E11D48 100%)',
    codeColor: '#E11D48'
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    headlineMain: 'EXTRA 12%',
    headlineSecond: 'OFF SITEWIDE',
    subheadFeatures: 'Save on Portable Solar Generators & Home Battery Power Stations • Fast Clean Charging',
    code: 'EXTRA12',
    ctaText: 'Save Big on ALLPOWERS at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #D1FAE5 0%, #34D399 45%, #059669 100%)',
    codeColor: '#10B981'
  },
  {
    store: 'Whokeys',
    slug: 'whokeys',
    headlineMain: '25% OFF',
    headlineSecond: 'GENUINE KEYS',
    subheadFeatures: 'Original Windows 11 Pro & Office 2021 Lifetime Licenses • Instant Delivery',
    code: 'WHO25',
    ctaText: 'Save Big on Whokeys at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #E0E7FF 0%, #818CF8 45%, #38BDF8 100%)',
    codeColor: '#38BDF8'
  },
  {
    store: 'Abelssoft',
    slug: 'abelssoft',
    headlineMain: '50% OFF',
    headlineSecond: 'PRO UTILITIES',
    subheadFeatures: 'PC Optimization, AntiBrowserSpy & Privacy Suites • 100% Clean Performance Boost',
    code: 'ABEL50',
    ctaText: 'Save Big on Abelssoft at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FCE7F3 0%, #F472B6 45%, #8B5CF6 100%)',
    codeColor: '#EC4899'
  },
  {
    store: 'Qustodio',
    slug: 'qustodio',
    headlineMain: '15% OFF',
    headlineSecond: 'FAMILY PREMIUM',
    subheadFeatures: 'Top Rated Parental Controls, Screen Time Balancer & Cyber Safety Protection',
    code: 'FAMILY15',
    ctaText: 'Save Big on Qustodio at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #CFFAFE 0%, #22D3EE 45%, #0284C7 100%)',
    codeColor: '#06B6D4'
  },
  {
    store: 'OnlineSIM',
    slug: 'onlinesim',
    headlineMain: '20% OFF',
    headlineSecond: 'VIRTUAL NUMBERS',
    subheadFeatures: 'Disposable & Rental SMS Verification Numbers for Global Apps & Services',
    code: 'SIM20',
    ctaText: 'Save Big on OnlineSIM at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FBBF24 45%, #D97706 100%)',
    codeColor: '#F59E0B'
  },
  {
    store: 'NordVPN',
    slug: 'nordvpn',
    headlineMain: '74% OFF',
    headlineSecond: '+ 3 MO EXTRA',
    subheadFeatures: 'Threat Protection Pro, Ultra-Fast NordLynx Servers & Dedicated IP Security',
    code: 'NORD74',
    ctaText: 'Save Big on NordVPN at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #DBEAFE 0%, #60A5FA 45%, #2563EB 100%)',
    codeColor: '#3B82F6'
  },
  {
    store: 'Glasseslit',
    slug: 'glasseslit',
    headlineMain: 'BUY 1 GET 1',
    headlineSecond: 'FREE FRAMES',
    subheadFeatures: 'Prescription Eyeglasses, Polarized Sunglasses & Anti-Blue Light Lenses',
    code: 'BOGO2026',
    ctaText: 'Save Big on Glasseslit at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FDF2F8 0%, #F472B6 45%, #E11D48 100%)',
    codeColor: '#F43F5E'
  },
  {
    store: 'Black Friday 2026',
    slug: 'black-friday-2026',
    headlineMain: 'UP TO 90%',
    headlineSecond: 'EARLY RADAR',
    subheadFeatures: 'Exclusive Tech, Hosting, SaaS & Gadget Early Access Radar Vouchers',
    code: 'BF2026',
    ctaText: 'Save Big on Black Friday 2026 at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FEF08A 0%, #F59E0B 45%, #DC2626 100%)',
    codeColor: '#F59E0B'
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

    /* 1. ПОЛНЫЙ ОРИГИНАЛЬНЫЙ АРТ STITCH (ВСЯ СЕТКА, ПЕРФОРАЦИЯ, НЕОНЫ, ТРАСТ-БЕЙДЖИ, КНОПКА) */
    .stitch-original-art {
      position: absolute;
      inset: 0;
      width: 1000px;
      height: 1500px;
      object-fit: cover;
      z-index: 1;
    }

    /* 2. КАНОНИЧЕСКИЙ ВЕКТОРНЫЙ ЛОГОТИП PromoRadar (100% ID с Header.astro) */
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
      background: #07090F; /* Маскируем галлюцинирующий верх Stitch идеальным чистым фоном */
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
      font-size: 52px;
      font-weight: 900;
      letter-spacing: -1.5px;
      color: #FFFFFF;
      line-height: 1;
    }
    .brand-subtitle {
      font-size: 15px;
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
      padding: 7px 24px;
      border-radius: 9999px;
      background: #0E1322;
      border: 1px solid rgba(255, 255, 255, 0.14);
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #818CF8;
      text-transform: uppercase;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    }
    .status-pill .ping {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 10px #10B981;
    }

    /* 3. ОВЕРЛЕЙ ВНУТРИ ТИКЕТА ДЛЯ ПАРТНЕРОВ (НЕОБХОДИМ ДЛЯ ЧИСТКИ ИСКАЖЕНИЙ ТЕКСТА) */
    .ticket-inner-cleaner {
      position: absolute;
      top: 335px;
      left: 110px;
      width: 780px;
      height: 550px;
      background: #0C101D;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 20px 40px;
      border-radius: 20px;
    }
    .merchant-name-label {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .merchant-name-label .bolt {
      color: #F59E0B;
    }
    .headline-main {
      font-size: 84px;
      font-weight: 900;
      letter-spacing: -2px;
      line-height: 1.05;
      background: ${item.headlineGradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    .headline-second {
      font-size: 64px;
      font-weight: 900;
      letter-spacing: -1.5px;
      line-height: 1.05;
      color: #FFFFFF;
      margin-bottom: 24px;
    }
    .subhead-desc {
      font-size: 22px;
      line-height: 1.45;
      font-weight: 600;
      color: #CBD5E1;
      max-width: 680px;
    }

    /* 4. ОВЕРЛЕЙ ПРОМОКОДА (ОЧИЩАЕТ СТАРОЕ ПОЛЕ С ВЫСОКОЙ ТОЧНОСТЬЮ) */
    .code-slot-cleaner {
      position: absolute;
      top: 965px;
      left: 100px;
      width: 480px;
      height: 120px;
      background: #090D18;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
    }
    .code-text-clean {
      font-family: 'JetBrains Mono', monospace;
      font-size: 48px;
      font-weight: 800;
      color: ${item.codeColor};
      letter-spacing: 4px;
    }

    /* 5. ОВЕРЛЕЙ НИЖНЕЙ CTA СТРОКИ (100% ПЕРЕКРЫТИЕ СТАРОГО ТЕКСТА) */
    .bottom-cta-cleaner {
      position: absolute;
      top: 1370px;
      left: 40px;
      width: 920px;
      height: 125px;
      background: #090D18;
      border: 1.5px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 30px;
      box-shadow: 0 20px 45px rgba(0,0,0,0.9);
    }
    .bottom-cta-text {
      font-size: 24px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <!-- ОРИГИНАЛЬНАЯ ПОДЛОЖКА STITCH СО ВСЕМИ НЕОНАМИ И ПАЗАМИ -->
  <img class="stitch-original-art" src="data:image/png;base64,${stitchHostingerBase64}" alt="Stitch Template Art">

  <!-- 100% КАНОНИЧЕСКИЙ ШАПКА PromoRadar -->
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

  <!-- ДЕТЕРМИНИРОВАННЫЙ ТЕКСТ ТИКЕТА БЕЗ ГАЛЛЮЦИНАЦИЙ -->
  <div class="ticket-inner-cleaner">
    <div class="merchant-name-label">
      <span class="bolt">⚡</span> ${item.store}
    </div>
    <div class="headline-main">${item.headlineMain}</div>
    <div class="headline-second">${item.headlineSecond}</div>
    <div class="subhead-desc">${item.subheadFeatures}</div>
  </div>

  <!-- ПРОМОКОД С ПОЛНОЙ ЗАЩИТОЙ ОТ НАЛОЖЕНИЙ -->
  <div class="code-slot-cleaner">
    <span class="code-text-clean">${item.code}</span>
  </div>

  <!-- НИЖНИЙ ЧИСТЫЙ CTA БЕЗ ДВОЙНЫХ БУКВ -->
  <div class="bottom-cta-cleaner">
    <span class="bottom-cta-text">${item.ctaText}</span>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('[Stabilized Stitch Renderer] Launching Headless Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/stitch_canonical_clean_10';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const generated = [];

  for (let i = 0; i < PARTNERS.length; i++) {
    const item = PARTNERS[i];
    console.log(`[${i+1}/${PARTNERS.length}] Rendering 100% clean Stitch pin for ${item.store}...`);
    const html = buildHtml(item);
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const outPath = path.join(outDir, `pin_${i+1}_${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(` Saved: ${outPath}`);

    generated.push({
      ...item,
      outPath
    });
  }

  // Showcase 2x5
  console.log('Rendering 2x5 Showcase comparison...');
  const showcaseHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #030712; padding: 40px; font-family: sans-serif; color: #fff; }
      h1 { text-align: center; font-size: 38px; margin-bottom: 8px; color: #38BDF8; font-weight: 900; }
      p { text-align: center; color: #94A3B8; margin-bottom: 40px; font-size: 18px; }
      .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; max-width: 2500px; margin: 0 auto; }
      .card { background: #0F172A; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B; }
      img { width: 100%; height: auto; display: block; }
      .meta { padding: 16px; text-align: center; }
      .title { font-weight: 800; font-size: 18px; margin-bottom: 4px; }
      .code { font-family: monospace; font-size: 15px; color: #F59E0B; }
    </style>
  </head>
  <body>
    <h1>PromoRadar • 10 Stabilized Stitch Template Pins</h1>
    <p>100% Stitch Original Art (Ticket Notches, Neon Borders, QA Badges, COPY Button) + Canonical Header &amp; Crisp Typography</p>
    <div class="grid">
      ${generated.map(p => `
        <div class="card">
          <img src="data:image/png;base64,${fs.readFileSync(p.outPath).toString('base64')}">
          <div class="meta">
            <div class="title">${p.store}</div>
            <div class="code">CODE: ${p.code}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;

  const scPage = await browser.newPage({
    viewport: { width: 2500, height: 1800 },
    deviceScaleFactor: 1
  });
  await scPage.setContent(showcaseHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/stitch_clean_10_showcase.png';
  await scPage.screenshot({ path: showcasePath, fullPage: true });
  console.log(` Showcase saved to: ${showcasePath}`);

  await browser.close();
  console.log(' Finished! 100% clean Stitch pins ready.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

