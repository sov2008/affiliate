const fs = require('fs');
const { chromium } = require('playwright');

const BOARDS = [
  'Black Friday 2026 Deals & Early Access',
  'Web Hosting & Software Licenses',
  'VPN & Cyber Privacy Promo Codes',
  'Electronics & Power Station Discounts',
  'Top Verified Coupons & Store Vouchers'
];

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  for (const boardName of BOARDS) {
    console.log(`Checking / Creating board: "${boardName}"...`);
    const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
    await boardBtn.click();
    await page.waitForTimeout(1000);

    const exists = await page.$(`[data-test-id="board-row-${boardName}"], [data-test-id="board-row"]:has-text("${boardName}")`);
    if (exists) {
      console.log(`Board "${boardName}" already exists ✅`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      continue;
    }

    const createOption = page.locator('text="Создать доску"').last();
    await createOption.click();
    await page.waitForTimeout(1500);

    const input = page.locator('input[placeholder*="Куда пойти" i]').first();
    await input.fill(boardName);
    await page.waitForTimeout(500);

    const submitBtn = page.locator('button:has-text("Создать")').last();
    await submitBtn.click();
    console.log(`Board "${boardName}" created! ✅`);
    await page.waitForTimeout(3000);
  }

  // Update cookies
  const freshCookies = await ctx.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(freshCookies, null, 2), 'utf8');

  console.log('All boards setup complete!');
  await browser.close();
})();

