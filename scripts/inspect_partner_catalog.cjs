const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function scrapePartnerPrograms() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const programs = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('mat-card, .offer-card, .catalog-card, tr'));
    return cards.map(c => c.innerText.replace(/\n+/g, ' | ')).slice(0, 10);
  });

  console.log('Sample partner programs on page:', JSON.stringify(programs, null, 2));

  // Also check "Подключить площадку"
  const connectSiteBtn = page.locator('button, a').filter({ hasText: /Подключить площадку/i }).first();
  if (await connectSiteBtn.isVisible()) {
    console.log('Found "Подключить площадку" button, clicking...');
    await connectSiteBtn.click();
    await page.waitForTimeout(3000);
    const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal').first();
    if (await dialog.isVisible()) {
      console.log('Dialog content:', (await dialog.innerText()).replace(/\n+/g, ' '));
      const confirmBtn = dialog.locator('button').filter({ hasText: /подключ|принять|соглас/i }).first();
      if (await confirmBtn.isVisible()) {
        console.log('Clicking confirm connect site button...');
        await confirmBtn.click();
        await page.waitForTimeout(4000);
      }
    }
  }

  await browser.close();
}
scrapePartnerPrograms();
