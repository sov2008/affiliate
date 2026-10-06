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
    console.log('🌐 Opening NordVPN WW offer page: 18867 ...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/offers/18867/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const bannerBtn = page.locator('button, a').filter({ hasText: /рекламные материалы/i }).first();
    if (await bannerBtn.isVisible()) {
      console.log('🔘 Clicking "Рекламные материалы"...');
      await bannerBtn.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_promo_materials.png') });

      console.log('📍 Promo materials URL:', page.url());

      // Find tracking URL / default affiliate link
      const links = await page.$$eval('input[readonly], textarea, input[value*="admitad"], a[href*="admitad.com/g/"]', els =>
        els.map(e => e.value || e.href || e.innerText)
      );
      console.log('FOUND_AFFILIATE_LINKS:', links);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

run();
