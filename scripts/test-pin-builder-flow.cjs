const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'scratch/builder_step1_open.png' });

  const boardButton = await page.$('[data-test-id="board-dropdown-select-button"]');
  console.log('boardButton exists:', !!boardButton);
  if (boardButton) {
    console.log('boardButton text:', await boardButton.innerText());
  }

  const saveBtn = await page.$('[data-test-id="board-dropdown-save-button"]');
  console.log('saveBtn exists:', !!saveBtn);
  if (saveBtn) {
    const info = await page.evaluate(el => ({
      text: el.innerText,
      disabled: el.disabled,
      ariaDisabled: el.getAttribute('aria-disabled'),
      className: el.className
    }), saveBtn);
    console.log('saveBtn info:', JSON.stringify(info));
  }

  await browser.close();
})();
