const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  context.addCookies(JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8')));
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  // dismiss modal
  for (let i = 0; i < 4; i++) {
    const b = await page.$('button:has-text("Перейти к обзору"), [aria-label="Отмена"], button:has-text("ОК")');
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(1000); }
    await page.keyboard.press('Escape');
  }

  // Scroll down
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'C:/Users/user/.gemini/antigravity-ide/brain/93f4d295-5965-4e67-afd8-acb47c16a2a6/screenshots/18_pin_builder_scrolled.png', fullPage: true });

  const textSnippets = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('label, p, span, div')).map(el => el.innerText.trim()).filter(t => t.length > 5 && t.length < 80).slice(0, 40);
  });
  console.log('Text snippets:', textSnippets);

  await browser.close();
}

main();
