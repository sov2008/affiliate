const { chromium } = require('playwright');
const path = require('path');

async function generateBanner() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1500, height: 500 },
    deviceScaleFactor: 2
  });

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1500px;
        height: 500px;
        background: radial-gradient(circle at 80% 30%, #17223b 0%, #0a0e17 65%, #05070a 100%);
        color: #f1f5f9;
        font-family: 'Plus Jakarta Sans', sans-serif;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 50px 70px;
        position: relative;
        overflow: hidden;
      }
      /* Subtle grid overlay */
      .grid-overlay {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: 
          linear-gradient(to right, rgba(56, 189, 248, 0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(56, 189, 248, 0.04) 1px, transparent 1px);
        background-size: 50px 50px;
        pointer-events: none;
      }
      .scanline {
        position: absolute;
        top: 0; left: 0; right: 0; height: 3px;
        background: linear-gradient(90deg, transparent, #38bdf8, transparent);
        opacity: 0.7;
      }
      .radar-decor {
        position: absolute;
        right: 60px;
        top: 50px;
        width: 400px;
        height: 400px;
        border: 1px dashed rgba(56, 189, 248, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .radar-decor::after {
        content: '';
        width: 250px;
        height: 250px;
        border: 1px solid rgba(56, 189, 248, 0.1);
        border-radius: 50%;
      }
      .top-meta {
        display: flex;
        align-items: center;
        gap: 16px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #38bdf8;
        position: relative;
        z-index: 2;
      }
      .badge {
        background: rgba(56, 189, 248, 0.12);
        border: 1px solid rgba(56, 189, 248, 0.35);
        padding: 4px 12px;
        border-radius: 4px;
        font-weight: 600;
        color: #7dd3fc;
      }
      .center-content {
        margin-left: 280px; /* Leave space for left-aligned avatar on X */
        position: relative;
        z-index: 2;
      }
      .brand-title {
        font-family: 'Cinzel', serif;
        font-size: 56px;
        font-weight: 800;
        letter-spacing: 0.06em;
        color: #ffffff;
        line-height: 1.1;
        text-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
      }
      .brand-title span {
        color: #38bdf8;
      }
      .brand-subtitle {
        font-size: 20px;
        font-weight: 600;
        color: #94a3b8;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-top: 10px;
      }
      .badges-row {
        display: flex;
        gap: 16px;
        margin-top: 24px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
      }
      .pill {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(148, 163, 184, 0.2);
        padding: 6px 14px;
        border-radius: 6px;
        color: #cbd5e1;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .pill-dot {
        width: 6px;
        height: 6px;
        background: #38bdf8;
        border-radius: 50%;
        box-shadow: 0 0 8px #38bdf8;
      }
      .bottom-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        color: #64748b;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        padding-top: 16px;
        position: relative;
        z-index: 2;
      }
      .site-url {
        color: #38bdf8;
        font-weight: 700;
        letter-spacing: 0.05em;
      }
    </style>
  </head>
  <body>
    <div class="grid-overlay"></div>
    <div class="scanline"></div>
    <div class="radar-decor"></div>

    <div class="top-meta">
      <span class="badge">FORENSIC EVIDENCE DESK</span>
      <span>•</span>
      <span>DISPATCH ARCHIVE #2026</span>
      <span>•</span>
      <span>INDEPENDENT VERIFICATION LAB</span>
    </div>

    <div class="center-content">
      <h1 class="brand-title">FLIRT<span>CHECK</span></h1>
      <p class="brand-subtitle">Online Dating Safety & Forensic Investigation</p>
      
      <div class="badges-row">
        <div class="pill"><div class="pill-dot"></div>ALGORITHM AUDIT</div>
        <div class="pill"><div class="pill-dot"></div>CATFISH & SCAM REVERSE-LOOKUP</div>
        <div class="pill"><div class="pill-dot"></div>PSYCHOMETRIC TELEMETRY</div>
      </div>
    </div>

    <div class="bottom-bar">
      <div>LONDON TECHNICAL BUREAU // SECURE INTELLIGENCE</div>
      <div class="site-url">https://flirtcheck.site</div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle' });
  const outPath = path.resolve('scratch/twitter_banner.png');
  await page.screenshot({ path: outPath });
  console.log('Saved banner to', outPath);

  await browser.close();
}

generateBanner().catch(console.error);
