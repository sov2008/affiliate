const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const context = await browser.newContext({ locale: 'ru-RU' });
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);
  const page = await context.newPage();

  console.log('Opening edit-profile...');
  await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  // Business Name
  const nameInput = await page.$('#first_name, #business_name, input[name="first_name"]');
  if (nameInput) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('PromoRadar | Verified Deals & Coupons', { delay: 10 });
    console.log('✅ Name typed.');
  }

  // About
  const aboutInput = await page.$('#about, textarea[name="about"]');
  if (aboutInput) {
    await aboutInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('100% verified checkout promo codes, exclusive partner coupons & limited-time Black Friday deals. Save up to 85% at top brands. Tested daily. ⚡', { delay: 10 });
    console.log('✅ About typed.');
  }

  await page.waitForTimeout(1000);

  // Click Save
  const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
  if (saveBtn) {
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    console.log('🔘 Save button clicked!');
    await page.waitForTimeout(6000);
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/edit_profile_after_save.png', fullPage: true });

  const finalCookies = await context.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(finalCookies, null, 2), 'utf8');

  await browser.close();
  console.log('Done!');
})();

