const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function updateProfile() {
  console.log('🚀 [Pinterest PromoRadar Profile Setup] Starting...');

  const avatarPath = '/var/www/affiliate/scratch/stitch_pinterest/promoradar_brand_avatar.png';
  if (!fs.existsSync(avatarPath)) {
    throw new Error(`Avatar file not found: ${avatarPath}`);
  }

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
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookiesPath = '/var/www/affiliate/pinterest_cookies.json';
  if (fs.existsSync(cookiesPath)) {
    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
    await context.addCookies(cookies);
    console.log('🍪 Session cookies injected.');
  }

  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to settings/profile...');
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(5000);

    console.log('Current URL:', page.url());
    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_step1_init.png' });

    // 1. Upload Avatar
    console.log('🖼️ Handling avatar change...');
    const changeBtn = await page.$('button:has-text("Изменить"), button:has-text("Change")');
    if (changeBtn) {
      console.log('Found change button, clicking...');
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
      await changeBtn.click();
      const fileChooser = await fileChooserPromise;
      if (fileChooser) {
        await fileChooser.setFiles(avatarPath);
        console.log('✅ Avatar file chosen via fileChooser!');
        await sleep(4000);
      } else {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.setInputFiles(avatarPath);
          console.log('✅ Avatar set directly on input[type=file]!');
          await sleep(4000);
        }
      }
    } else {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(avatarPath);
        console.log('✅ Avatar set directly on input[type=file]!');
        await sleep(4000);
      } else {
        console.log('ℹ️ No change avatar button/input found on page');
      }
    }

    // 2. Business Name
    console.log('✏️ Updating Business Name...');
    const nameInput = await page.$('#business_name, input[name="business_name"], #first_name');
    if (nameInput) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('PromoRadar | Verified Promo Codes & Black Friday Deals', { delay: 10 });
      console.log('✅ Business Name set.');
      await sleep(500);
    } else {
      console.log('⚠️ Name input not found');
    }

    // 3. About
    console.log('✏️ Updating About...');
    const aboutInput = await page.$('#about, textarea[name="about"]');
    if (aboutInput) {
      await aboutInput.scrollIntoViewIfNeeded();
      await aboutInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('100% verified checkout promo codes, exclusive partner coupons & limited-time Black Friday deals. Save up to 85% at top brands. Tested daily. ⚡', { delay: 10 });
      console.log('✅ About description set.');
      await sleep(500);
    } else {
      console.log('⚠️ About input not found');
    }

    // 4. Website URL
    console.log('✏️ Updating Website URL...');
    const websiteInput = await page.$('#website_url, input[name="website_url"]');
    if (websiteInput) {
      await websiteInput.scrollIntoViewIfNeeded();
      await websiteInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('https://promoradar.store/', { delay: 10 });
      console.log('✅ Website URL set to https://promoradar.store/');
      await sleep(500);
    } else {
      console.log('⚠️ Website input not found');
    }

    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_step2_filled.png' });

    // 5. Click Save Button
    console.log('💾 Clicking Save button...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.scrollIntoViewIfNeeded();
      await sleep(500);
      await saveBtn.click();
      console.log('🔘 Clicked Save!');
      await sleep(6000);
    } else {
      console.log('⚠️ Save button not found');
    }

    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_step3_saved.png' });
    console.log('📸 Saved state screenshot captured.');

    // Save fresh cookies
    const cookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2), 'utf8');
    console.log('🍪 Updated cookies saved.');

  } catch (err) {
    console.error('❌ Error during profile update:', err);
    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

updateProfile().catch(console.error);

