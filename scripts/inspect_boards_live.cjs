const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Opening boards page directly...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check what boards exist
  const bodyText = await page.innerText('body');
  console.log('Body length:', bodyText.length);

  // Navigate to pin-builder and inspect board dropdown
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (boardBtn) {
    console.log('Board button text:', await boardBtn.innerText());
    await boardBtn.click();
    await page.waitForTimeout(1500);

    const boardItems = await page.$$eval('[data-test-id*="board-row"], div[role="button"]', els => els.map(e => e.innerText).filter(t => t && t.length < 50));
    console.log('Found board items in dropdown:', boardItems);
  }

  await browser.close();
})();

