const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 Renaming board via direct DOM flow...');
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('1. Navigating to board page...');
  await page.goto('https://www.pinterest.com/FlirtCheck/moneycashpw/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3500);

  const moreBtn = await page.$('[aria-label="Больше вариантов для доски"]');
  if (!moreBtn) throw new Error('More options button not found');

  console.log('2. Clicking more options button...');
  await moreBtn.click();
  await page.waitForTimeout(1000);

  const editItem = await page.$('text="Редактировать информацию и настройки"');
  if (!editItem) throw new Error('Edit settings item not found');

  console.log('3. Clicking edit settings item...');
  await editItem.click();
  await page.waitForTimeout(2500);

  console.log('4. Locating #boardEditName...');
  const nameInput = await page.$('#boardEditName');
  if (!nameInput) throw new Error('#boardEditName input not found');

  console.log('5. Typing new board name: FlirtCheck...');
  await nameInput.click();
  await page.waitForTimeout(300);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('FlirtCheck', { delay: 40 });
  await page.waitForTimeout(1000);

  console.log('6. Clicking submit (Готово)...');
  const submitBtn = await page.$('button[type="submit"]');
  if (!submitBtn) throw new Error('Submit button not found');

  await submitBtn.click();
  console.log('⏳ Waiting for Pinterest to save board settings...');
  await page.waitForTimeout(4000);

  await page.screenshot({ path: 'scratch/board_renamed_result.png' });
  console.log('📸 Result screenshot: scratch/board_renamed_result.png');

  const pageTitle = await page.title();
  const heading = await page.$eval('h1', el => el.innerText).catch(() => 'unknown');
  console.log('Current URL:', page.url(), '| Page Title:', pageTitle, '| Heading:', heading);

  // Update cookies
  const newCookies = await ctx.cookies();
  fs.writeFileSync('pinterest_cookies.json', JSON.stringify(newCookies, null, 2), 'utf8');

  await browser.close();
  console.log('🎉 Board renamed successfully!');
})();
