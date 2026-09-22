const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const TEST_URLS = [
  'https://flirtcheck.site/',
  'https://flirtcheck.site/posts/dating-profile-photo-order-retention-click-through-rate/',
  'https://flirtcheck.site/posts/tinder-elo-score-algorithm-dating-desirability-breakdown/',
  'https://moneycash.pw/',
  'https://moneycash.pw/posts/tinder-elo/',
  'https://t.me/flirtcheck'
];

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded' });
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

  const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
  if (!linkArea) {
    console.error('Link area not found');
    await browser.close();
    return;
  }

  for (const url of TEST_URLS) {
    await linkArea.fill(url);
    await linkArea.press('Tab');
    await sleep(2500);

    const isBlocked = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('*')).find(e => (e.innerText || '').includes('Ссылка заблокирована'));
      return !!el;
    });

    console.log(`URL: ${url} -> Blocked: ${isBlocked}`);
  }

  await browser.close();
}

main();
