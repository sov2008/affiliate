const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Click profile
    const avatar = await page.$('header [class*="avatar"], header .user-menu, header button:has-text("sov2018")');
    if (avatar) {
      await avatar.click();
      await page.waitForTimeout(1000);
      const items = await page.$$eval('.dropdown-menu a, [class*="menu"] a', els =>
        els.map(e => ({ text: e.innerText.trim(), href: e.href, outerHTML: e.outerHTML }))
      );
      console.log('PROFILE_ITEMS:', JSON.stringify(items, null, 2));
    }

    // Inspect search bar
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const searchForm = await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Поиск" i], input[type="search"]');
      if (!input) return null;
      const parent = input.closest('form') || input.parentElement;
      return {
        inputName: input.name,
        inputId: input.id,
        parentTag: parent.tagName,
        parentHTML: parent.outerHTML.slice(0, 500)
      };
    });
    console.log('SEARCH_FORM:', JSON.stringify(searchForm, null, 2));

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await browser.close();
  }
}

run();
