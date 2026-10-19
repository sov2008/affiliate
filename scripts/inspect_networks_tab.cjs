const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function inspectNetworksTab() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  await page.goto('https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/', { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  const tabs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="tab"]'))
      .map(el => ({ text: (el.innerText || '').trim(), href: el.getAttribute('href') }))
      .filter(t => /сеть|сет|партнер|awin|impact|список/i.test(t.text));
  });

  console.log('Tabs / filters found:', JSON.stringify(tabs, null, 2));
  await browser.close();
}
inspectNetworksTab();
