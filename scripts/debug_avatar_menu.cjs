const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to settings/edit-profile...');
  await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click Change button
  const changeBtn = page.locator('button:has-text("Изменить"), button:has-text("Change")').first();
  await changeBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/avatar_menu_opened.png' });

  const buttonsAfter = await page.$$eval('div[role="menuitem"], div[role="button"], button', els => els.map(e => ({ text: e.innerText, role: e.getAttribute('role') })));
  console.log('Menu items after clicking change:', buttonsAfter);

  await browser.close();
})();

