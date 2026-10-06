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
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_offer_details.png') });

    // Extract all menu items and links
    const links = await page.$$eval('a, button, li', els =>
      els.map(e => ({ text: e.innerText.trim(), href: e.href || '' })).filter(x => x.text && x.text.length < 30)
    );
    console.log('OFFER_MENU_ITEMS:', JSON.stringify(links, null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
