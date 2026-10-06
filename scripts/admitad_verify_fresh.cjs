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
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=pending', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'pending_programs_fresh.png'), fullPage: true });

    const programs = await page.$$eval('[class*="card"], [class*="program"]', els =>
      els.map(e => e.innerText.split('\n')[0]).filter(Boolean)
    );
    console.log('PROGRAMS_ON_MODERATION:', programs);

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
