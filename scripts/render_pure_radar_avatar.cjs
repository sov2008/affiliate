const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function renderPureAvatar() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 800, height: 800 },
    deviceScaleFactor: 2
  });

  const htmlPath = path.resolve(__dirname, 'pure_radar_avatar.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const outPath = '/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png';
  await page.screenshot({ path: outPath, type: 'png' });
  console.log('✅ Pure radar avatar rendered to:', outPath);

  await browser.close();
}

renderPureAvatar().catch(console.error);

