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
    await page.evaluate(() => {
      const banner = document.getElementById('cmpwrapper');
      if (banner) banner.remove();
      const overlays = document.querySelectorAll('.cmpwrapper, .modal-backdrop');
      overlays.forEach(o => o.remove());
    }).catch(() => {});
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
    console.log('🌐 Opening NordVPN WW offer page: 18867 ...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/offers/18867/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const applyBtn = page.locator('button, a').filter({ hasText: /подать заявку/i }).first();
    if (await applyBtn.isVisible()) {
      console.log('🔘 Clicking "Подать заявку"...');
      await applyBtn.click({ force: true });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_popup_opened.png') });

      // In popup click "Подключиться"
      const confirmBtn = page.locator('button, a').filter({ hasText: /подключиться/i }).last();
      if (await confirmBtn.isVisible()) {
        console.log('🔘 Clicking "Подключиться" in popup...');
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_applied_final.png') });
        console.log('🎉 Application submitted for NordVPN!');
      }
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

run();
