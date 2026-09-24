const { chromium } = require('playwright');
const fs = require('fs');

async function debugPublish() {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, locale: 'ru-RU' });
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('1. Navigating to Pin Builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Upload image
  console.log('2. Uploading image 2...');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.setInputFiles('pinterestpins/pin_2026-dating-safety-blueprint-verify-optimize-protect-your-online-.png');
  await page.waitForTimeout(3000);

  // Title
  console.log('3. Typing title...');
  const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], input[placeholder*="заголовок"], input[id*="title"]');
  if (titleArea) {
    await titleArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('2026 Dating Safety Blueprint: Verify, Optimize, & Protect', { delay: 10 });
  }

  // Description
  console.log('4. Typing description...');
  const descArea = await page.$('[aria-label="Добавьте описание пина"], textarea[id*="description"], [placeholder*="описание"]');
  if (descArea) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Comprehensive dating safety blueprint. Read full forensic investigation at FlirtCheck.site 🔍 #DatingSafety #ProfileVerification #FlirtCheck', { delay: 5 });
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'scratch/debug_step2_filled.png' });

  // Inspect the top right area: Board and Publish buttons
  const boardButton = await page.$('[data-test-id="board-dropdown-select-button"]');
  const boardText = boardButton ? await boardButton.innerText() : 'none';
  console.log('Current selected board text:', boardText.replace(/\n+/g, ' '));

  // If board is not MoneyCash.pw or not selected, select it
  if (!boardText.includes('MoneyCash.pw')) {
    console.log('Opening board selector...');
    await boardButton.click();
    await page.waitForTimeout(1500);
    const boardRow = await page.$('[data-test-id="board-row"]:has-text("MoneyCash.pw")');
    if (boardRow) {
      console.log('Clicking MoneyCash.pw row...');
      await boardRow.click();
      await page.waitForTimeout(1000);
    }
  }

  const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
  const isEnabled = publishBtn ? await publishBtn.isEnabled() : false;
  const pubText = publishBtn ? await publishBtn.innerText() : 'none';
  console.log('Publish button text:', pubText, '| isEnabled:', isEnabled);

  // Click Publish
  console.log('5. Clicking Publish button...');
  await publishBtn.click({ force: true });
  
  // Wait up to 18 seconds, taking screenshots every 3s
  let success = false;
  for (let i = 1; i <= 6; i++) {
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `scratch/debug_step3_wait_${i}.png` });
    const successModal = await page.$('text="Вы создали пин"');
    if (successModal) {
      console.log(`🎉 Success modal detected at wait ${i * 3}s!`);
      success = true;
      break;
    }
  }

  if (!success) {
    console.log('⚠️ Success modal was not detected after 18 seconds. Checking current screen state...');
  }

  // Check created pins
  console.log('6. Checking profile created pins...');
  await page.goto('https://www.pinterest.com/MoneyCashpw/_created/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'scratch/debug_step4_profile_created.png', fullPage: true });

  await browser.close();
}

debugPublish().catch(console.error);
