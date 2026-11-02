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

  // Directly set input[type="file"]
  const fileInput = await page.$('input[type="file"]');
  if (fileInput) {
    console.log('Injecting pure_radar_avatar.png...');
    await fileInput.setInputFiles('/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png');
    await page.waitForTimeout(4000);

    const saveBtn = page.locator('button[type="submit"], button:has-text("Сохранить"), button:has-text("Save")').first();
    if (await saveBtn.isEnabled().catch(() => false)) {
      await saveBtn.click();
      console.log('Clicked Save avatar! ✅');
      await page.waitForTimeout(4000);
    }
  }

  // Update cookies
  const freshCookies = await ctx.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(freshCookies, null, 2), 'utf8');

  // Verify on profile
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/verified_final_full_profile.png' });
  console.log('Final verified screenshot captured! 📸');

  await browser.close();
})();

