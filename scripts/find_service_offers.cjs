const { chromium } = require('playwright');
const path = require('path');

async function checkServices() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?has_moderation=0', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

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

  // Open 'Категории' -> 'Интернет-услуги'
  const serviceCat = page.locator('label:has-text("Интернет-услуги")').first();
  if (await serviceCat.isVisible()) {
    await serviceCat.click();
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/instant_services.png'), fullPage: true });

  const programs = await page.$$eval('[class*="card"], [class*="program"]', els => {
    return els.map(el => {
      const title = el.querySelector('h2, h3, [class*="title"], [class*="name"]')?.innerText || el.innerText.split('\n')[0];
      const rate = el.innerText.match(/Ставка:[^\n]+/)?.[0] || '';
      return { title: title.trim(), rate: rate.trim() };
    }).filter(p => p.title && !p.title.includes('Спецпредложение'));
  });

  console.log('PROGRAMS_SERVICES:', JSON.stringify(programs, null, 2));
  await browser.close();
}

checkServices().catch(console.error);
