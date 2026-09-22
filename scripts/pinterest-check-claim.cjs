const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Checking Claimed Accounts in Pinterest...');
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
  await page.goto('https://www.pinterest.com/settings/claim/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  const sClaim = path.join(SCREENSHOTS_DIR, '28_claimed_accounts.png');
  await page.screenshot({ path: sClaim, fullPage: true });
  console.log('📸 Claim settings screenshot:', sClaim);

  // Read text content on page
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('Claim page text snippet:', pageText.slice(0, 500));

  await browser.close();
}

main();
