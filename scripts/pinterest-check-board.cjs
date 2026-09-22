const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
const pinImage = 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_1_whatsapp_1000x1500.png';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // dismiss tour
  for (let i = 0; i < 3; i++) {
    const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
    if (tourBtn) {
      await tourBtn.click().catch(() => {});
      await sleep(1000);
    }
    await page.keyboard.press('Escape');
  }

  // Upload image
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(pinImage);
    await sleep(3000);
  }

  // Inspect the board dropdown
  console.log('Inspecting board selection...');
  const selectBoardBtn = await page.$('[data-test-id="board-dropdown-select-button"]');
  if (selectBoardBtn) {
    console.log('Clicking board selector dropdown...');
    await selectBoardBtn.click();
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '23_board_dropdown_open.png') });

    // list items in dropdown
    const dropdownItems = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="dialog"] *, [role="listbox"] *, [data-test-id*="board"] *'))
        .filter(el => el.innerText && el.innerText.length > 2)
        .map(el => el.innerText.trim())
        .filter((val, idx, arr) => arr.indexOf(val) === idx);
    });
    console.log('Board dropdown items:', dropdownItems.slice(0, 15));
  }

  await browser.close();
}

main();
