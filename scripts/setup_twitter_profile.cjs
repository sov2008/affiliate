const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function updateProfile() {
  console.log('🚀 Starting X Profile Update for FlirtCheck Desk...');

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
  await sleep(5000);

  await page.screenshot({ path: 'scratch/x_profile_before.png' });
  console.log('Captured before screenshot');

  // Look for Edit profile button
  console.log('Looking for Edit Profile button...');
  const editBtn = page.locator('a[href="/settings/profile"], [data-testid="editProfileButton"], button:has-text("Изменить профиль"), button:has-text("Edit profile")').first();
  await editBtn.waitFor({ state: 'visible', timeout: 15000 });
  await editBtn.click();
  await sleep(3000);

  await page.screenshot({ path: 'scratch/x_profile_modal.png' });

  // 1. Upload Avatar
  const avatarPath = path.resolve('scratch/avatar_flirtcheck.png');
  if (fs.existsSync(avatarPath)) {
    console.log('Uploading avatar from', avatarPath);
    // Twitter has hidden file inputs for avatar and header
    const fileInputs = page.locator('input[type="file"][data-testid="fileInput"]');
    const count = await fileInputs.count();
    console.log(`Found ${count} file input(s)`);

    if (count > 0) {
      // First is usually avatar or banner. In Twitter edit modal, avatar has testid or is the first/second
      // Let's check avatar specific selector or upload to the first input
      await fileInputs.first().setInputFiles(avatarPath);
      await sleep(2500);

      // In Twitter, avatar upload pops up a crop dialog with "Apply" button
      const applyBtn = page.locator('[data-testid="applyButton"], button:has-text("Применить"), button:has-text("Apply")').first();
      if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        console.log('Clicking Apply on avatar cropper...');
        await applyBtn.click();
        await sleep(2000);
      }
    }
  }

  // 2. Set Name
  console.log('Setting Display Name...');
  const nameInput = page.locator('input[name="displayName"], input[autocomplete="name"]').first();
  if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await nameInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await nameInput.fill('FlirtCheck | Dating Safety Lab');
    await sleep(500);
  }

  // 3. Set Bio
  console.log('Setting Bio...');
  const bioInput = page.locator('textarea[name="description"]').first();
  if (await bioInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await bioInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await bioInput.fill('Independent investigative desk exposing online dating scams, AI deepfakes, bot farms & algorithm mechanics. Stay verified, date smart.');
    await sleep(500);
  }

  // 4. Set Location
  console.log('Setting Location...');
  const locationInput = page.locator('input[name="location"]').first();
  if (await locationInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await locationInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await locationInput.fill('London, UK');
    await sleep(500);
  }

  // 5. Set Website
  console.log('Setting Website...');
  const urlInput = page.locator('input[name="url"]').first();
  if (await urlInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await urlInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await urlInput.fill('https://flirtcheck.site');
    await sleep(500);
  }

  await page.screenshot({ path: 'scratch/x_profile_before_save.png' });

  // 6. Save Profile
  console.log('Saving profile...');
  const saveBtn = page.locator('[data-testid="Profile_Save_Button"], button:has-text("Сохранить"), button:has-text("Save")').first();
  await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
  await saveBtn.click();
  await sleep(5000);

  // Take final screenshot of the profile page
  await page.goto('https://x.com/TheWeedsorg', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(4000);
  await page.screenshot({ path: 'scratch/x_profile_after_setup.png' });
  console.log('Profile setup complete! Screenshot saved.');

  // Update cookies
  const updatedCookies = await context.cookies();
  fs.writeFileSync('twitter_cookies.json', JSON.stringify(updatedCookies, null, 2), 'utf8');

  await browser.close();
}

updateProfile().catch(err => {
  console.error('Profile setup error:', err);
  process.exit(1);
});
