const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to saved tab...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/live_saved_boards.png' });

  // List all links
  const links = await page.$$eval('a[href*="/PromoRadarStore/"]', els => els.map(e => ({ href: e.href, text: e.innerText.trim() })));
  console.log('Boards / Links found in profile:', links);

  await browser.close();
})();

