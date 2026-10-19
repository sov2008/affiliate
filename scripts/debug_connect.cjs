const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function debugConnect() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/') || url.includes('/apply') || url.includes('/offers/')) {
      console.log('📡 Response:', res.status(), res.request().method(), url);
      try {
        const body = await res.text();
        console.log('📦 Body:', body.substring(0, 150));
      } catch {}
    }
  });

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/?has_moderation=2', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const btn = page.locator('button.offer-card__cta').first();
  console.log('Clicking first connect button...');
  await btn.click();
  await page.waitForTimeout(2000);

  const dialog = page.locator('[role="dialog"], mat-dialog-container').first();
  if (await dialog.isVisible()) {
    console.log('Dialog is visible, looking for accept button...');
    const acceptBtn = dialog.locator('button').filter({ hasText: /принять|согласен/i }).first();
    if (await acceptBtn.isVisible()) {
      console.log('Accept button is visible, clicking...');
      await acceptBtn.click();
      await page.waitForTimeout(5000);
    } else {
      console.log('Accept button NOT found in dialog. Dialog buttons:', await dialog.locator('button').allInnerTexts());
    }
  }

  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/debug_connect_click.png') });
  await browser.close();
}
debugConnect();
