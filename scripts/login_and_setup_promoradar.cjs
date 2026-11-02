const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [PromoRadarStore Login & Setup] Launching browser...');
  const avatarPath = '/var/www/affiliate/scratch/stitch_pinterest/promoradar_brand_avatar.png';
  const bannerPath = '/var/www/affiliate/scratch/stitch_pinterest/stitch_pinterest_banner.jpg';

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const page = await context.newPage();

  try {
    console.log('🌐 [1/5] Navigating to https://www.pinterest.com/login...');
    await page.goto('https://www.pinterest.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(4000);

    // Accept cookies banner if present
    try {
      const acceptBtn = await page.$('button:has-text("Accept"), button:has-text("Allow all"), button:has-text("Принять все")');
      if (acceptBtn) {
        await acceptBtn.click();
        await sleep(1000);
      }
    } catch (e) {}

    console.log('🔑 [2/5] Entering credentials for PromoRadarStore...');
    const emailInput = await page.waitForSelector('input[id="email"], input[name="id"], input[type="email"]', { timeout: 15000 });
    await emailInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('sapegin.oleg@gmail.com', { delay: 30 });
    await sleep(600);

    const passInput = await page.waitForSelector('input[id="password"], input[name="password"], input[type="password"]', { timeout: 10000 });
    await passInput.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('j6MF5jr@CjuFFZY', { delay: 30 });
    await sleep(600);

    console.log('🔘 [3/5] Submitting login...');
    const submitBtn = await page.$('button[type="submit"], [data-test-id="registerFormSubmitButton"]');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }

    console.log('⏳ Waiting 12s for authentication response...');
    await sleep(12000);

    console.log('📍 Current URL after login:', page.url());
    await page.screenshot({ path: '/var/www/affiliate/scratch/login_promoradar_response.png' });

    // Save cookies immediately
    const cookies = await context.cookies();
    fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
    console.log(`🍪 Saved ${cookies.length} session cookies to /var/www/affiliate/pinterest_cookies.json`);

    // Check if we reached profile or settings
    console.log('🌐 [4/5] Navigating to profile settings...');
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(5000);

    console.log('Profile settings URL:', page.url());
    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_settings_loaded.png' });

    // 1. Upload Avatar
    console.log('🖼️ Uploading canonical brand avatar...');
    const changeAvatarBtn = await page.$('button:has-text("Изменить"), button:has-text("Change")');
    if (changeAvatarBtn && fs.existsSync(avatarPath)) {
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
      await changeAvatarBtn.click();
      const fc = await fileChooserPromise;
      if (fc) {
        await fc.setFiles(avatarPath);
      } else {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) await fileInput.setInputFiles(avatarPath);
      }
      console.log('✅ Avatar file selected.');
      await sleep(4000);
    }

    // 2. Business Name
    console.log('✏️ Setting Name...');
    const nameInput = await page.$('#business_name, input[name="business_name"], #first_name');
    if (nameInput) {
      await nameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('PromoRadar | Verified Promo Codes & Black Friday Deals', { delay: 15 });
      console.log('✅ Name filled.');
      await sleep(500);
    }

    // 3. About
    console.log('✏️ Setting About...');
    const aboutInput = await page.$('#about, textarea[name="about"]');
    if (aboutInput) {
      await aboutInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('100% verified checkout promo codes, exclusive partner coupons & limited-time Black Friday deals. Save up to 85% at top brands. Tested daily. ⚡', { delay: 10 });
      console.log('✅ About filled.');
      await sleep(500);
    }

    // 4. Website URL
    console.log('✏️ Setting Website...');
    const websiteInput = await page.$('#website_url, input[name="website_url"]');
    if (websiteInput) {
      await websiteInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('https://promoradar.store/', { delay: 10 });
      console.log('✅ Website URL filled.');
      await sleep(500);
    }

    // 5. Save Button
    console.log('💾 [5/5] Saving Profile Changes...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.scrollIntoViewIfNeeded();
      await sleep(500);
      await saveBtn.click();
      console.log('🔘 Clicked Save button!');
      await sleep(6000);
    }

    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_saved_success.png' });

    // Update cookies again
    const finalCookies = await context.cookies();
    fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(finalCookies, null, 2), 'utf8');
    console.log('🎉 Profile setup complete! Cookies updated.');

  } catch (err) {
    console.error('❌ Error during setup:', err);
    await page.screenshot({ path: '/var/www/affiliate/scratch/setup_error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

