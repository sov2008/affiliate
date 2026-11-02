const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function renderAvatar() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 800, height: 800 },
    deviceScaleFactor: 2
  });

  const htmlPath = path.resolve(__dirname, 'render_brand_avatar.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const outPath = '/var/www/affiliate/scratch/stitch_pinterest/promoradar_brand_avatar.png';
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('✅ Rendered brand avatar to:', outPath);

  await browser.close();
}

renderAvatar().catch(console.error);

