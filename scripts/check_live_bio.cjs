const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ locale: 'ru-RU' });
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const moreBtn = await page.$('button:has-text("больше"), button:has-text("more")');
  if (moreBtn) await moreBtn.click();
  await page.waitForTimeout(1000);

  const bioText = await page.evaluate(() => document.body.innerText);
  console.log('Snippet:\n', bioText.substring(0, 400));

  await browser.close();
})();

