const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createBoardSeparately() {
  console.log('🚀 Creating Pinterest Boards...');
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

  // Go to saved tab
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);

  console.log('Looking for plus button to create board...');
  // Click '+' create button
  const plusBtn = await page.$('button[aria-label="Создать"], button[aria-label="Create"], [data-test-id="create-board"]');
  if (plusBtn) {
    await plusBtn.click();
    await sleep(1500);
    const boardOpt = await page.$('div:has-text("Доска"), span:has-text("Доска"), [data-test-id="create-board-button"]');
    if (boardOpt) {
      await boardOpt.click();
      await sleep(2000);
    }
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/create_board_dialog.png' });

  // Input name
  const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
  if (nameInput) {
    await nameInput.fill('Web Hosting & Software Licenses');
    await sleep(500);
    const createBtn = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
    if (createBtn) {
      await createBtn.click();
      console.log('✅ Board created!');
      await sleep(4000);
    }
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/board_created_live.png', fullPage: true });

  await browser.close();
}

createBoardSeparately().catch(console.error);

