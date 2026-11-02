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
  if (!boardBtn) throw new Error('boardBtn not found');
  await boardBtn.click();
  await page.waitForTimeout(1500);

  // 2. Click "Создать доску"
  const createBtn = await page.$('div:has-text("Создать доску"), button:has-text("Создать доску")');
  if (!createBtn) throw new Error('createBtn not found');
  await createBtn.click();
  await page.waitForTimeout(1500);

  // 3. Inspect dialog
  await page.screenshot({ path: '/var/www/affiliate/scratch/dialog_state.png' });
  const inputs = await page.$$eval('input', els => els.map(e => ({ id: e.id, placeholder: e.placeholder, name: e.name, type: e.type, visible: e.offsetParent !== null })));
  console.log('Inputs in DOM:', inputs);

  const buttons = await page.$$eval('button', els => els.map(e => ({ text: e.innerText, type: e.type, disabled: e.disabled })));
  console.log('Buttons in DOM:', buttons);

  await browser.close();
})();

