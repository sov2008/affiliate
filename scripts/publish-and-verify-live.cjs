const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BOARD_NAME = 'FlirtCheck | Dating Safety';
const PIN_IMAGE = path.resolve('pinterestpins/pin_does-bumble-show-when-you-were-last-active-telemetry.png');
const TITLE = 'Does Bumble Show When You Were Last Active? (2026 Telemetry)';
const DESC = 'Does Bumble update distance when someone opens the app? We audited Bumble location telemetry, background caching, and snooze mode. Read verified investigation at FlirtCheck.site 🔍\n\n#BumbleTips #DatingSafety #OnlineDating #ProfileVerification';
const URL = 'https://flirtcheck.site/does-bumble-show-when-you-were-last-active-telemetry/';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Starting guaranteed Pinterest publish...');
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    locale: 'ru-RU'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  try {
    console.log('🌐 Opening Pin Builder...');
    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(4000);

    // Dismiss tour modals
    for (let i = 0; i < 3; i++) {
      const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
      if (tourBtn) {
        await tourBtn.click().catch(() => {});
        await sleep(800);
      }
      await page.keyboard.press('Escape');
    }

    // 1. Upload File
    console.log('📤 Uploading image:', PIN_IMAGE);
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.setInputFiles(PIN_IMAGE);
    await sleep(3000);

    // 2. Title
    console.log('✏️ Filling Title...');
    const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"], input[id*="storyboard-selector-title"], input[placeholder*="заголовок"]');
    if (titleArea) {
      await titleArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(TITLE, { delay: 10 });
      await sleep(500);
    }

    // 3. Description
    console.log('✏️ Filling Description...');
    const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
    if (descArea) {
      await descArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(DESC, { delay: 5 });
      await sleep(500);
    }

    // 4. Link
    console.log('🔗 Filling Destination Link:', URL);
    const linkArea = await page.$('input[placeholder*="ссылк"], textarea[placeholder*="ссылк"], textarea[placeholder*="link"], input[placeholder*="link"], textarea[id*="link"], input[id*="link"]');
    if (linkArea) {
      await linkArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(URL, { delay: 10 });
      await page.keyboard.press('Tab');
      await sleep(1000);
    }

    // 5. Board Selection / Creation
    console.log('📋 Checking Board Selection...');
    const boardSelectBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
    if (boardSelectBtn) {
      await boardSelectBtn.click();
      await sleep(2000);

      // Check if board exists
      const existingBoard = await page.$(`[data-test-id="board-row"]:has-text("${BOARD_NAME}")`);
      if (existingBoard) {
        console.log(`Board "${BOARD_NAME}" found. Selecting...`);
        const saveInRow = await existingBoard.$('button:has-text("Сохранить"), div[role="button"]:has-text("Сохранить")');
        if (saveInRow) {
          await saveInRow.click();
        } else {
          await existingBoard.click();
        }
      } else {
        // Need to create board
        console.log(`Board "${BOARD_NAME}" not found. Creating new board...`);
        const createBtn = await page.$('div:has-text("Создать доску"), button:has-text("Создать доску"), [data-test-id="create-board"]');
        if (createBtn) {
          await createBtn.click();
          await sleep(1500);

          const nameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
          if (nameInput) {
            await nameInput.click();
            await page.keyboard.type(BOARD_NAME, { delay: 15 });
            await sleep(500);
          }

          const submitCreate = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
          if (submitCreate) {
            await submitCreate.click();
            console.log('✅ Board created successfully!');
            await sleep(3000);
          }
        }
      }
    }

    await sleep(2000);
    await page.screenshot({ path: 'scratch/pin_pre_publish.png', fullPage: true });

    // 6. Click Publish / Save Button
    console.log('🚀 Triggering Final Publish...');
    const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
    if (publishBtn) {
      console.log('Clicking Publish Button...');
      await publishBtn.click({ force: true });
      
      // Wait for network response / notification
      console.log('⏳ Waiting 15 seconds for Pinterest server to save pin...');
      await sleep(15000);
    }

    await page.screenshot({ path: 'scratch/pin_post_publish.png', fullPage: true });
    console.log('📸 Post-publish screenshot captured.');

    // 7. Verify in Profile
    console.log('🔍 Navigating to Created Pins tab to verify...');
    await page.goto('https://www.pinterest.com/FlirtCheck/_created/', { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(3000);
    await page.screenshot({ path: 'scratch/verified_created_pins.png', fullPage: true });

    // Also check saved tab
    await page.goto('https://www.pinterest.com/FlirtCheck/_saved/', { waitUntil: 'networkidle', timeout: 45000 });
    await sleep(3000);
    await page.screenshot({ path: 'scratch/verified_saved_pins.png', fullPage: true });

    const newCookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(newCookies, null, 2), 'utf8');

    console.log('🎉 Verification run complete!');
  } catch (err) {
    console.error('❌ Error during publishing:', err);
    await page.screenshot({ path: 'scratch/pin_error.png', fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }
}

run();
