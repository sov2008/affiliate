const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to saved boards...');
  await page.goto('https://www.pinterest.com/FlirtCheck/_saved/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(5000);

  await page.screenshot({ path: 'scratch/saved_boards_inspect.png', fullPage: true });

  const boards = await page.evaluate(() => {
    const list = [];
    const elements = document.querySelectorAll('a[href*="/FlirtCheck/"], a[href*="/MoneyCashpw/"], [data-test-id="board-card"]');
    elements.forEach(el => {
      list.push({
        text: el.innerText.trim().replace(/\n+/g, ' | '),
        href: el.href
      });
    });
    return list;
  });

  console.log('Boards found:', JSON.stringify(boards, null, 2));

  await browser.close();
})();
