const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
const pinImage = 'D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_1_whatsapp_1000x1500.png';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Test Publish Pin 1] Starting...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  if (fs.existsSync('pinterest_cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  try {
    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // Dismiss tour modal
    for (let i = 0; i < 4; i++) {
      const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
      if (tourBtn) {
        await tourBtn.click().catch(() => {});
        await sleep(1000);
      }
      await page.keyboard.press('Escape');
    }

    // 1. Upload 1000x1500 PNG
    console.log('📤 Uploading 1000x1500 image...');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles(pinImage);
      console.log('✅ Image file set.');
      await sleep(4000);
    }

    // 2. Set Title
    console.log('✏️ Setting Title...');
    const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
    if (titleArea) {
      await titleArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('The 48-Hour WhatsApp Move: Anatomy of a Dating Scam', { delay: 10 });
      console.log('✅ Title set.');
      await sleep(500);
    }

    // 3. Set Description
    console.log('✏️ Setting Description...');
    const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
    if (descArea) {
      await descArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams and pig butchering syndicates. Read full forensic investigation on FlirtCheck.', { delay: 5 });
      console.log('✅ Description set.');
      await sleep(500);
    }

    // 4. Set Link
    console.log('✏️ Setting Link...');
    const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
    if (linkArea) {
      await linkArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('https://flirtcheck.site/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/', { delay: 10 });
      console.log('✅ Link set.');
      await sleep(500);
    }

    // Take pre-publish screenshot
    const sPre = path.join(SCREENSHOTS_DIR, '19_pin_1_ready_to_publish.png');
    await page.screenshot({ path: sPre, fullPage: true });
    console.log('📸 Pre-publish screenshot:', sPre);

    // 5. Click Publish
    console.log('🚀 Clicking "Опубликовать"...');
    const pubBtn = await page.$('[data-test-id="board-dropdown-save-button"], [role="button"]:has-text("Опубликовать"), button:has-text("Опубликовать")');
    if (pubBtn) {
      await pubBtn.click();
      console.log('🔘 Publish clicked! Waiting 10s for confirmation...');
      await sleep(10000);
    }

    const sDone = path.join(SCREENSHOTS_DIR, '20_pin_1_published_result.png');
    await page.screenshot({ path: sDone, fullPage: true });
    console.log('📸 Published result screenshot:', sDone);

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
