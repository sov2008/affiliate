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

  const context = await browser.newContext({ storageState: STATE_FILE, viewport: null });
  const page = await context.newPage();

  try {
    // 1. Check pending moderation
    console.log('🔍 Checking programs on moderation...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=pending', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'status_pending.png') });

    // 2. Check active/connected
    console.log('🔍 Checking connected programs...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=connected', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'status_connected.png') });

    // 3. Find Postback URL settings page
    // In Admitad modern UI: Webmaster -> Tools -> Postback URL or Settings
    console.log('⚙️ Searching for Postback in tools or settings...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/postback/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('Postback URL test 1:', page.url());

    await page.goto('https://store.admitad.com/ru/webmaster/postback/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(2000);
    console.log('Postback URL test 2:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'status_postback_test.png') });

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
