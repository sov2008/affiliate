const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = '/var/www/affiliate/scripts/promoradar_zero_hallucination_template.html';
const OUTPUT_DIR = '/var/www/affiliate/scratch/pins_promoradar/zero_hallucination_10';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const templateRaw = fs.readFileSync(TEMPLATE_PATH, 'utf8');

// 10 боевых партнеров с офферами из каталога PromoRadar
const PARTNERS = [
  {
    store: 'Hostinger',
    slug: 'hostinger',
    headlineMain: '75% OFF',
    headlineSecond: '+ FREE DOMAIN',
    subheadFeatures: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed Architecture',
    code: 'HOSTING75',
    board: 'Web Hosting & Software Licenses',
    theme: `
      --card-border-glow: #4F46E5;
      --card-border-glow-2: #E11D48;
      --halo-left: rgba(79, 70, 229, 0.45);
      --halo-right: rgba(244, 63, 94, 0.35);
      --headline-start: #FEF08A;
      --headline-mid: #F59E0B;
      --headline-end: #EF4444;
      --code-color: #38BDF8;
      --btn-bg: linear-gradient(135deg, #4F46E5 0%, #E11D48 100%);
    `
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    headlineMain: '49% OFF',
    headlineSecond: '+ 3 MO FREE',
    subheadFeatures: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway Protocol',
    code: 'EXPRESS49',
    board: 'VPN & Cyber Privacy Promo Codes',
    theme: `
      --card-border-glow: #E11D48;
      --card-border-glow-2: #F43F5E;
      --halo-left: rgba(225, 29, 72, 0.45);
      --halo-right: rgba(244, 63, 94, 0.35);
      --headline-start: #FFE4E6;
      --headline-mid: #FB7185;
      --headline-end: #E11D48;
      --code-color: #FDA4AF;
      --btn-bg: linear-gradient(135deg, #E11D48 0%, #9F1239 100%);
    `
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    headlineMain: 'EXTRA 12%',
    headlineSecond: 'OFF SITEWIDE',
    subheadFeatures: 'Portable Solar Generators & Home Battery Power Stations • Fast Clean Recharging',
    code: 'EXTRA12',
    board: 'Electronics & Power Station Discounts',
    theme: `
      --card-border-glow: #10B981;
      --card-border-glow-2: #059669;
      --halo-left: rgba(16, 185, 129, 0.45);
      --halo-right: rgba(5, 150, 105, 0.35);
      --headline-start: #D1FAE5;
      --headline-mid: #34D399;
      --headline-end: #059669;
      --code-color: #6EE7B7;
      --btn-bg: linear-gradient(135deg, #059669 0%, #047857 100%);
    `
  },
  {
    store: 'Whokeys',
    slug: 'whokeys',
    headlineMain: '25% OFF',
    headlineSecond: 'GENUINE KEYS',
    subheadFeatures: 'Original Windows 11 Pro & Office 2021 Lifetime Licenses • Instant Delivery',
    code: 'WHO25',
    board: 'Web Hosting & Software Licenses',
    theme: `
      --card-border-glow: #6366F1;
      --card-border-glow-2: #38BDF8;
      --halo-left: rgba(99, 102, 241, 0.45);
      --halo-right: rgba(56, 189, 248, 0.35);
      --headline-start: #E0E7FF;
      --headline-mid: #818CF8;
      --headline-end: #38BDF8;
      --code-color: #38BDF8;
      --btn-bg: linear-gradient(135deg, #4F46E5 0%, #0284C7 100%);
    `
  },
  {
    store: 'Abelssoft',
    slug: 'abelssoft',
    headlineMain: '50% OFF',
    headlineSecond: 'PRO UTILITIES',
    subheadFeatures: 'PC Optimization, AntiBrowserSpy & Privacy Suites • 100% Clean Performance Boost',
    code: 'ABEL50',
    board: 'Web Hosting & Software Licenses',
    theme: `
      --card-border-glow: #8B5CF6;
      --card-border-glow-2: #EC4899;
      --halo-left: rgba(139, 92, 246, 0.45);
      --halo-right: rgba(236, 72, 153, 0.35);
      --headline-start: #FCE7F3;
      --headline-mid: #F472B6;
      --headline-end: #8B5CF6;
      --code-color: #F472B6;
      --btn-bg: linear-gradient(135deg, #8B5CF6 0%, #DB2777 100%);
    `
  },
  {
    store: 'Qustodio',
    slug: 'qustodio',
    headlineMain: '15% OFF',
    headlineSecond: 'FAMILY PREMIUM',
    subheadFeatures: 'Top Rated Parental Controls, Screen Time Balancer & Cyber Safety Protection',
    code: 'FAMILY15',
    board: 'Top Verified Coupons & Store Vouchers',
    theme: `
      --card-border-glow: #06B6D4;
      --card-border-glow-2: #0284C7;
      --halo-left: rgba(6, 182, 212, 0.45);
      --halo-right: rgba(2, 132, 199, 0.35);
      --headline-start: #CFFAFE;
      --headline-mid: #22D3EE;
      --headline-end: #0284C7;
      --code-color: #67E8F9;
      --btn-bg: linear-gradient(135deg, #0891B2 0%, #0369A1 100%);
    `
  },
  {
    store: 'OnlineSIM',
    slug: 'onlinesim',
    headlineMain: '20% OFF',
    headlineSecond: 'VIRTUAL NUMBERS',
    subheadFeatures: 'Disposable & Rental SMS Verification Numbers for Global Apps & Services',
    code: 'SIM20',
    board: 'Top Verified Coupons & Store Vouchers',
    theme: `
      --card-border-glow: #F59E0B;
      --card-border-glow-2: #D97706;
      --halo-left: rgba(245, 158, 11, 0.45);
      --halo-right: rgba(217, 119, 6, 0.35);
      --headline-start: #FEF3C7;
      --headline-mid: #FBBF24;
      --headline-end: #D97706;
      --code-color: #FDE68A;
      --btn-bg: linear-gradient(135deg, #D97706 0%, #B45309 100%);
    `
  },
  {
    store: 'NordVPN',
    slug: 'nordvpn',
    headlineMain: '74% OFF',
    headlineSecond: '+ 3 MO EXTRA',
    subheadFeatures: 'Threat Protection Pro, Ultra-Fast NordLynx Servers & Dedicated IP Security',
    code: 'NORD74',
    board: 'VPN & Cyber Privacy Promo Codes',
    theme: `
      --card-border-glow: #3B82F6;
      --card-border-glow-2: #1D4ED8;
      --halo-left: rgba(59, 130, 246, 0.45);
      --halo-right: rgba(29, 78, 216, 0.35);
      --headline-start: #DBEAFE;
      --headline-mid: #60A5FA;
      --headline-end: #2563EB;
      --code-color: #93C5FD;
      --btn-bg: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
    `
  },
  {
    store: 'Glasseslit',
    slug: 'glasseslit',
    headlineMain: 'BUY 1 GET 1',
    headlineSecond: 'FREE FRAMES',
    subheadFeatures: 'Prescription Eyeglasses, Polarized Sunglasses & Anti-Blue Light Lenses',
    code: 'BOGO2026',
    board: 'Top Verified Coupons & Store Vouchers',
    theme: `
      --card-border-glow: #EC4899;
      --card-border-glow-2: #F43F5E;
      --halo-left: rgba(236, 72, 153, 0.45);
      --halo-right: rgba(244, 63, 94, 0.35);
      --headline-start: #FDF2F8;
      --headline-mid: #F472B6;
      --headline-end: #E11D48;
      --code-color: #F9A8D4;
      --btn-bg: linear-gradient(135deg, #DB2777 0%, #BE123C 100%);
    `
  },
  {
    store: 'Black Friday 2026',
    slug: 'black-friday-2026',
    headlineMain: 'UP TO 90%',
    headlineSecond: 'EARLY RADAR',
    subheadFeatures: 'Exclusive Tech, Hosting, SaaS & Gadget Early Access Radar Vouchers',
    code: 'BF2026',
    board: 'Black Friday 2026 Deals & Early Access',
    theme: `
      --card-border-glow: #F59E0B;
      --card-border-glow-2: #EF4444;
      --halo-left: rgba(245, 158, 11, 0.5);
      --halo-right: rgba(239, 68, 68, 0.4);
      --headline-start: #FEF08A;
      --headline-mid: #F59E0B;
      --headline-end: #DC2626;
      --code-color: #FBBF24;
      --btn-bg: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
    `
  }
];

