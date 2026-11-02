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

  // Set file on filechooser
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.locator('button:has-text("Изменить"), button:has-text("Change")').first().click(),
  ]);

  console.log('Setting pure radar avatar file...');
  await fileChooser.setFiles('/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png');
  await page.waitForTimeout(4000);

  const saveBtn = page.locator('button:has-text("Сохранить"), button:has-text("Save")').first();
  if (await saveBtn.isEnabled().catch(() => false)) {
    await saveBtn.click();
    console.log('Save button clicked! Waiting 5s...');
    await page.waitForTimeout(5000);
  }

  // Update cookies
  const freshCookies = await ctx.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(freshCookies, null, 2), 'utf8');

  // Verify
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/live_avatar_radar_done.png' });
  console.log('Saved screenshot to live_avatar_radar_done.png');

  await browser.close();
})();

