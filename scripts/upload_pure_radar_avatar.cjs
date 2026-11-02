const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function uploadPureRadarAvatar() {
  console.log('🚀 Updating Pinterest avatar to Pure Radar...');
  const avatarPath = '/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png';

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'ru-RU'
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // Upload avatar
  const changeAvatarBtn = await page.$('button:has-text("Изменить"), button:has-text("Change")');
  if (changeAvatarBtn) {
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
    await changeAvatarBtn.click();
    const fc = await fileChooserPromise;
    if (fc) {
      await fc.setFiles(avatarPath);
    } else {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) await fileInput.setInputFiles(avatarPath);
    }
    console.log('✅ New avatar file selected.');
    await sleep(4000);
  }

  // Save changes
  const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
  if (saveBtn) {
    await saveBtn.scrollIntoViewIfNeeded();
    await sleep(500);
    await saveBtn.click();
    console.log('🔘 Clicked Save button!');
    await sleep(6000);
  }

  // Verify on public page
  console.log('Verifying on public profile...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/pure_radar_profile_live.png', fullPage: true });
  console.log('📸 Screenshot saved to pure_radar_profile_live.png');

  const finalCookies = await context.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(finalCookies, null, 2), 'utf8');

  await browser.close();
  console.log('🎉 Done!');
}

uploadPureRadarAvatar().catch(console.error);

