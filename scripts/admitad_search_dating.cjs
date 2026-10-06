const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function dismissCookies(page) {
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      await okayBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (err) {}
}

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const searchInput = page.locator('input[placeholder*="Поиск" i], input[type="search"]').first();

    for (const kw of ['dating', 'знакомства', 'love', 'flirt']) {
      await searchInput.fill(kw);
      await page.waitForTimeout(2000);
      const suggestions = await page.$$eval('.cdk-overlay-container mat-option, .mat-option, [role="option"]', els =>
        els.map(e => e.innerText.trim())
      );
      console.log(`SUGGESTIONS for "${kw}":`, suggestions);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
