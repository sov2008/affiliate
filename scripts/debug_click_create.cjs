const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Click board button
  const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  console.log('Clicking board dropdown...');
  await boardBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/dropdown_clicked.png' });

  // 2. Find and click Create Board
  const createOption = page.locator('text="Создать доску"').last();
  console.log('Clicking "Создать доску"...');
  await createOption.click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/after_create_board_click.png' });

  await browser.close();
})();

