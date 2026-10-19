const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function testGetLiveLink() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const btn = page.locator('button').filter({ hasText: 'Получить ссылку' }).first();
  await btn.click();
  await page.waitForTimeout(2000);

  const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
  if (await dialog.isVisible()) {
    console.log('Dialog content after activation:', (await dialog.innerText()).replace(/\n+/g, ' '));
    const inputs = await dialog.locator('input').all();
    for (const inp of inputs) {
      console.log('🔗 Generated Tracking Link:', await inp.inputValue());
    }
  }

  await browser.close();
}
testGetLiveLink();
