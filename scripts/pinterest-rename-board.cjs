const { chromium } = require('playwright');
const fs = require('fs');

async function renameBoard() {
  console.log('🚀 Starting robust board rename to FlirtCheck...');
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to board page...');
  await page.goto('https://www.pinterest.com/FlirtCheck/moneycashpw/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const moreBtn = await page.waitForSelector('[aria-label="Больше вариантов для доски"]', { timeout: 15000 });
  console.log('Opening more options menu...');
  await moreBtn.click();
  await page.waitForTimeout(1200);

  const editItem = await page.locator('text="Редактировать информацию и настройки"').first();
  console.log('Opening edit modal...');
  await editItem.click();

  console.log('Waiting for modal dialog...');
  await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
  await page.waitForTimeout(1500);

  console.log('Locating board name input (#boardEditName)...');
  const nameInput = await page.waitForSelector('#boardEditName', { timeout: 10000 });
  await nameInput.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('FlirtCheck', { delay: 30 });
  await page.waitForTimeout(800);

  console.log('Clicking "Готово" button...');
  const submitBtn = await page.locator('button[type="submit"]:has-text("Готово"), button:has-text("Готово")').first();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  // Take confirmation screenshot
  await page.screenshot({ path: 'scratch/board_renamed_confirmed.png' });
  console.log('📸 Confirmation screenshot saved: scratch/board_renamed_confirmed.png');

  const finalTitle = await page.$eval('h1', el => el.innerText).catch(() => 'unknown');
  console.log('Board heading after rename:', finalTitle);

  // Save fresh cookies
  const newCookies = await ctx.cookies();
  fs.writeFileSync('pinterest_cookies.json', JSON.stringify(newCookies, null, 2), 'utf8');

  await browser.close();
  console.log('🎉 Board successfully renamed to FlirtCheck!');
}

renameBoard().catch(err => {
  console.error('❌ Rename failed:', err.message);
  process.exit(1);
});
