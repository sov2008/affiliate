const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function testPartnerNetworkConnect() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const connectElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a'))
      .filter(el => /подключ|получить|ссылк/i.test(el.innerText || ''))
      .map(el => ({
        tag: el.tagName,
        text: (el.innerText || '').trim(),
        classes: el.className,
        href: el.getAttribute('href')
      }));
  });

  console.log('Connect elements on partners page:', JSON.stringify(connectElements, null, 2));

  // If button exists, click it and log response/modal
  const btn = page.locator('button, a').filter({ hasText: /^подключиться$/i }).first();
  if (await btn.isVisible()) {
    console.log('Clicking "Подключиться"...');
    await btn.click();
    await page.waitForTimeout(3000);
    const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
    if (await dialog.isVisible()) {
      console.log('Dialog opened:', (await dialog.innerText()).replace(/\n+/g, ' '));
    }
  }

  await browser.close();
}
testPartnerNetworkConnect();
