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

  // 1. Upload
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles(pinImage);
    await sleep(3000);
  }

  // 2. Title
  const titleArea = await page.$('textarea[placeholder*="название"], textarea[placeholder*="Title"], textarea[id*="title"]');
  if (titleArea) {
    await titleArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('The 48-Hour WhatsApp Move: Anatomy of a Dating Scam', { delay: 10 });
    await sleep(500);
  }

  // 3. Description
  const descArea = await page.$('[aria-label="Добавьте описание пина"], [role="combobox"], textarea[id*="description"], [placeholder*="описание"]');
  if (descArea) {
    await descArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Why do dating app matches urge you to move to WhatsApp within 48 hours? Discover the psychological trap behind crypto romance scams. Read full forensic investigation on FlirtCheck.', { delay: 5 });
    await sleep(500);
  }

  // 4. Link
  const linkArea = await page.$('textarea[placeholder*="ссылк"], textarea[placeholder*="link"], textarea[id*="link"]');
  if (linkArea) {
    await linkArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('https://flirtcheck.site/posts/the-48-hour-whatsapp-move-crypto-dating-funnel-anatomy/', { delay: 10 });
    // blur the link input so validation triggers
    await page.keyboard.press('Tab');
    await sleep(1000);
  }

  // Look at board selector
  const boardInfo = await page.evaluate(() => {
    const boardDropdown = document.querySelector('[data-test-id="board-dropdown-select-button"]');
    return boardDropdown ? boardDropdown.innerText : 'not found';
  });
  console.log('Current board selected:', boardInfo);

  // Check what buttons exist for publish/save
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText,
      disabled: b.disabled,
      testid: b.getAttribute('data-test-id'),
      ariaLabel: b.getAttribute('aria-label'),
      className: b.className
    })).filter(b => b.text.includes('Опублик') || b.text.includes('Сохран') || (b.testid && b.testid.includes('save')));
  });
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  // Try clicking publish button
  const pubBtn = await page.$('[data-test-id="board-dropdown-save-button"]');
  if (pubBtn) {
    console.log('Clicking board-dropdown-save-button...');
    await pubBtn.click();
    await sleep(3000);
  }

  // Find all validation messages or error tooltips
  const validationMessages = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('*'));
    return els.filter(el => {
      const text = (el.innerText || '').trim();
      const style = window.getComputedStyle(el);
      const isRed = style.color.includes('230, 0, 35') || style.color.includes('204, 0, 0') || style.borderColor.includes('230, 0, 35');
      return isRed || el.getAttribute('aria-invalid') === 'true' || text.includes('ошибк') || (el.getAttribute('id') || '').includes('error');
    }).map(el => ({
      tag: el.tagName,
      id: el.id,
      text: el.innerText ? el.innerText.slice(0, 150) : '',
      ariaInvalid: el.getAttribute('aria-invalid')
    }));
  });
  console.log('Validation messages:', JSON.stringify(validationMessages, null, 2));

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '22_validation_inspection.png'), fullPage: true });

  await browser.close();
}

main();
