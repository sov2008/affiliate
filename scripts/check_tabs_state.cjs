const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();
  
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: '/var/www/affiliate/scratch/saved_tab_check.png' });
  console.log('Saved tab screenshot captured');
  
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/pin_builder_state.png' });
  console.log('Pin builder screenshot captured');
  
  await browser.close();
})();

