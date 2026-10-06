const { chromium } = require('playwright');
const path = require('path');

async function inspectSearch() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?keyword=antivirus', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

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

  const titles = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/offers/"]'));
    return links.map(a => ({
      text: a.innerText.trim(),
      href: a.href
    })).filter(x => x.text && !x.text.includes('Узнать'));
  });

  console.log('TITLES_FOUND:', titles);
  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/search_antivirus.png'), fullPage: true });
  await browser.close();
}

inspectSearch().catch(console.error);
