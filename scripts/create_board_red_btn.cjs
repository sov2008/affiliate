const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function createBoardViaPlus() {
  console.log('🚀 Clicking bottom right red "Создать" button...');
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

  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);

  // Click the red "Создать" button in the bottom right
  const redCreateBtn = await page.$('button:has-text("Создать")');
  if (redCreateBtn) {
    console.log('Found red button, clicking...');
    await redCreateBtn.click();
    await sleep(1500);

    await page.screenshot({ path: '/var/www/affiliate/scratch/red_create_menu.png' });

    // Look for "Доска" (Board)
    const boardOpt = await page.$('div:has-text("Доска"), span:has-text("Доска"), a:has-text("Доска")');
    if (boardOpt) {
      console.log('Clicking "Доска" option...');
      await boardOpt.click();
      await sleep(2000);

      const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
      if (nameInput) {
        console.log('Entering board name...');
        await nameInput.fill('Web Hosting & Software Licenses');
        await sleep(500);
        const submitBtn = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
        if (submitBtn) {
          await submitBtn.click();
          console.log('✅ Board submitted!');
          await sleep(5000);
        }
      }
    }
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/board_result.png', fullPage: true });

  await browser.close();
}

createBoardViaPlus().catch(console.error);

