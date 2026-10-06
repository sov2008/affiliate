const { chromium } = require('playwright');
const path = require('path');

const TARGETS = [
  { name: 'Security & Antivirus', query: 'antivirus' },
  { name: 'Pass & Privacy', query: 'privacy' },
  { name: 'Cleaner & Optimization', query: 'cleaner' },
  { name: 'Data Recovery & Backup', query: 'recovery' },
  { name: 'eSIM & Connectivity', query: 'esim' },
  { name: 'Flowers & Gifts (Dating)', query: 'flowers' }
];

async function getRealPrograms() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({
    storageState: path.resolve(__dirname, '../artifacts_admitad/auth_state.json')
  });
  const page = await context.newPage();

  const report = {};

  for (const t of TARGETS) {
    const url = `https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?keyword=${encodeURIComponent(t.query)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Dismiss cookie banner
    try {
      await page.evaluate(() => {
        const root = document.querySelector('#cmpwrapper');
        const btn = root?.shadowRoot?.querySelector('button#cmpwelcomebtnyes') || root?.shadowRoot?.querySelector('button');
        if (btn) btn.click();
      });
    } catch (e) {}

    // Exclude the promo banner at the top, only target grid cards
    const programs = await page.evaluate(() => {
      // Find cards inside the main catalog grid (not in the banner)
      const allCards = Array.from(document.querySelectorAll('div[class*="card"], div[class*="program"]'));
      const realCards = allCards.filter(c => {
        const text = c.innerText;
        return !text.includes('Временные акции') && !text.includes('Дней до конца') && !text.includes('Узнать условия') && text.includes('Ставка:');
      });

      return realCards.map(c => {
        const lines = c.innerText.split('\n').map(l => l.trim()).filter(Boolean);
        const title = lines[0] || 'Unknown';
        const rateLine = lines.find(l => l.startsWith('Ставка:')) || '';
        const holdLine = lines.find(l => l.startsWith('Срок оплаты:')) || '';
        const crLine = lines.find(l => l.startsWith('Конверсия:')) || '';
        const hasApplyBtn = lines.some(l => l.includes('Подключиться'));
        return {
          title,
          rate: rateLine.replace('Ставка:', '').trim(),
          hold: holdLine.replace('Срок оплаты:', '').trim(),
          cr: crLine.replace('Конверсия:', '').trim(),
          instant: hasApplyBtn
        };
      });
    });

    report[t.name] = programs.slice(0, 8);
  }

  await browser.close();

  console.log('REAL_PROGRAMS_FOUND:');
  console.log(JSON.stringify(report, null, 2));
}

getRealPrograms().catch(console.error);
