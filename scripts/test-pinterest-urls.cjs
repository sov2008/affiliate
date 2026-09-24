const { chromium } = require('playwright');
const fs = require('fs');

async function testLinks() {
  const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, locale: 'ru-RU' });
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  const testUrls = [
    'https://flirtcheck.site/',
    'https://www.flirtcheck.site/',
    'https://flirtcheck.site/does-bumble-show-when-you-were-last-active-telemetry/'
  ];

  const linkArea = await page.$('input[placeholder*="ссылк"], textarea[placeholder*="ссылк"], input[placeholder*="link"], textarea[placeholder*="link"], input[id*="link"], textarea[id*="link"]');
  
  for (const u of testUrls) {
    console.log('Testing URL:', u);
    await linkArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(u);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(2500);

    const errorMsg = await page.$('div:has-text("Ссылка заблокирована"), span:has-text("Ссылка заблокирована"), [class*="error"]:has-text("Ссылка")');
    if (errorMsg && await errorMsg.isVisible()) {
      const txt = await errorMsg.innerText();
      console.log(`❌ URL [${u}] BLOCKED with:`, txt.replace(/\n+/g, ' '));
    } else {
      console.log(`✅ URL [${u}] ACCEPTED!`);
    }
  }

  await browser.close();
}

testLinks().catch(console.error);
