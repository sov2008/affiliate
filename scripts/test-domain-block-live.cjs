const { chromium } = require('playwright');
const fs = require('fs');

async function testDomainStatus() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  if (fs.existsSync('pinterest_cookies.json')) {
    await context.addCookies(JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8')));
  }
  const page = await context.newPage();

  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Close modals
  for (let i = 0; i < 3; i++) {
    const btn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
    if (btn) await btn.click().catch(() => {});
    await page.keyboard.press('Escape');
  }

  // Upload image
  console.log('Uploading sample image...');
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    await fileInput.setInputFiles('D:\\WEB\\antigravity\\affiliate\\scratch\\pins\\pin_2026-dating-safety-blueprint-verify-optimize-protect-your-online-.png');
    await page.waitForTimeout(3000);
  }

  // Find link field
  console.log('Entering link https://flirtcheck.site/test ...');
  const linkInput = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="целевую ссылку" i], textarea[placeholder*="ссылк" i], textarea[placeholder*="destination" i], input[placeholder*="link" i]').first();
  await linkInput.waitFor({ state: 'visible', timeout: 8000 });
  await linkInput.fill('https://flirtcheck.site/test');
  await page.waitForTimeout(2000);

  // Click outside to trigger validation
  await page.click('body', { position: { x: 10, y: 10 } });
  await page.waitForTimeout(2000);

  // Check for error messages / alerts
  const errorElements = await page.$$eval('[role="alert"], [data-test-id*="error"], span:has-text("заблокировали"), div:has-text("заблокировали"), span:has-text("blocked"), div:has-text("blocked"), span:has-text("спам"), div:has-text("спам")', els => els.map(e => e.innerText.trim()));
  console.log('Validation / error elements:', errorElements.filter(Boolean));

  await page.screenshot({ path: 'scratch/pin_builder_link_validation.png', fullPage: true });
  console.log('Saved screenshot to scratch/pin_builder_link_validation.png');

  await browser.close();
}

testDomainStatus().catch(console.error);
