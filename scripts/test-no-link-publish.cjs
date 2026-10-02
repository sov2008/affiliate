const { chromium } = require('playwright');
const fs = require('fs');

async function testNoLink() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  if (fs.existsSync('pinterest_cookies.json')) {
    await context.addCookies(JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8')));
  }
  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // dismiss dialogs
  for (let i = 0; i < 3; i++) {
    const btn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
    if (btn) await btn.click().catch(() => {});
    await page.keyboard.press('Escape');
  }

  // Upload image
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles('D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_2026-dating-safety-blueprint-verify-optimize-protect-your-online-.png');
    await page.waitForTimeout(3000);
  }

  // Fill title
  const titleInput = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i], textarea[placeholder*="title" i], [data-test-id="editor-title"] textarea').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('2026 Dating Safety Blueprint: Verify, Optimize, & Protect');
  }

  // Fill description
  const descArea = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"], [data-test-id="editor-description"] div[contenteditable="true"]').first();
  if (await descArea.isVisible().catch(() => false)) {
    await descArea.click();
    await descArea.fill('Discover expert tactics on dating safety and profile verification. Comprehensive checklist for modern romance safety.');
  }

  // Check publish button status without any link!
  const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
  const disabled = publishBtn ? await publishBtn.getAttribute('disabled') : 'null';
  const ariaDisabled = publishBtn ? await publishBtn.getAttribute('aria-disabled') : 'null';
  console.log('Publish button exists:', !!publishBtn, 'disabled:', disabled, 'ariaDisabled:', ariaDisabled);

  await page.screenshot({ path: 'scratch/pin_builder_no_link.png', fullPage: true });
  console.log('Screenshot saved to scratch/pin_builder_no_link.png');
  await browser.close();
}

testNoLink().catch(console.error);
