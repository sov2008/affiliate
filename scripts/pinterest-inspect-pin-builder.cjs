const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: false, args: ['--start-maximized'] });
  const context = await browser.newContext();
  context.addCookies(JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8')));
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // Dismiss intro modal
  try {
    const okBtn = await page.$('button:has-text("OK"), button:has-text("Хорошо"), button:has-text("Понятно")');
    if (okBtn) {
      await okBtn.click();
      console.log('✅ Dismissed modal with OK button');
      await sleep(1500);
    }
  } catch (e) {
    console.log('No modal to dismiss:', e.message);
  }

  const sBuilder = path.join(SCREENSHOTS_DIR, '16_pin_builder_active.png');
  await page.screenshot({ path: sBuilder, fullPage: true });
  console.log('📸 Screenshot saved:', sBuilder);

  // Inspect all visible inputs, textareas, buttons
  const formElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, textarea, button, [role="button"], [role="combobox"]')).map(el => ({
      tag: el.tagName,
      id: el.id,
      name: el.name || el.getAttribute('name'),
      type: el.type,
      role: el.getAttribute('role'),
      placeholder: el.placeholder,
      text: el.innerText ? el.innerText.trim().slice(0, 40) : '',
      ariaLabel: el.getAttribute('aria-label'),
      dataTestId: el.getAttribute('data-test-id')
    })).filter(item => item.placeholder || item.text || item.ariaLabel || item.id || item.type === 'file');
  });

  console.log('📋 Form elements found:');
  console.log(JSON.stringify(formElements, null, 2));

  await browser.close();
}

main().catch(console.error);
