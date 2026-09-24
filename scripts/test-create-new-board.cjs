const { chromium } = require('playwright');
const fs = require('fs');

async function testCreateBoard() {
  console.log('Testing creating a new board...');
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  page.on('response', async res => {
    if (res.url().includes('BoardResource') || res.url().includes('create')) {
      try {
        const text = await res.text();
        console.log('API Response:', res.status(), text.substring(0, 200));
      } catch (e) {}
    }
  });

  await page.goto('https://www.pinterest.com/FlirtCheck/_saved/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  // Look for '+' create button
  const plusBtn = await page.$('[aria-label="Создать доску или коллаж"], [aria-label="Создать"], [data-test-id="create-board-or-collage-button"]');
  console.log('Plus button exists:', !!plusBtn);

  // Alternatively navigate to pin-builder to create board
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (boardBtn) {
    await boardBtn.click();
    await page.waitForTimeout(1000);

    const createBoardBtn = await page.$('[data-test-id="create-board-button"], div:has-text("Создать доску")');
    console.log('createBoardBtn in dropdown:', !!createBoardBtn);
    if (createBoardBtn) {
      await createBoardBtn.click();
      await page.waitForTimeout(1500);

      const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
      if (nameInput) {
        console.log('Typing new board name: FlirtCheck Guides...');
        await nameInput.click();
        await page.keyboard.type('FlirtCheck Guides', { delay: 20 });
        await page.waitForTimeout(500);

        const modalCreateBtn = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
        if (modalCreateBtn) {
          await modalCreateBtn.click();
          console.log('Clicked Create Board button!');
          await page.waitForTimeout(3000);
        }
      }
    }
  }

  await page.screenshot({ path: 'scratch/new_board_created_test.png' });
  await browser.close();
}

testCreateBoard().catch(console.error);
