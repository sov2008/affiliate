const { chromium } = require('playwright');
const path = require('path');

const KEYWORDS = [
  'security', 'antivirus', 'privacy', 'password', 'cleaner', 'recovery',
  'vpn', 'esim', 'travel', 'gift', 'flowers', 'software', 'backup', 'identity',
  'protect', 'safe', 'phone', 'spy', 'parental', 'check'
];

async function searchAdmitadCatalog() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();

  const results = {};

  for (const kw of KEYWORDS) {
    try {
      const url = `https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?keyword=${encodeURIComponent(kw)}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);

      // Dismiss cookie banner if it appears
      try {
        await page.evaluate(() => {
          const root = document.querySelector('#cmpwrapper');
          const btn = root?.shadowRoot?.querySelector('button#cmpwelcomebtnyes') || root?.shadowRoot?.querySelector('button');
          if (btn) btn.click();
        });
      } catch (e) {}

      const cards = await page.$$eval('[class*="card"], [class*="program"]', els => {
        return els.map(el => {
          const title = el.querySelector('h2, h3, [class*="title"], [class*="name"]')?.innerText?.trim() || el.innerText.split('\n')[0].trim();
          const rateMatch = el.innerText.match(/Ставка:[^\n]+/);
          const rate = rateMatch ? rateMatch[0].replace('Ставка:', '').trim() : '';
          const link = el.querySelector('a')?.href || '';
          return { title, rate, link };
        }).filter(p => p.title && !p.title.includes('Спецпредложение') && !p.title.includes('Дней до конца'));
      });

      if (cards.length > 0) {
        results[kw] = cards.slice(0, 5);
        console.log(`Keyword "${kw}": found ${cards.length} programs`);
      }
    } catch (err) {
      console.error(`Error searching "${kw}":`, err.message);
    }
  }

  await browser.close();

  console.log('\n--- AGGREGATED MATCHES ---');
  console.log(JSON.stringify(results, null, 2));
}

searchAdmitadCatalog().catch(console.error);
