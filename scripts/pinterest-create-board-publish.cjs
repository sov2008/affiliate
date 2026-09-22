const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
const pinImage = 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_1_whatsapp_1000x1500.png';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Create Board & Publish Pin 1] Starting...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();

  try {
    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // Dismiss tour
    for (let i = 0; i < 3; i++) {
      const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
      if (tourBtn) {
        await tourBtn.click().catch(() => {});
        await sleep(1000);
      }
      await page.keyboard.press('Escape');
    }

    // 1. Upload
    console.log('📤 Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(pinImage);
      await sleep(3000);
    }

    // 2. Title
    console.log('✏️ Title...');
    const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
    if (titleArea) {
      await titleArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('The 48-Hour WhatsApp Move: Anatomy of a Dating Scam', { delay: 10 });
      await sleep(500);
    }

    // 3. Description
    console.log('✏️ Description...');
    const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
    if (descArea) {
      await descArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams. Read full forensic investigation on FlirtCheck.', { delay: 5 });
      await sleep(500);
    }

    // 4. Link
    console.log('✏️ Link...');
    const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
    if (linkArea) {
      await linkArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('https://flirtcheck.site/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/', { delay: 10 });
      await page.keyboard.press('Tab');
      await sleep(1000);
    }

    // 5. Open Board Dropdown
    console.log('📋 Opening Board Dropdown...');
    const selectBoardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
    if (selectBoardBtn) {
      await selectBoardBtn.click();
      await sleep(2000);
    }

    // Check if board "Dating Safety & Scams" already exists or create it
    const createBoardBtn = await page.$('div:has-text("Создать доску"), button:has-text("Создать доску")');
    if (createBoardBtn) {
      console.log('✨ Creating new board: "Dating Safety & Scams"...');
      await createBoardBtn.click();
      await sleep(2000);

      // In the modal:
      const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
      if (nameInput) {
        await nameInput.click();
        await page.keyboard.type('Dating Safety & Scams', { delay: 10 });
        await sleep(500);
      }

      // Click "Создать" in the modal
      const modalCreateBtn = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
      if (modalCreateBtn) {
        await modalCreateBtn.click();
        console.log('✅ Board created!');
        await sleep(3000);
      }
    }

    // Now look at the top right publish/save button
    console.log('📸 Taking pre-publish screenshot...');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '24_ready_with_board.png'), fullPage: true });

    // Look for button with text "Сохранить" or "Опубликовать"
    console.log('🚀 Triggering Publish...');
    const publishTrigger = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
    if (publishTrigger) {
      const isEnabled = await publishTrigger.isEnabled();
      console.log('Publish button enabled:', isEnabled);
      if (isEnabled) {
        await publishTrigger.click();
      } else {
        // Evaluate click
        await page.evaluate(el => el.click(), publishTrigger);
      }
      console.log('⏳ Waiting 12s after publish...');
      await sleep(12000);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '25_publish_pin_1_final.png'), fullPage: true });
    console.log('📸 Final screenshot saved: 25_publish_pin_1_final.png');

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main();
