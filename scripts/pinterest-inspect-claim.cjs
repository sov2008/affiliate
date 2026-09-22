const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

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
  await page.goto('https://www.pinterest.com/settings/claim/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(4000);

  // find all texts and buttons
  const claimData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, a, h1, h2, h3, div[role="button"], span'))
      .filter(el => {
        const t = (el.innerText || '').trim();
        return t.length > 2 && (t.includes('Связать') || t.includes('Подтверд') || t.includes('Отвязать') || t.includes('moneycash') || t.includes('сайт') || t.includes('Веб'));
      })
      .map(el => ({ tag: el.tagName, text: el.innerText.trim(), role: el.getAttribute('role') }))
      .filter((v, i, a) => a.findIndex(t => t.text === v.text) === i);
  });

  console.log('Claim elements:', JSON.stringify(claimData, null, 2));
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '29_claim_details.png') });

  await browser.close();
}

main();