async function main() {
  console.log(`[Zero-Hallucination Pipeline] Launching Headless Chromium to render 10 stabilized pins...`);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=none']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  const renderedPins = [];

  for (let i = 0; i < PARTNERS.length; i++) {
    const item = PARTNERS[i];
    console.log(`Rendering [${i + 1}/${PARTNERS.length}] ${item.store}...`);

    let html = templateRaw
      .replace('{{THEME_VARS}}', item.theme)
      .replace(/{{MERCHANT_NAME}}/g, item.store)
      .replace(/{{MERCHANT_SLUG}}/g, item.slug)
      .replace('{{HEADLINE_MAIN}}', item.headlineMain)
      .replace('{{HEADLINE_SECOND}}', item.headlineSecond)
      .replace('{{SUBHEAD_FEATURES}}', item.subheadFeatures)
      .replace('{{COUPON_CODE}}', item.code);

    await page.setContent(html, { waitUntil: 'networkidle' });
    // Даем шрифтам полностью инициализироваться
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(200);

    const outPath = path.join(OUTPUT_DIR, `pin_${i + 1}_${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(` Saved: ${outPath}`);

    renderedPins.push({
      ...item,
      imgPath: outPath
    });
  }

  // Создаем витринный 2x5 лист для мгновенного предпросмотра
  console.log('Building 10-pin comparison showcase HTML...');
  const showcaseHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { margin: 0; background: #030712; padding: 40px; font-family: sans-serif; color: #fff; }
      h1 { text-align: center; font-size: 36px; margin-bottom: 8px; color: #38BDF8; }
      p { text-align: center; color: #94A3B8; margin-bottom: 40px; font-size: 18px; }
      .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; max-width: 2500px; margin: 0 auto; }
      .card { background: #0F172A; border-radius: 16px; overflow: hidden; border: 1px solid #1E293B; }
      img { width: 100%; height: auto; display: block; }
      .meta { padding: 16px; text-align: center; }
      .title { font-weight: 800; font-size: 18px; margin-bottom: 4px; }
      .board { font-size: 13px; color: #10B981; }
    </style>
  </head>
  <body>
    <h1>PromoRadar • 10 Stabilized Zero-Hallucination Pins</h1>
    <p>Canonical Brand Identity (Header.astro) • Crisp JetBrains Typography • Fixed Ticket Notches &amp; Trust Badges</p>
    <div class="grid">
      ${renderedPins.map(p => `
        <div class="card">
          <img src="data:image/png;base64,${fs.readFileSync(p.imgPath).toString('base64')}">
          <div class="meta">
            <div class="title">${p.store}</div>
            <div class="board">${p.board}</div>
          </div>
        </div>
      `).join('')}
    </div>
  </body>
  </html>
  `;

  const showcasePage = await browser.newPage({
    viewport: { width: 2500, height: 1800 },
    deviceScaleFactor: 1
  });
  await showcasePage.setContent(showcaseHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/zero_hallucination_10_showcase.png';
  await showcasePage.screenshot({ path: showcasePath, fullPage: true });
  console.log(` Showcase saved: ${showcasePath}`);

  fs.writeFileSync(path.join(OUTPUT_DIR, 'pins_manifest.json'), JSON.stringify(renderedPins, null, 2));

  await browser.close();
  console.log(' All 10 pins rendered with ZERO hallucinations successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

