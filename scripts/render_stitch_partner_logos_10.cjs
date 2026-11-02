const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Load original Stitch Hostinger image base64 as substrate
const stitchHostingerPath = '/var/www/affiliate/scratch/pins_promoradar/stitch_ai_pin_hostinger.png';
const stitchHostingerBase64 = fs.readFileSync(stitchHostingerPath).toString('base64');

const PARTNERS = [
  {
    store: 'Hostinger',
    slug: 'hostinger',
    category: 'Web Hosting & Domains',
    logoIcon: `
      <svg viewBox="0 0 40 40" style="width:42px;height:42px;color:#673AB7;" fill="currentColor">
        <path d="M10 6h6v28h-6zm14 0h6v11h-6zm0 17h6v11h-6z"/>
      </svg>
    `,
    headlineMain: '75% OFF',
    headlineSecond: '+ FREE DOMAIN',
    shortDesc: 'High-speed cloud SSD web hosting, free SSL, automated backups & 1-click WordPress.',
    code: 'HOSTING75',
    ctaText: 'Save Big on Hostinger at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FFF099 0%, #FF9933 45%, #FF3366 100%)',
    codeColor: '#6366F1'
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    category: 'Privacy & Cyber Security',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;color:#E11D48;" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    `,
    headlineMain: '49% OFF',
    headlineSecond: '+ 3 MO FREE',
    shortDesc: 'Ultra-fast global VPN across 105 countries with TrustedServer RAM-only privacy technology.',
    code: 'EXPRESS49',
    ctaText: 'Save Big on ExpressVPN at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FB7185 45%, #E11D48 100%)',
    codeColor: '#E11D48'
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    category: 'Electronics & Portable Power',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:42px;height:42px;color:#10B981;" fill="currentColor">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    `,
    headlineMain: 'EXTRA 12%',
    headlineSecond: 'OFF SITEWIDE',
    shortDesc: 'Portable power stations, solar panels, and solar generators for outdoor and home backup.',
    code: 'EXTRA12',
    ctaText: 'Save Big on ALLPOWERS at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #D1FAE5 0%, #34D399 45%, #059669 100%)',
    codeColor: '#10B981'
  },
  {
    store: 'Whokeys',
    slug: 'whokeys',
    category: 'Software & OS Licenses',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;color:#38BDF8;" fill="currentColor">
        <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
      </svg>
    `,
    headlineMain: '25% OFF',
    headlineSecond: 'GENUINE KEYS',
    shortDesc: 'Original lifetime licenses for Windows 11 Pro, Office 2021 & premier PC software.',
    code: 'WHO25',
    ctaText: 'Save Big on Whokeys at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #E0E7FF 0%, #818CF8 45%, #38BDF8 100%)',
    codeColor: '#38BDF8'
  },
  {
    store: 'Abelssoft',
    slug: 'abelssoft',
    category: 'PC Utilities & Privacy Tools',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;color:#EC4899;" fill="currentColor">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
      </svg>
    `,
    headlineMain: '50% OFF',
    headlineSecond: 'PRO UTILITIES',
    shortDesc: 'Award-winning Windows performance, AntiBrowserSpy & security optimization tools.',
    code: 'ABEL50',
    ctaText: 'Save Big on Abelssoft at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FCE7F3 0%, #F472B6 45%, #8B5CF6 100%)',
    codeColor: '#EC4899'
  },
  {
    store: 'Qustodio',
    slug: 'qustodio',
    category: 'Family Safety & Screen Balance',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;color:#06B6D4;" fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
    `,
    headlineMain: '15% OFF',
    headlineSecond: 'FAMILY PREMIUM',
    shortDesc: 'Comprehensive digital safety, location tracking, and screen time balance for families.',
    code: 'FAMILY15',
    ctaText: 'Save Big on Qustodio at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #CFFAFE 0%, #22D3EE 45%, #0284C7 100%)',
    codeColor: '#06B6D4'
  },
  {
    store: 'OnlineSIM',
    slug: 'onlinesim',
    category: 'Privacy & Virtual Numbers',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;color:#F59E0B;" fill="currentColor">
        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
      </svg>
    `,
    headlineMain: '20% OFF',
    headlineSecond: 'VIRTUAL NUMBERS',
    shortDesc: 'Virtual phone numbers for instant SMS activation and privacy protection across 30+ countries.',
    code: 'SIM20',
    ctaText: 'Save Big on OnlineSIM at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FBBF24 45%, #D97706 100%)',
    codeColor: '#F59E0B'
  },
  {
    store: 'NordVPN',
    slug: 'nordvpn',
    category: 'Cyber Defense & Encryption',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:42px;height:42px;color:#3B82F6;" fill="currentColor">
        <path d="M12 2L1 21h22L12 2zm0 3.84L19.5 19h-15L12 5.84z"/>
      </svg>
    `,
    headlineMain: '74% OFF',
    headlineSecond: '+ 3 MO EXTRA',
    shortDesc: 'Threat Protection Pro, ultra-fast NordLynx servers & dedicated IP anonymity.',
    code: 'NORD74',
    ctaText: 'Save Big on NordVPN at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #DBEAFE 0%, #60A5FA 45%, #2563EB 100%)',
    codeColor: '#3B82F6'
  },
  {
    store: 'Glasseslit',
    slug: 'glasseslit',
    category: 'Eyewear & Blue-Light Care',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:42px;height:42px;color:#F43F5E;" fill="currentColor">
        <path d="M23 8h-4.22C17.65 6.77 15.68 6 13.5 6c-1.39 0-2.69.31-3.87.86L8.85 6H1v2h6.41l1.45 1.45C8.31 9.87 8 10.4 8 11c0 2.21 1.79 4 4 4 1.83 0 3.36-1.22 3.84-2.89.5-.07 1-.11 1.51-.11.89 0 1.74.15 2.54.43L23 10V8z"/>
      </svg>
    `,
    headlineMain: 'BUY 1 GET 1',
    headlineSecond: 'FREE FRAMES',
    shortDesc: 'Prescription eyeglasses, blue-light blockers, designer frames & polarized sunglasses.',
    code: 'BOGO2026',
    ctaText: 'Save Big on Glasseslit at promoradar.store →',
    headlineGradient: 'linear-gradient(135deg, #FDF2F8 0%, #F472B6 45%, #E11D48 100%)',
    codeColor: '#F43F5E'
  },
  {
    store: 'Black Friday 2026',
    slug: 'black-friday-2026',
    category: 'Seasonal Tech Mega Sale',
    logoIcon: `
      <svg viewBox="0 0 24 24" style="width:42px;height:42px;color:#F59E0B;" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    `,
    headlineMain: 'UP TO 90%',
    headlineSecond: 'EARLY RADAR',
    shortDesc: 'Exclusive early access radar vouchers for software, electronics & web hosting.',
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

    /* 1. STITCH ORIGINAL ART BACKGROUND */
    .stitch-original-art {
      position: absolute;
      inset: 0;
      width: 1000px;
      height: 1500px;
      object-fit: cover;
      z-index: 1;
    }

    /* 2. CANONICAL BRAND HEADER (Header.astro) */
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
      padding-top: 56px;
      background: #07090F;
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

    /* 3. TICKET CONTENT WITH PARTNER LOGO & BESPOKE DESCRIPTION */
    .ticket-inner-cleaner {
      position: absolute;
      top: 335px;
      left: 110px;
      width: 780px;
      height: 560px;
      background: #0C101D;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 16px 40px;
      border-radius: 20px;
    }

    /* PARTNER LOGO & BRAND CARD */
    .partner-brand-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 10px 24px;
      border-radius: 16px;
      margin-bottom: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .partner-logo-box {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .partner-title-group {
      display: flex;
      flex-direction: column;
      text-align: left;
    }
    .partner-name {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #FFFFFF;
      line-height: 1.1;
    }
    .partner-category {
      font-size: 13px;
      font-weight: 700;
      color: #94A3B8;
      letter-spacing: 0.5px;
    }

    /* VIBRANT CONVERSION HEADLINES */
    .headline-main {
      font-size: 80px;
      font-weight: 900;
      letter-spacing: -2px;
      line-height: 1.05;
      background: ${item.headlineGradient};
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .headline-second {
      font-size: 58px;
      font-weight: 900;
      letter-spacing: -1.5px;
      line-height: 1.05;
      color: #FFFFFF;
      margin-bottom: 18px;
    }

    /* PARTNER BESPOKE SHORT DESCRIPTION */
    .partner-desc-box {
      max-width: 680px;
      font-size: 20px;
      line-height: 1.45;
      font-weight: 600;
      color: #CBD5E1;
      padding: 0 10px;
    }

    /* 4. COUPON CODE SLOT */
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

    /* 5. BOTTOM CTA BANNER */
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

  <!-- ДЕТЕРМИНИРОВАННЫЙ ТЕКСТ ТИКЕТА С ЛОГОТИПОМ ПАРТНЕРА И ОПИСАНИЕМ -->
  <div class="ticket-inner-cleaner">
    <!-- ЛОГОТИП ПАРТНЕРА + НАЗВАНИЕ + КАТЕГОРИЯ -->
    <div class="partner-brand-header">
      <div class="partner-logo-box">
        ${item.logoIcon}
      </div>
      <div class="partner-title-group">
        <span class="partner-name">${item.store}</span>
        <span class="partner-category">${item.category}</span>
      </div>
    </div>

    <div class="headline-main">${item.headlineMain}</div>
    <div class="headline-second">${item.headlineSecond}</div>
    <p class="partner-desc-box">${item.shortDesc}</p>
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
  console.log('[Partner Logo & Desc Renderer] Launching Headless Chromium...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 1
  });

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/stitch_partner_logos_10';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const generated = [];

  for (let i = 0; i < PARTNERS.length; i++) {
    const item = PARTNERS[i];
    console.log(`[${i+1}/${PARTNERS.length}] Rendering Stitch pin with logo for ${item.store}...`);
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
    <h1>PromoRadar • 10 Stabilized Pins with Partner Logos &amp; Descriptions</h1>
    <p>Canonical Brand + Dedicated Partner Logo &amp; Category + Bespoke Value Proposition + Crisp Monospace Code</p>
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
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/stitch_partner_logos_10_showcase.png';
  await scPage.screenshot({ path: showcasePath, fullPage: true });
  console.log(` Showcase saved to: ${showcasePath}`);

  await browser.close();
  console.log(' All 10 pins with Partner Logos & Descriptions generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

