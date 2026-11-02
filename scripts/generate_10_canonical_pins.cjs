const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_PATH = path.resolve(__dirname, 'promoradar_pin_canonical_template.html');

const PARTNERS = [
  {
    store: 'Hostinger',
    slug: 'hostinger',
    headline: '75% OFF + FREE DOMAIN',
    subhead: 'Cloud & Premium Web Hosting • Ultra-fast NVMe & LiteSpeed Architecture',
    code: 'HOSTING75',
    theme: 'cyber_indigo'
  },
  {
    store: 'ExpressVPN',
    slug: 'expressvpn',
    headline: '49% OFF + 3 MO FREE',
    subhead: 'Military-Grade RAM-Only Privacy Across 105 Countries • Trusted Lightway',
    code: 'EXPRESS49',
    theme: 'electric_cyan'
  },
  {
    store: 'ALLPOWERS',
    slug: 'allpowers',
    headline: 'EXTRA 12% OFF SITEWIDE',
    subhead: 'Save on Portable Solar Generators & Home Battery Stations • Fast Charging',
    code: 'EXTRA12',
    theme: 'emerald_mint'
  },
  {
    store: 'Whokeys',
    slug: 'whokeys',
    headline: '88% OFF WIN 11 + OFFICE',
    subhead: 'Official Genuine Software Licenses • Lifetime Global Activation Guarantee',
    code: 'WHO88',
    theme: 'cyber_indigo'
  },
  {
    store: 'Abelssoft',
    slug: 'abelssoft',
    headline: '50% OFF LIFETIME SHIELD',
    subhead: 'Award-Winning Windows PC Privacy Shields & Deep Registry System Cleaners',
    code: 'ABELSSOFT50',
    theme: 'electric_cyan'
  },
  {
    store: 'Qustodio',
    slug: 'qustodio',
    headline: '20% OFF FAMILY SHIELD',
    subhead: 'Real-time Web Filtering, Screen Control & Instant Family Location Alerts',
    code: 'FAMILY20',
    theme: 'emerald_mint'
  },
  {
    store: 'OnlineSIM',
    slug: 'onlinesim',
    headline: '15% EXTRA CREDITS',
    subhead: 'Disposable Virtual Phone Numbers for WhatsApp & Google Across 90+ Countries',
    code: 'SIMSECURE15',
    theme: 'electric_cyan'
  },
  {
    store: 'Black Friday 2026',
    slug: 'black-friday',
    headline: 'UP TO 85% OFF DEALS',
    subhead: 'Early Access Exclusive Software, Cloud & Hosting Checkout Promo Codes',
    code: 'BF2026',
    theme: 'crimson_sunset'
  },
  {
    store: 'Glasseslit',
    slug: 'glasseslit',
    headline: 'BUY 1 GET 1 + 20% OFF',
    subhead: 'Designer Prescription Glasses, Blue Light Blocking & Polarized Sunglasses',
    code: 'HCF20',
    theme: 'crimson_sunset'
  },
  {
    store: 'NordVPN',
    slug: 'nordvpn',
    headline: '73% OFF + 3 MO FREE',
    subhead: 'Next-Gen Threat Protection Pro, Meshnet & Ultra-Fast Global VPN Servers',
    code: 'NORDDEAL',
    theme: 'electric_cyan'
  }
];

const THEME_STYLES = {
  cyber_indigo: `
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
  electric_cyan: `
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
  crimson_sunset: `
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
  emerald_mint: `
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
  `
};

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

  const outDir = '/var/www/affiliate/scratch/pins_promoradar/batch_10_partners';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const pinFiles = [];

  for (let i = 0; i < PARTNERS.length; i++) {
    const p = PARTNERS[i];
    console.log(`[${i+1}/10] Generating canonical pin for ${p.store}...`);

    const themeVars = THEME_STYLES[p.theme] || THEME_STYLES.cyber_indigo;
    const filledHtml = rawHtml
      .replace('{{THEME_STYLE_VARS}}', themeVars)
      .replace(/{{MERCHANT_NAME}}/g, p.store)
      .replace(/{{MERCHANT_SLUG}}/g, p.slug)
      .replace(/{{HEADLINE_DISCOUNT}}/g, p.headline)
      .replace(/{{HEADLINE_SUBHEAD}}/g, p.subhead)
      .replace(/{{COUPON_CODE}}/g, p.code);

    await page.setContent(filledHtml, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);

    const outPath = path.join(outDir, `pin_${i+1}_${p.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`  Saved: ${outPath} ✅`);
    pinFiles.push({ ...p, path: outPath, b64: fs.readFileSync(outPath).toString('base64') });
  }

  // Generate 2x5 Grid Showcase Image (10 pins total)
  console.log('Rendering 10-Pin Grid Showcase Image...');
  const gridPage = await browser.newPage({
    viewport: { width: 3300, height: 2150 },
    deviceScaleFactor: 1
  });

  const cardsHtml = pinFiles.map((p, idx) => `
    <div style="background:#0F172A;border-radius:24px;padding:16px;box-shadow:0 20px 50px rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.12);text-align:center;">
      <img src="data:image/png;base64,${p.b64}" style="width:580px;height:870px;border-radius:18px;display:block;" />
      <div style="font-size:20px;font-weight:900;margin-top:14px;color:#FFF;">${idx+1}. ${p.store}</div>
      <div style="font-size:15px;color:#38BDF8;font-weight:700;margin-top:4px;">${p.headline} • [${p.code}]</div>
    </div>
  `).join('');

  const gridHtml = `<!DOCTYPE html><html><head><style>
    body { margin:0; background:#06080F; padding:40px 30px; font-family:-apple-system,BlinkMacSystemFont,sans-serif; color:#FFF; }
    h1 { text-align:center; font-size:38px; margin-bottom:10px; font-weight:900; letter-spacing:0.5px; }
    p.sub { text-align:center; font-size:18px; color:#94A3B8; margin-bottom:35px; }
    .grid { display:grid; grid-template-columns: repeat(5, 1fr); gap:26px; justify-content:center; }
  </style></head><body>
    <h1>Витрина 10 партнерских пинов PromoRadar в каноническом стиле Stitch</h1>
    <p class="sub">100% повторяемость фирменного логотипа сайта PromoRadar • 4 контрастные темы Stitch • Только подтвержденные офферы</p>
    <div class="grid">
      ${cardsHtml}
    </div>
  </body></html>`;

  await gridPage.setContent(gridHtml, { waitUntil: 'load' });
  const showcasePath = '/var/www/affiliate/scratch/pins_promoradar/batch_10_partners_showcase.png';
  await gridPage.screenshot({ path: showcasePath, fullPage: true });
  console.log(`📸 10-pin grid showcase saved to: ${showcasePath}`);

  await browser.close();
}

main().catch(console.error);

