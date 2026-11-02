const { chromium } = require('playwright');
const fs = require('fs');

async function testClickCreateBoard() {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'ru-RU'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Upload image
  const pinImage = '/var/www/affiliate/scratch/pins_promoradar/pin_hostinger-cloud-75.png';
  await page.setInputFiles('input[type="file"]', pinImage);
  await page.waitForTimeout(3000);

  // Click board dropdown
  const boardBtn = page.locator('button:has-text("Выберите доску")').first();
  await boardBtn.click();
  await page.waitForTimeout(2000);

  // Find exact row "Создать доску"
  console.log('Searching for "Создать доску" element...');
  const createBoardEl = page.locator('text="Создать доску"').last();
  console.log('Is visible:', await createBoardEl.isVisible());

  // Click it directly
  await createBoardEl.click();
  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/after_create_board_click.png' });

  // Check all inputs on page
  const allInputs = await page.$$eval('input', els => els.map(e => ({ id: e.id, placeholder: e.placeholder, name: e.name, type: e.type })));
  console.log('Inputs found:', allInputs);

  await browser.close();
}

testClickCreateBoard().catch(console.error);

