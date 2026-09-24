const { chromium } = require('playwright');
const fs = require('fs');

async function testCleanDescription() {
  console.log('Testing with clean short description without hashtags or URLs...');
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  // Listen to network responses to see exact Pinterest API error response!
  page.on('response', async res => {
    if (res.url().includes('/resource/') && res.status() >= 400) {
      try {
        const text = await res.text();
        console.log('❌ Pinterest API Error Response:', res.status(), text);
      } catch (e) {}
    } else if (res.url().includes('BoardEditResource') || res.url().includes('BoardResource')) {
      try {
        const text = await res.text();
        console.log('ℹ️ Board API Response:', res.status(), text.substring(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://www.pinterest.com/FlirtCheck/moneycashpw/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const moreBtn = await page.$('[aria-label="Больше вариантов для доски"]');
  await moreBtn.click();
  await page.waitForTimeout(1000);

  const editItem = await page.$('text="Редактировать информацию и настройки"');
  await editItem.click();
  await page.waitForTimeout(2000);

  // 1. Board Name
  const nameInput = await page.$('#boardEditName');
  await nameInput.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('FlirtCheck', { delay: 30 });
  await page.waitForTimeout(500);

  // 2. Clear Description or set short clean text
  const descInput = await page.$('#boardEditDescription');
  if (descInput) {
    await descInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Dating safety, profile verification and anti-scam guides.', { delay: 20 });
    await page.waitForTimeout(500);
  }

  // 3. Submit
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(4000);

  const errorMsg = await page.$eval('text="Похоже, произошла ошибка. Просим прощения!"', el => el.innerText).catch(() => null);
  await page.screenshot({ path: 'scratch/clean_desc_test.png' });

  if (errorMsg) {
    console.log('❌ Still error:', errorMsg);
  } else {
    console.log('🎉 SUCCESS! Board renamed without error!');
  }

  await browser.close();
}

testCleanDescription().catch(console.error);
