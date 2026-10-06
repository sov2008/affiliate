const { chromium } = require('playwright');
const path = require('path');

async function testKeywords() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();

  const words = ['cleaner', 'password', 'esim', 'recovery', 'flower', 'travel', 'dating', 'parental'];
  const results = {};

  for (const w of words) {
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?keyword=' + w, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    try {
      const banner = page.locator('#cmpwrapper');
      if (await banner.isVisible({ timeout: 1500 })) {
        await page.evaluate(() => {
          const root = document.querySelector('#cmpwrapper');
          const btn = root?.shadowRoot?.querySelector('button#cmpwelcomebtnyes') || root?.shadowRoot?.querySelector('button');
          if (btn) btn.click();
        });
      }
    } catch(e){}

    const progs = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/offers/"]'));
      const set = new Set();
      const items = [];
      for (const a of links) {
        const m = a.href.match(/\/offers\/(\d+)/);
        const text = a.innerText.trim();
        if (m && text.length > 3 && !text.includes('Подробнее') && !text.includes('О программе') && !text.includes('дня') && !text.includes('%')) {
          const id = m[1];
          if (!set.has(id)) {
            set.add(id);
            items.push({ id, title: text.split('\n')[0], href: a.href });
          }
        }
      }
      return items;
    });

    results[w] = progs.filter(p => !p.title.includes('Agromarket') && !p.title.includes('Tous') && !p.title.includes('WPS Office'));
    console.log(`Keyword "${w}": found ${results[w].length}`);
  }

  console.log('\nFINAL_NICHE_PROGRAMS:');
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

testKeywords().catch(console.error);
