const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function uploadBannerAndAvatar() {
  console.log('🚀 Uploading official Banner and Avatar to X Profile...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'ru-RU'
  });

  const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();

  console.log('Navigating to user profile...');
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  const editBtn = page.locator('a[href="/settings/profile"], [data-testid="editProfileButton"], button:has-text("Изменить профиль"), button:has-text("Edit profile")').first();
  await editBtn.waitFor({ state: 'visible', timeout: 15000 });
  await editBtn.click();
  await sleep(3000);

  const bannerPath = path.resolve('scratch/twitter_banner.png');
  const avatarPath = path.resolve('scratch/avatar_flirtcheck.png');

  const fileInputs = page.locator('input[type="file"][data-testid="fileInput"]');
  const count = await fileInputs.count();
  console.log(`Found ${count} file input(s) in edit profile dialog`);

  // 1. Upload Banner (first input)
  if (count > 0 && fs.existsSync(bannerPath)) {
    console.log('Uploading Banner...');
    await fileInputs.nth(0).setInputFiles(bannerPath);
    await sleep(2500);
    const applyBtn = page.locator('[data-testid="applyButton"], button:has-text("Применить"), button:has-text("Apply")').first();
    if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Clicking Apply on banner cropper...');
      await applyBtn.click();
      await sleep(2500);
    }
  }

  // 2. Upload Avatar (second input)
  if (count > 1 && fs.existsSync(avatarPath)) {
    console.log('Uploading Avatar...');
    await fileInputs.nth(1).setInputFiles(avatarPath);
    await sleep(2500);
    const applyBtn = page.locator('[data-testid="applyButton"], button:has-text("Применить"), button:has-text("Apply")').first();
    if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('Clicking Apply on avatar cropper...');
      await applyBtn.click();
      await sleep(2500);
    }
  }

  await page.screenshot({ path: 'scratch/x_modal_after_uploads.png' });

  // 3. Click Save
  console.log('Clicking Save...');
  const saveBtn = page.locator('[data-testid="Profile_Save_Button"], button:has-text("Сохранить"), button:has-text("Save")').first();
  await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
  await saveBtn.click();
  await sleep(6000);

  // 4. Verify Final Profile
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);
  await page.screenshot({ path: 'scratch/x_final_profile_view.png' });
  console.log('Done! Final profile screenshot captured.');

  const updatedCookies = await context.cookies();
  fs.writeFileSync('twitter_cookies.json', JSON.stringify(updatedCookies, null, 2), 'utf8');

  await browser.close();
}

uploadBannerAndAvatar().catch(err => {
  console.error('Upload error:', err);
  process.exit(1);
});
