const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Visiting public profile...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/final_public_live.png', fullPage: true });
  console.log('Screenshot saved to scratch/final_public_live.png');

  await browser.close();
})();

