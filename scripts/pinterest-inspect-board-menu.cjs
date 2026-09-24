const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to board page...');
  await page.goto('https://www.pinterest.com/FlirtCheck/moneycashpw/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const moreBtn = await page.$('[aria-label="Больше вариантов для доски"]');
  if (moreBtn) {
    console.log('Clicking more options button...');
    await moreBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'scratch/board_more_options_menu.png' });

    const menuItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="menuitem"], [role="button"], button')).map(el => el.innerText.trim()).filter(Boolean);
    });
    console.log('Menu items:', JSON.stringify(menuItems, null, 2));
  } else {
    console.log('More options button not found');
  }

  await browser.close();
})();
