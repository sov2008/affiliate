const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
const pinImage = 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_1_whatsapp_1000x1500.png';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Test Fill & Publish Pin 1] Starting...');

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

    // 1. Upload image
    console.log('📤 Uploading image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(pinImage);
      await sleep(3000);
    }

    // 2. Title using fill()
    console.log('✏️ Title...');
    const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
    if (titleArea) {
      await titleArea.fill('The 48-Hour WhatsApp Move: Anatomy of a Dating Scam');
      console.log('Title value in DOM:', await titleArea.inputValue());
      await sleep(500);
    }

    // 3. Description using fill()
    console.log('✏️ Description...');
    const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
    if (descArea) {
      if (descArea.tagName === 'TEXTAREA' || (await descArea.getAttribute('role')) !== 'combobox') {
        await descArea.fill('Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams. Read full forensic investigation on FlirtCheck.');
      } else {
        await descArea.click();
        await page.keyboard.press('Control+A');
        await page.keyboard.type('Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams. Read full forensic investigation on FlirtCheck.');
      }
      await sleep(500);
    }

    // 4. Link using fill()
    console.log('✏️ Destination Link...');
    const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
    if (linkArea) {
      await linkArea.fill('https://flirtcheck.site/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/');
      console.log('Link value in DOM:', await linkArea.inputValue());
      await linkArea.press('Tab');
      await sleep(1000);
    }

    // Check errors or button status
    const btnStatus = await page.evaluate(() => {
      const btn = document.querySelector('[data-test-id="board-dropdown-save-button"]');
      if (!btn) return { exists: false };
      return {
        exists: true,
        text: btn.innerText,
        disabled: btn.disabled,
        ariaDisabled: btn.getAttribute('aria-disabled'),
        className: btn.className
      };
    });
    console.log('Save button status before board change:', JSON.stringify(btnStatus));

    // Screenshot state
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '26_state_after_fill.png'), fullPage: true });

    // If button is still disabled, let's see why
    if (btnStatus.disabled || btnStatus.ariaDisabled === 'true') {
      console.log('Button is disabled. Checking board selector...');
      // Click board selector
      const boardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
      if (boardBtn) {
        await boardBtn.click();
        await sleep(1500);
        // Let's click on the first board in the list
        const firstBoard = await page.$('[data-test-id="board-row"], [role="option"], [data-test-id*="board"]');
        if (firstBoard) {
          console.log('Clicking first board option...');
          await firstBoard.click();
          await sleep(1500);
        }
      }
    }

    // Check button again
    const btnStatus2 = await page.evaluate(() => {
      const btn = document.querySelector('[data-test-id="board-dropdown-save-button"]');
      return btn ? { text: btn.innerText, disabled: btn.disabled, ariaDisabled: btn.getAttribute('aria-disabled') } : null;
    });
    console.log('Save button status after board click:', JSON.stringify(btnStatus2));

    const finalSaveBtn = await page.$('[data-test-id="board-dropdown-save-button"]');
    if (finalSaveBtn) {
      console.log('🚀 Clicking Save/Publish Button...');
      await finalSaveBtn.click({ force: true });
      await sleep(10000);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '27_published_success.png'), fullPage: true });
    console.log('📸 Screenshot saved: 27_published_success.png');

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main();
