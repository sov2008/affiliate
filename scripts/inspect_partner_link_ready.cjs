const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function checkPartnerOfferLink() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const getLinkBtns = page.locator('button').filter({ hasText: 'Получить ссылку' });
  const count = await getLinkBtns.count();
  console.log('Get link buttons count on page:', count);

  if (count > 0) {
    await getLinkBtns.first().click();
    await page.waitForTimeout(2000);
    const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
    if (await dialog.isVisible()) {
      console.log('Dialog text after join:', (await dialog.innerText()).replace(/\n+/g, ' '));
      const inputs = await dialog.locator('input').all();
      for (const inp of inputs) {
        console.log('🎉 LIVE PARTNER LINK:', await inp.inputValue());
      }
    }
  }

  await browser.close();
}
checkPartnerOfferLink();
