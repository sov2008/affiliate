const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await ctx.addCookies(cookies);
  const page = await ctx.newPage();

  console.log('Navigating to settings/edit-profile...');
  await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // 1. Click "Изменить"
  console.log('Clicking "Изменить"...');
  const changeBtn = page.locator('button:has-text("Изменить"), button:has-text("Change")').first();
  await changeBtn.click();
  await page.waitForTimeout(1000);

  // 2. Click "Выбрать фото" with filechooser expectation
  console.log('Clicking "Выбрать фото" with filechooser...');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser', { timeout: 10000 }),
    page.locator('text="Выбрать фото"').first().click()
  ]);

  console.log('Setting pure_radar_avatar.png...');
  await fileChooser.setFiles('/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png');
  await page.waitForTimeout(3500);

  // 3. Click Save
  const saveBtn = page.locator('button:has-text("Сохранить"), button:has-text("Save")').first();
  if (await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log('Save clicked! Waiting 5s...');
    await page.waitForTimeout(5000);
  }

  // Fresh cookies
  const freshCookies = await ctx.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(freshCookies, null, 2), 'utf8');

  // Verify on profile
  console.log('Verifying on profile...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/pure_radar_final_verified.png' });
  console.log('Done! Screenshot saved.');

  await browser.close();
})();

