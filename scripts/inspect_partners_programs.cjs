const { chromium } = require('playwright');
const path = require('path');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');

async function inspectPartners() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  const url = 'https://store.admitad.com/ru/webmaster/websites/3012753/catalog/public_partners_programs/';
  console.log('Navigating to:', url);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());
  const title = await page.title();
  console.log('Title:', title);

  const info = await page.evaluate(() => {
    const text = document.body.innerText;
    const cards = Array.from(document.querySelectorAll('.catalog-card, mat-card, .offer-card, tr, .table-row'));
    const buttons = Array.from(document.querySelectorAll('button, a')).map(b => (b.innerText || '').trim()).filter(t => /подключ|подать|запрос|партнер/i.test(t));
    return {
      cardsCount: cards.length,
      buttons: Array.from(new Set(buttons)).slice(0, 15),
      bodySnippet: text.substring(0, 500).replace(/\n+/g, ' ')
    };
  });

  console.log('Page info:', JSON.stringify(info, null, 2));

  // Check network response or details of partners
  const sampleCard = await page.evaluate(() => {
    const first = document.querySelector('mat-card, .offer-card, .catalog-card');
    return first ? first.innerText.replace(/\n+/g, ' | ') : 'No cards found';
  });
  console.log('Sample Card:', sampleCard);

  await browser.close();
}
inspectPartners();
