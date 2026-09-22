const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Clicking "Подтвердить" website...');
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
  await page.goto('https://www.pinterest.com/settings/claim/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);

  // Click "Подтвердить"
  const confirmBtn = await page.$('button:has-text("Подтвердить")');
  if (confirmBtn) {
    console.log('Clicking "Подтвердить" button...');
    await confirmBtn.click();
    await sleep(3000);
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '30_claim_modal.png') });

  // Extract modal text
  const modalText = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    return modal ? modal.innerText : 'No modal found';
  });

  console.log('Modal text:\n', modalText);

  await browser.close();
}

main();
