const { chromium } = require('playwright');
const fs = require('fs');

async function testName(testTitle) {
  console.log(`\nTesting rename to: "${testTitle}"...`);
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ locale: 'ru-RU', viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  await page.goto('https://www.pinterest.com/FlirtCheck/moneycashpw/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(3000);

  const moreBtn = await page.$('[aria-label="Больше вариантов для доски"]');
  if (!moreBtn) {
    await browser.close();
    return { success: false, reason: 'moreBtn not found' };
  }
  await moreBtn.click();
  await page.waitForTimeout(1000);

  const editItem = await page.$('text="Редактировать информацию и настройки"');
  if (!editItem) {
    await browser.close();
    return { success: false, reason: 'editItem not found' };
  }
  await editItem.click();
  await page.waitForTimeout(2000);

  const nameInput = await page.$('#boardEditName');
  if (!nameInput) {
    await browser.close();
    return { success: false, reason: 'nameInput not found' };
  }

  await nameInput.click();
  await page.waitForTimeout(200);
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(testTitle, { delay: 30 });
  await page.waitForTimeout(800);

  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();
  await page.waitForTimeout(3000);

  const errorMsg = await page.$eval('text="Похоже, произошла ошибка. Просим прощения!"', el => el.innerText).catch(() => null);
  const isModalOpen = await page.$('#boardEditName');

  await page.screenshot({ path: `scratch/rename_test_${testTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png` });

  await browser.close();

  if (errorMsg || isModalOpen) {
    console.log(`❌ Failed with error for "${testTitle}": ${errorMsg || 'Modal still open'}`);
    return { success: false, error: errorMsg };
  } else {
    console.log(`✅ SUCCESS! Board accepted name "${testTitle}"!`);
    return { success: true };
  }
}

async function main() {
  // Test variations
  const names = [
    'FlirtCheck • Dating Safety',
    'Dating Safety & Scam Defense',
    'FlirtCheck Lab'
  ];

  for (const name of names) {
    const res = await testName(name);
    if (res.success) {
      console.log(`🎉 Board successfully renamed to: "${name}"!`);
      break;
    }
  }
}

main().catch(console.error);
