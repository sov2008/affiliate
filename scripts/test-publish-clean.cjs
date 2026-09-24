const { chromium } = require('playwright');
const fs = require('fs');

async function test() {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, locale: 'ru-RU' });
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Opening Pin Builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // 1. Upload
  console.log('Uploading pin image...');
  const fileInput = await page.$('input[type="file"]');
  await fileInput.setInputFiles('pinterestpins/pin_does-bumble-show-when-you-were-last-active-telemetry.png');
  await page.waitForTimeout(3000);

  // 2. Title
  console.log('Filling title...');
  const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], input[placeholder*="заголовок"], input[id*="title"]');
  if (titleArea) {
    await titleArea.click();
    await page.keyboard.type('Does Bumble Show When You Were Last Active? (2026 Telemetry)');
    await page.waitForTimeout(500);
  }

  // 3. Description
  console.log('Filling description...');
  const descArea = await page.$('[aria-label="Добавьте описание пина"], textarea[id*="description"], [placeholder*="описание"]');
  if (descArea) {
    await descArea.click();
    await page.keyboard.type('Does Bumble update distance when someone opens the app? Full investigation at FlirtCheck.site 🔍 #BumbleTips #DatingSafety #OnlineDating');
    await page.waitForTimeout(500);
  }

  // 4. Select board MoneyCash.pw
  console.log('Selecting board...');
  const boardSelectBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (boardSelectBtn) {
    await boardSelectBtn.click();
    await page.waitForTimeout(1500);
    const boardRow = await page.$('[data-test-id="board-row"]:has-text("MoneyCash.pw")');
    if (boardRow) {
      console.log('Selecting MoneyCash.pw board...');
      const saveInRow = await boardRow.$('button:has-text("Сохранить"), div[role="button"]:has-text("Сохранить")');
      if (saveInRow) {
        await saveInRow.click();
      } else {
        await boardRow.click();
      }
      await page.waitForTimeout(1000);
    }
  }

  // 5. Click publish
  console.log('Publishing without blocked link...');
  const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
  if (publishBtn) {
    await publishBtn.click({ force: true });
    console.log('Waiting 10s after publish click...');
    await page.waitForTimeout(10000);
  }

  await page.screenshot({ path: 'scratch/test_no_link_result.png', fullPage: true });
  console.log('Screenshot taken: scratch/test_no_link_result.png');

  // Verify created pins
  await page.goto('https://www.pinterest.com/MoneyCashpw/_created/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'scratch/test_created_after_no_link.png', fullPage: true });

  await browser.close();
}

test().catch(console.error);
