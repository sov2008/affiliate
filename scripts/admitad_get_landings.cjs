const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/offers/18867/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const landingsLink = page.locator('a:has-text("Лендинги")').first();
    if (await landingsLink.isVisible()) {
      await landingsLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_landings.png') });
      console.log('📍 Landings URL:', page.url());

      // Extract tracking links
      const text = await page.innerText('body');
      console.log('BODY_PREVIEW:', text.slice(0, 1500));
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
