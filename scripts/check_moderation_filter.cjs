const { chromium } = require('playwright');
const path = require('path');

async function test() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Close cookie banner if present
  try {
    const banner = page.locator('#cmpwrapper');
    if (await banner.isVisible({ timeout: 2000 })) {
      await page.evaluate(() => {
        const root = document.querySelector('#cmpwrapper');
        const btn = root?.shadowRoot?.querySelector('button#cmpwelcomebtnyes') || root?.shadowRoot?.querySelector('button');
        if (btn) btn.click();
      });
      await page.waitForTimeout(1000);
    }
  } catch(e){}

  // Click 'На модерации' checkbox in filter
  const checkbox = page.locator('label:has-text("На модерации")').first();
  await checkbox.scrollIntoViewIfNeeded();
  await checkbox.click();
  await page.waitForTimeout(4000);

  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/all_on_moderation.png'), fullPage: true });

  const bodyText = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText;
  });

  const lines = bodyText.split('\n').map(s => s.trim()).filter(Boolean);
  const foundIdx = lines.findIndex(l => l.includes('Найдено рекламодателей:'));
  console.log('STATUS LINE:', foundIdx !== -1 ? lines[foundIdx] : 'not found');

  await browser.close();
}

test().catch(console.error);
