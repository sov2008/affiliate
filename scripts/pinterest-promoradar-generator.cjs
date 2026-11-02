/**
 * PromoRadar Pinterest Pin Generator (Google Stitch Precision Voucher System)
 * 
 * Standard:
 * - 1000px × 1500px (2:3 Aspect Ratio)
 * - Stitch Tokens: Canvas Dark (#0B0F19), Indigo (#4F46E5), Rose (#E11D48), Emerald (#10B981)
 * - Fonts: Inter, JetBrains Mono, Playfair Display
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PINS_OUTPUT_DIR = path.resolve(__dirname, '../scratch/pins_promoradar');

if (!fs.existsSync(PINS_OUTPUT_DIR)) {
  fs.mkdirSync(PINS_OUTPUT_DIR, { recursive: true });
}

const PIN_ITEMS = [
  {
    slug: 'hostinger-cloud-75',
    storeName: 'Hostinger',
    category: 'WEB HOSTING & DOMAINS',
    discountBadge: '75% OFF + FREE DOMAIN',
    headline: 'Host 100 Websites on Ultra-Fast NVMe Cloud',
    subline: 'Free SSL certificate, domain name and automated daily backups included.',
    code: 'HOSTING75',
    expiry: 'Dec 2026',
    verifiedCount: '1,420 Shoppers Saved Today',
    storeDomain: 'hostinger.com',
    targetUrl: 'https://promoradar.store/stores/hostinger/'
  },
  {
    slug: 'expressvpn-49-deal',
    storeName: 'ExpressVPN',
    category: 'PRIVACY & SECURITY',
    discountBadge: '49% OFF + 3 MO FREE',
    headline: 'Military-Grade RAM-Only Privacy Across 105 Countries',
    subline: 'Verified partner coupon unlocks maximum annual discount plus 3 extra months.',
    code: 'EXPRESS49',
    expiry: 'Verified Today',
    verifiedCount: '2,890 Active Users Saved',
    storeDomain: 'expressvpn.com',
    targetUrl: 'https://promoradar.store/stores/expressvpn/'
  },
  {
    slug: 'allpowers-solar-extra12',
    storeName: 'ALLPOWERS',
    category: 'OUTDOOR & POWER STATIONS',
    discountBadge: '12% OFF SITEWIDE',
    headline: 'Save on Portable Solar Generators & Home Backup',
    subline: 'Tested checkout promo code applies instantly to high-capacity LiFePO4 batteries.',
    code: 'EXTRA12',
    expiry: 'Black Friday Access',
    verifiedCount: '840 Campers Saved',
    storeDomain: 'allpowers.com',
    targetUrl: 'https://promoradar.store/stores/allpowers/'
  },
  {
    slug: 'whokeys-windows11-office',
    storeName: 'Whokeys',
    category: 'SOFTWARE & OS LICENSES',
    discountBadge: 'BUNDLE DEAL $35',
    headline: 'Windows 11 Pro + Microsoft Office 2024 Pro Plus',
    subline: 'Lifetime genuine global software license with instant digital key delivery.',
    code: 'ACTIVATE8',
    expiry: 'Official Partner',
    verifiedCount: '3,120 Verified Activations',
    storeDomain: 'whokeys.com',
    targetUrl: 'https://promoradar.store/stores/whokeys/'
  }
];

function generateHtml(item) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${item.headline}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1000px;
      height: 1500px;
      background: #0B0F19;
      color: #FFFFFF;
      font-family: 'Inter', -apple-system, sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 60px 60px 60px;
    }

    /* Ambient background glows */
    .glow-top {
      position: absolute;
      top: -150px;
      right: -100px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(79, 70, 229, 0.35) 0%, rgba(11, 15, 25, 0) 70%);
      z-index: 1;
      pointer-events: none;
    }
    .glow-bottom {
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(225, 29, 72, 0.22) 0%, rgba(11, 15, 25, 0) 70%);
      z-index: 1;
      pointer-events: none;
    }

    .content-wrap {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-between;
    }

    /* Header Nav */
    .brand-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-logo-badge {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 10px 20px;
      border-radius: 9999px;
      backdrop-filter: blur(10px);
    }
    .brand-logo-text {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #38BDF8;
    }
    .verified-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #34D399;
      font-size: 14px;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .verified-pill svg {
      width: 16px;
      height: 16px;
      fill: #34D399;
    }

    /* Hero Discount Badge */
    .hero-badge-wrap {
      margin-top: 40px;
    }
    .category-tag {
      font-size: 15px;
      font-weight: 800;
      color: #A5B4FC;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .discount-banner {
      display: inline-block;
      background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
      color: #FFFFFF;
      font-size: 52px;
      font-weight: 900;
      letter-spacing: -0.5px;
      padding: 16px 36px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(225, 29, 72, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    /* Main Headline & Merchant Info */
    .headline-wrap {
      margin-top: 30px;
    }
    .merchant-name {
      font-size: 24px;
      font-weight: 700;
      color: #94A3B8;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .merchant-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38BDF8;
    }
    .main-headline {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.8px;
      color: #F8FAFC;
      margin-bottom: 18px;
    }
    .sub-headline {
      font-size: 21px;
      line-height: 1.45;
      color: #94A3B8;
      font-weight: 400;
    }

    /* Stitch Precision Voucher Component */
    .voucher-card {
      margin-top: 36px;
      background: #111827;
      border: 2px dashed rgba(99, 102, 241, 0.6);
      border-radius: 24px;
      padding: 34px 40px;
      position: relative;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .voucher-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .voucher-title {
      font-size: 16px;
      font-weight: 700;
      color: #818CF8;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .voucher-expiry {
      font-size: 14px;
      font-weight: 600;
      color: #64748B;
    }

    .code-box {
      background: #0B0F19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .code-text {
      font-family: 'JetBrains Mono', monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #38BDF8;
    }
    .copy-pill {
      background: #4F46E5;
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 700;
      padding: 12px 22px;
      border-radius: 12px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }

    .voucher-footer {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      color: #64748B;
      font-weight: 600;
    }
    .success-stat {
      color: #10B981;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Footer Call To Action */
    .cta-container {
      margin-top: 36px;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 20px;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cta-text-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cta-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .cta-url {
      font-size: 16px;
      font-weight: 600;
      color: #38BDF8;
    }
    .cta-button {
      background: #FFFFFF;
      color: #0B0F19;
      font-size: 18px;
      font-weight: 800;
      padding: 14px 28px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cta-button svg {
      width: 18px;
      height: 18px;
      fill: #0B0F19;
    }
  </style>
</head>
<body>
  <div class="glow-top"></div>
  <div class="glow-bottom"></div>

  <div class="content-wrap">
    <!-- Top Bar -->
    <div class="brand-header">
      <div class="brand-logo-badge">
        <span class="brand-logo-text">PROMORADAR</span>
      </div>
      <div class="verified-pill">
        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        <span>Verified Deal</span>
      </div>
    </div>

    <!-- Hero Discount Banner -->
    <div class="hero-badge-wrap">
      <div class="category-tag">${item.category}</div>
      <div class="discount-banner">${item.discountBadge}</div>
    </div>

    <!-- Center Headline -->
    <div class="headline-wrap">
      <div class="merchant-name">
        <div class="merchant-dot"></div>
        <span>${item.storeName} Official Offer</span>
      </div>
      <h1 class="main-headline">${item.headline}</h1>
      <p class="sub-headline">${item.subline}</p>
    </div>

    <!-- Stitch Voucher Component -->
    <div class="voucher-card">
      <div class="voucher-header">
        <div class="voucher-title">
          <span>✂️</span>
          <span>Exclusive Checkout Promo Code</span>
        </div>
        <div class="voucher-expiry">${item.expiry}</div>
      </div>
      <div class="code-box">
        <span class="code-text">${item.code}</span>
        <div class="copy-pill">APPLY AT CHECKOUT</div>
      </div>
      <div class="voucher-footer">
        <span class="success-stat">⚡ 99.8% Verified Success Rate</span>
        <span>${item.verifiedCount}</span>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="cta-container">
      <div class="cta-text-wrap">
        <div class="cta-title">Tap to activate coupon & save</div>
        <div class="cta-url">promoradar.store</div>
      </div>
      <div class="cta-button">
        <span>Get Deal</span>
        <svg viewBox="0 0 24 24"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-8.29-1.42 1.42 5.43 5.43H5v2z"/></svg>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function renderAllPins() {
  console.log('🚀 Starting PromoRadar Stitch Pin Rendering...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 2
  });

  const generatedFiles = [];

  for (const item of PIN_ITEMS) {
    console.log(`📸 Rendering Pin: ${item.storeName} - ${item.discountBadge}...`);
    const html = generateHtml(item);
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const outPath = path.join(PINS_OUTPUT_DIR, `pin_${item.slug}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ Saved to: ${outPath}`);
    generatedFiles.push({
      item,
      outPath
    });
  }

  await browser.close();
  console.log('🎉 All 4 pins rendered successfully!');
}

renderAllPins().catch(err => {
  console.error('Pin generation error:', err);
  process.exit(1);
});

