const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  const boardUrl = 'https://www.pinterest.com/FlirtCheck/moneycashpw/';
  console.log('Navigating to board:', boardUrl);
  await page.goto(boardUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'scratch/board_page_view.png', fullPage: false });

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"]')).map(b => ({
      text: b.innerText.trim(),
      ariaLabel: b.getAttribute('aria-label'),
      testId: b.getAttribute('data-test-id'),
      className: b.className
    })).filter(b => b.text || b.ariaLabel || b.testId);
  });

  console.log('Buttons on board page:', JSON.stringify(buttons.slice(0, 20), null, 2));

  await browser.close();
})();
