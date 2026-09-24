const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (boardBtn) {
    console.log('Opening board dropdown...');
    await boardBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'scratch/board_dropdown_open.png' });

    const boardItems = await page.evaluate(() => {
      const items = [];
      document.querySelectorAll('[data-test-id="board-row"], [role="option"], [data-test-id*="board"]').forEach(el => {
        items.push({
          text: el.innerText.trim().replace(/\n+/g, ' | '),
          html: el.outerHTML.substring(0, 200)
        });
      });
      return items;
    });

    console.log('Boards in dropdown:', JSON.stringify(boardItems, null, 2));
  }

  await browser.close();
})();
