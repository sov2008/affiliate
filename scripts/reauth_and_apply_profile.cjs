const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running Pinterest Re-auth & Profile Update...');
  const avatarPath = '/var/www/affiliate/scratch/stitch_pinterest/promoradar_brand_avatar.png';

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
  }

  const page = await context.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto('https://www.pinterest.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(3000);

    console.log('Login page URL:', page.url());
    const emailSelector = 'input[id="email"], input[name="id"], input[type="email"]';
    const emailInput = await page.$(emailSelector);

    if (emailInput) {
      console.log('Filling login form...');
      await emailInput.fill('admin@moneycash.pw');
      await sleep(500);

      const passSelector = 'input[id="password"], input[name="password"], input[type="password"]';
      await page.fill(passSelector, '2zik4iter');
      await sleep(500);

      const submitBtn = await page.$('button[type="submit"], [data-test-id="registerFormSubmitButton"]');
      if (submitBtn) {
        console.log('Clicking login submit...');
        await submitBtn.click();
        await sleep(10000);
      }
    }

    console.log('URL after login attempt:', page.url());
    await page.screenshot({ path: '/var/www/affiliate/scratch/login_result.png' });

    // Save cookies
    const newCookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(newCookies, null, 2), 'utf8');

    // Go to profile settings
    console.log('Navigating to settings/profile...');
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(5000);

    console.log('Settings page URL:', page.url());
    await page.screenshot({ path: '/var/www/affiliate/scratch/settings_profile_result.png' });

    // Update avatar
    const changeBtn = await page.$('button:has-text("Изменить"), button:has-text("Change")');
    if (changeBtn && fs.existsSync(avatarPath)) {
      console.log('Uploading brand avatar...');
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
      await changeBtn.click();
      const fc = await fileChooserPromise;
      if (fc) {
        await fc.setFiles(avatarPath);
      } else {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) await fileInput.setInputFiles(avatarPath);
      }
      await sleep(4000);
      console.log('✅ Avatar uploaded.');
    }

    // Business Name
    const nameInput = await page.$('#business_name, input[name="business_name"], #first_name');
    if (nameInput) {
      await nameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('PromoRadar | Verified Promo Codes & Black Friday Deals', { delay: 10 });
      console.log('✅ Business Name set.');
      await sleep(500);
    }

    // About
    const aboutInput = await page.$('#about, textarea[name="about"]');
    if (aboutInput) {
      await aboutInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('100% verified checkout promo codes, exclusive partner coupons & limited-time Black Friday deals. Save up to 85% at top brands. Tested daily. ⚡', { delay: 10 });
      console.log('✅ About set.');
      await sleep(500);
    }

    // Website URL
    const websiteInput = await page.$('#website_url, input[name="website_url"]');
    if (websiteInput) {
      await websiteInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('https://promoradar.store/', { delay: 10 });
      console.log('✅ Website URL set.');
      await sleep(500);
    }

    // Save
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.scrollIntoViewIfNeeded();
      await sleep(500);
      await saveBtn.click();
      console.log('🔘 Save button clicked!');
      await sleep(6000);
    }

    await page.screenshot({ path: '/var/www/affiliate/scratch/profile_final_state.png' });
    console.log('📸 Final state captured.');

    const finalCookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(finalCookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);

