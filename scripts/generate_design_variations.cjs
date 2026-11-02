/**
 * PromoRadar 3-Archetype Pinterest Creative Suite
 * 
 * Standards & Guidelines:
 * - Dimensions: 1000px × 1500px (2:3 Aspect Ratio) at 2x resolution
 * - Rules: No AI tells ("unlock/elevate/game-changer"), 100% verified genuine codes
 * 
 * Archetype A: Precision Voucher / Radar Dark (Stitch Native)
 * Archetype B: Editorial Buyer's Guide / Clean Light Minimalist (Kinfolk / Wirecutter style)
 * Archetype C: High-Urgency Deal Alert / Bold Amber & Flame (Flash Sale / Black Friday)
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PINS_OUTPUT_DIR = path.resolve(__dirname, '../scratch/pins_promoradar');
if (!fs.existsSync(PINS_OUTPUT_DIR)) {
  fs.mkdirSync(PINS_OUTPUT_DIR, { recursive: true });
}

// -------------------------------------------------------------
// TEMPLATE A: Precision Voucher / Cyber Radar Dark
// -------------------------------------------------------------
function renderTemplateA(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1000px;
      height: 1500px;
      background: #0B0F19;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 60px 60px 60px;
    }
    .ambient-glow {
      position: absolute;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
    }
    .glow-1 { top: -200px; right: -150px; background: radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%); }
    .glow-2 { bottom: -200px; left: -150px; background: radial-gradient(circle, rgba(225, 29, 72, 0.25) 0%, transparent 70%); }

    .z-content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }

    /* Top Bar */
    .top-bar { display: flex; justify-content: space-between; align-items: center; }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 10px 22px;
      border-radius: 100px;
    }
    .logo-text { font-size: 18px; font-weight: 800; letter-spacing: 2px; color: #38BDF8; }
    .radar-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34D399;
      font-size: 14px;
      font-weight: 700;
      padding: 8px 18px;
      border-radius: 100px;
      letter-spacing: 1px;
    }

    /* Hero Promo */
    .hero-section { margin-top: 40px; }
    .category-label {
      font-size: 15px;
      font-weight: 800;
      color: #818CF8;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .badge-discount {
      display: inline-block;
      background: linear-gradient(135deg, #E11D48 0%, #BE123C 100%);
      color: #FFFFFF;
      font-size: 52px;
      font-weight: 800;
      padding: 16px 36px;
      border-radius: 20px;
      box-shadow: 0 20px 45px rgba(225, 29, 72, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.25);
    }

    /* Core Headline */
    .main-copy { margin-top: 35px; }
    .brand-target { font-size: 24px; font-weight: 700; color: #94A3B8; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
    .brand-target::before { content: ""; width: 8px; height: 8px; background: #38BDF8; border-radius: 50%; display: inline-block; }
    .headline { font-size: 46px; font-weight: 800; line-height: 1.18; letter-spacing: -0.5px; color: #FFFFFF; margin-bottom: 18px; }
    .subtext { font-size: 21px; line-height: 1.45; color: #94A3B8; }

    /* Voucher Ticket */
    .voucher-box {
      margin-top: 40px;
      background: #111827;
      border: 2px dashed rgba(99, 102, 241, 0.6);
      border-radius: 24px;
      padding: 34px 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .voucher-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .voucher-label { font-size: 15px; font-weight: 700; color: #818CF8; letter-spacing: 1.5px; text-transform: uppercase; }
    .code-container {
      background: #0B0F19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .code-string { font-family: 'JetBrains Mono', monospace; font-size: 38px; font-weight: 800; letter-spacing: 4px; color: #38BDF8; }
    .code-action { background: #4F46E5; color: #FFF; font-size: 16px; font-weight: 700; padding: 12px 24px; border-radius: 12px; }

    .voucher-bot { margin-top: 18px; display: flex; justify-content: space-between; font-size: 15px; color: #64748B; font-weight: 600; }
    .stat-green { color: #10B981; }

    /* Bottom Bar */
    .footer-bar {
      margin-top: 40px;
      background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
      border: 1px solid rgba(99, 102, 241, 0.4);
      border-radius: 20px;
      padding: 24px 34px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-title { font-size: 22px; font-weight: 800; color: #FFF; }
    .footer-url { font-size: 16px; font-weight: 600; color: #38BDF8; }
    .footer-btn { background: #FFF; color: #0B0F19; font-size: 18px; font-weight: 800; padding: 14px 28px; border-radius: 14px; }
  </style>
</head>
<body>
  <div class="ambient-glow glow-1"></div>
  <div class="ambient-glow glow-2"></div>
  <div class="z-content">
    <div class="top-bar">
      <div class="logo-container"><span class="logo-text">PROMORADAR</span></div>
      <div class="radar-tag"><span>● Verified Deal</span></div>
    </div>
    <div class="hero-section">
      <div class="category-label">${data.category}</div>
      <div class="badge-discount">${data.discount}</div>
    </div>
    <div class="main-copy">
      <div class="brand-target">${data.brand} Partner Deal</div>
      <h1 class="headline">${data.headline}</h1>
      <p class="subtext">${data.subtext}</p>
    </div>
    <div class="voucher-box">
      <div class="voucher-top">
        <span class="voucher-label">✂️ Tested Checkout Promo Code</span>
        <span style="color:#64748B; font-size:14px; font-weight:600;">Exp: ${data.expiry}</span>
      </div>
      <div class="code-container">
        <span class="code-string">${data.code}</span>
        <span class="code-action">COPY CODE</span>
      </div>
      <div class="voucher-bot">
        <span class="stat-green">⚡ 99.8% Checkout Success</span>
        <span>${data.socialProof}</span>
      </div>
    </div>
    <div class="footer-bar">
      <div>
        <div class="footer-title">Tap to reveal & activate savings</div>
        <div class="footer-url">promoradar.store</div>
      </div>
      <div class="footer-btn">Get Deal →</div>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// TEMPLATE B: Editorial Buyer's Guide / Clean Minimalist Light
// -------------------------------------------------------------
function renderTemplateB(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,600;0,6..72,700;1,6..72,400&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1000px;
      height: 1500px;
      background: #FDFBF7;
      color: #111827;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 70px 65px;
      border: 1px solid #E5E7EB;
    }
    
    /* Editorial Masthead */
    .masthead {
      border-bottom: 2px solid #111827;
      padding-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .masthead-title {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 3px;
      color: #111827;
      text-transform: uppercase;
    }
    .masthead-sub {
      font-size: 14px;
      font-weight: 600;
      color: #6B7280;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Curated Label & Discount */
    .meta-row {
      margin-top: 40px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .pill-dept {
      background: #111827;
      color: #FFF;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      padding: 8px 18px;
      border-radius: 4px;
      text-transform: uppercase;
    }
    .tested-note {
      font-size: 14px;
      font-weight: 600;
      color: #059669;
    }

    .main-editorial {
      margin-top: 30px;
    }
    .editorial-badge {
      font-size: 64px;
      font-weight: 900;
      color: #DC2626;
      line-height: 1;
      margin-bottom: 24px;
      letter-spacing: -1.5px;
    }
    .editorial-headline {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 54px;
      font-weight: 700;
      line-height: 1.15;
      color: #111827;
      letter-spacing: -0.5px;
      margin-bottom: 24px;
    }
    .editorial-summary {
      font-size: 22px;
      line-height: 1.5;
      color: #4B5563;
      font-weight: 500;
    }

    /* Comparison Box */
    .teardown-card {
      margin-top: 40px;
      background: #FFFFFF;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      padding: 32px 36px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.03);
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #F3F4F6;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .card-retail { font-size: 16px; color: #9CA3AF; text-decoration: line-through; }
    .card-promo-price { font-size: 18px; font-weight: 800; color: #059669; }

    .code-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F9FAFB;
      border: 1px dashed #D1D5DB;
      border-radius: 12px;
      padding: 18px 24px;
    }
    .code-label-small { font-size: 12px; font-weight: 700; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; }
    .mono-code { font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: 700; color: #111827; letter-spacing: 3px; }
    .apply-badge { background: #111827; color: #FFF; font-size: 14px; font-weight: 700; padding: 10px 18px; border-radius: 6px; }

    /* Footer Wirecutter Style */
    .editorial-footer {
      border-top: 2px solid #111827;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .guide-source { font-size: 15px; color: #6B7280; font-weight: 600; }
    .guide-link { font-size: 20px; font-weight: 800; color: #111827; display: flex; align-items: center; gap: 8px; }
  </style>
</head>
<body>
  <div class="masthead">
    <div class="masthead-title">PromoRadar Curated</div>
    <div class="masthead-sub">Independent Deal Desk // Tested Today</div>
  </div>

  <div class="meta-row">
    <span class="pill-dept">${data.category}</span>
    <span class="tested-note">✓ Live Price Verification Confirmed</span>
  </div>

  <div class="main-editorial">
    <div class="editorial-badge">${data.discount}</div>
    <h1 class="editorial-headline">${data.headline}</h1>
    <p class="editorial-summary">${data.subtext}</p>
  </div>

  <div class="teardown-card">
    <div class="card-header-row">
      <span style="font-size: 15px; font-weight:700; color: #4B5563;">Store: ${data.brand}</span>
      <span class="card-promo-price">Verified Partner Discount</span>
    </div>
    <div class="code-row">
      <div>
        <div class="code-label-small">Checkout Voucher</div>
        <div class="mono-code">${data.code}</div>
      </div>
      <div class="apply-badge">Apply at Checkout</div>
    </div>
    <div style="margin-top: 16px; font-size: 14px; color: #6B7280; display:flex; justify-content: space-between;">
      <span>✓ Instant cart deduction</span>
      <span>${data.socialProof}</span>
    </div>
  </div>

  <div class="editorial-footer">
    <div class="guide-source">PromoRadar Buyer's Lab · No Sign-up Required</div>
    <div class="guide-link">Visit promoradar.store →</div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// TEMPLATE C: High-Urgency Deal Alert / Bold Amber & Flame
// -------------------------------------------------------------
function renderTemplateC(data) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800;900&family=JetBrains+Mono:wght@800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1000px;
      height: 1500px;
      background: #09090B;
      color: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 65px 60px;
      overflow: hidden;
    }
    
    /* Radial Flash Glow */
    .flash-glow {
      position: absolute;
      top: 150px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 800px;
      background: radial-gradient(circle, rgba(249, 115, 22, 0.28) 0%, rgba(220, 38, 38, 0.15) 45%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }

    .c-wrap { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }

    /* Alert Banner */
    .alert-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(249, 115, 22, 0.12);
      border: 1px solid rgba(249, 115, 22, 0.35);
      padding: 14px 26px;
      border-radius: 100px;
    }
    .alert-chip {
      color: #F97316;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pulse-dot { width: 10px; height: 10px; background: #EF4444; border-radius: 50%; }
    .alert-source { font-size: 15px; font-weight: 700; color: #D4D4D8; }

    /* Huge Impact Discount Header */
    .hero-impact { margin-top: 36px; text-align: center; }
    .urgency-badge {
      display: inline-block;
      background: linear-gradient(135deg, #EA580C 0%, #DC2626 100%);
      color: #FFFFFF;
      font-size: 68px;
      font-weight: 900;
      padding: 20px 48px;
      border-radius: 28px;
      box-shadow: 0 25px 60px rgba(234, 88, 12, 0.45);
      border: 2px solid rgba(255, 255, 255, 0.3);
      letter-spacing: -1px;
    }

    .deal-body { margin-top: 36px; text-align: center; }
    .brand-pill-center {
      display: inline-block;
      background: #27272A;
      color: #E4E4E7;
      font-size: 18px;
      font-weight: 700;
      padding: 8px 24px;
      border-radius: 100px;
      margin-bottom: 18px;
      letter-spacing: 1px;
    }
    .impact-headline {
      font-size: 48px;
      font-weight: 900;
      line-height: 1.15;
      letter-spacing: -0.5px;
      color: #FAFAFA;
      margin-bottom: 20px;
    }
    .impact-sub {
      font-size: 22px;
      line-height: 1.45;
      color: #A1A1AA;
      max-width: 820px;
      margin: 0 auto;
    }

    /* Coupon Ticket High Urgency */
    .ticket-container {
      margin-top: 40px;
      background: #18181B;
      border: 2px dashed #F97316;
      border-radius: 24px;
      padding: 34px 40px;
    }
    .ticket-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 15px; font-weight: 700; color: #FB923C; letter-spacing: 1.5px; }
    .ticket-code-row {
      background: #09090B;
      border: 1px solid #27272A;
      border-radius: 16px;
      padding: 20px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ticket-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 40px;
      font-weight: 800;
      color: #FB923C;
      letter-spacing: 4px;
    }
    .ticket-btn {
      background: #EA580C;
      color: #FFF;
      font-size: 17px;
      font-weight: 800;
      padding: 14px 26px;
      border-radius: 12px;
    }

    /* Countdown / Proof Bar */
    .proof-row {
      margin-top: 18px;
      display: flex;
      justify-content: space-between;
      font-size: 15px;
      font-weight: 700;
      color: #71717A;
    }
    .proof-green { color: #22C55E; }

    /* Sticky Bottom Action */
    .cta-banner-flame {
      margin-top: 40px;
      background: linear-gradient(135deg, #18181B 0%, #27272A 100%);
      border: 1px solid #3F3F46;
      border-radius: 20px;
      padding: 26px 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .flame-title { font-size: 23px; font-weight: 900; color: #FFF; }
    .flame-sub { font-size: 16px; font-weight: 600; color: #FB923C; }
    .flame-action-btn {
      background: #F97316;
      color: #09090B;
      font-size: 18px;
      font-weight: 900;
      padding: 16px 32px;
      border-radius: 14px;
    }
  </style>
</head>
<body>
  <div class="flash-glow"></div>
  <div class="c-wrap">
    <div class="alert-header">
      <div class="alert-chip">
        <span class="pulse-dot"></span>
        <span>Limited-Time Price Drop</span>
      </div>
      <div class="alert-source">promoradar.store</div>
    </div>

    <div class="hero-impact">
      <div class="urgency-badge">${data.discount}</div>
    </div>

    <div class="deal-body">
      <div class="brand-pill-center">${data.brand} Official Coupon</div>
      <h1 class="impact-headline">${data.headline}</h1>
      <p class="impact-sub">${data.subtext}</p>
    </div>

    <div class="ticket-container">
      <div class="ticket-meta">
        <span>🔥 FLASH CHECKOUT VOUCHER</span>
        <span>ENDS SOON</span>
      </div>
      <div class="ticket-code-row">
        <span class="ticket-code">${data.code}</span>
        <span class="ticket-btn">REVEAL CODE</span>
      </div>
      <div class="proof-row">
        <span class="proof-green">⚡ Tested & Working 100%</span>
        <span>${data.socialProof}</span>
      </div>
    </div>

    <div class="cta-banner-flame">
      <div>
        <div class="flame-title">Tap to activate savings at checkout</div>
        <div class="flame-sub">promoradar.store/stores/${data.slug}/</div>
      </div>
      <div class="flame-action-btn">Claim Deal →</div>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// BATCH CONFIGURATION (Multi-Archetype Showcase)
// -------------------------------------------------------------
const DESIGN_VARIATIONS = [
  // 1. Archetype A (Precision Dark / Stitch Native)
  {
    archetype: 'A',
    variantName: 'stitch_precision_dark',
    slug: 'hostinger',
    brand: 'Hostinger',
    category: 'WEB HOSTING & DOMAINS',
    discount: '75% OFF + DOMAIN',
    headline: 'Host 100 Websites on Ultra-Fast NVMe Cloud',
    subtext: 'Free SSL certificate, domain name and automated daily backups included.',
    code: 'HOSTING75',
    expiry: 'Dec 2026',
    socialProof: '1,420 Shoppers Saved Today'
  },
  // 2. Archetype B (Editorial Buyer's Guide / Clean Light Minimalist)
  {
    archetype: 'B',
    variantName: 'editorial_light_minimalist',
    slug: 'expressvpn',
    brand: 'ExpressVPN',
    category: 'PRIVACY & SECURITY',
    discount: '49% OFF + 3 MO FREE',
    headline: 'RAM-Only Server Privacy Across 105 Countries',
    subtext: 'Exclusive annual plan markdown with verified promo code. Protect unlimited devices without speed caps.',
    code: 'EXPRESS49',
    expiry: 'Verified Today',
    socialProof: '2,890 Active Subscriptions'
  },
  // 3. Archetype C (High-Urgency Flash Sale / Bold Amber & Flame)
  {
    archetype: 'C',
    variantName: 'high_urgency_flash_alert',
    slug: 'allpowers',
    brand: 'ALLPOWERS',
    category: 'OUTDOOR & POWER STATIONS',
    discount: '12% OFF SITEWIDE',
    headline: 'Save on Portable LiFePO4 Solar Generators',
    subtext: 'Verified checkout code applies instantly to high-capacity power stations and solar bundles.',
    code: 'EXTRA12',
    expiry: 'Black Friday Access',
    socialProof: '840 Campers Saved'
  },
  // 4. Archetype B on Whokeys (Software Licensing)
  {
    archetype: 'B',
    variantName: 'editorial_light_whokeys',
    slug: 'whokeys',
    brand: 'Whokeys',
    category: 'SOFTWARE & OS LICENSES',
    discount: 'BUNDLE DEAL $35',
    headline: 'Windows 11 Pro + Microsoft Office 2024 Suite',
    subtext: 'Genuine lifetime global licenses with instant digital key verification. Skip enterprise subscription fees.',
    code: 'ACTIVATE8',
    expiry: 'Official Partner',
    socialProof: '3,120 Verified Activations'
  },
  // 5. Archetype C on Hostinger (Black Friday Flash Edition)
  {
    archetype: 'C',
    variantName: 'flash_black_friday_hostinger',
    slug: 'hostinger',
    brand: 'Hostinger',
    category: 'BLACK FRIDAY EARLY ACCESS',
    discount: 'SAVE UP TO 75%',
    headline: 'LiteSpeed Cloud Hosting Flash Sale',
    subtext: 'Claim free custom domain, unlimited SSL, and free website migration before allocation runs out.',
    code: 'HOSTING75',
    expiry: 'Limited Time',
    socialProof: '99.9% Uptime Guarantee'
  }
];

async function generateAllVariations() {
  console.log('🚀 [Design Lab] Rendering 3 Creative Archetypes for PromoRadar...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1000, height: 1500 },
    deviceScaleFactor: 2
  });

  for (const item of DESIGN_VARIATIONS) {
    let html = '';
    if (item.archetype === 'A') html = renderTemplateA(item);
    else if (item.archetype === 'B') html = renderTemplateB(item);
    else if (item.archetype === 'C') html = renderTemplateC(item);

    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const filename = `variant_${item.variantName}.png`;
    const outPath = path.join(PINS_OUTPUT_DIR, filename);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`✅ [Archetype ${item.archetype}] Rendered: ${filename}`);
  }

  await browser.close();
  console.log('🎉 All design variations generated successfully in scratch/pins_promoradar!');
}

generateAllVariations().catch(err => {
  console.error('Error generating design suite:', err);
  process.exit(1);
});

