const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
const avatarPngPath = 'D:\\WEB\\antigravity\\affiliate\\scratch\\avatar_flirtcheck.png';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Pinterest Apply Profile] Launching...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox', '--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  if (fs.existsSync('pinterest_cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();

  try {
    console.log('🌐 Opening settings...');
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // 1. Upload Avatar
    if (fs.existsSync(avatarPngPath)) {
      console.log('🖼️ Setting avatar...');
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(avatarPngPath);
        console.log('✅ Avatar file selected.');
        await sleep(2500);
      }
    }

    // 2. Business Name
    console.log('✏️ Setting business_name...');
    const nameInput = await page.$('#business_name');
    if (nameInput) {
      await nameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('FlirtCheck | Dating Safety Lab', { delay: 10 });
      console.log('✅ Name set.');
      await sleep(500);
    }

    // 3. About
    console.log('✏️ Setting about...');
    const aboutInput = await page.$('#about');
    if (aboutInput) {
      await aboutInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('Independent investigative desk exposing online dating scams, AI deepfakes, bot farms & algorithm mechanics. Stay verified, date smart.', { delay: 10 });
      console.log('✅ About set.');
      await sleep(500);
    }


    // 5. Click Save Button
    console.log('💾 Clicking Save button...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.evaluate(el => el.scrollIntoView({ block: 'center' }));
      await sleep(500);
      await saveBtn.click();
      console.log('🔘 Save button clicked!');
      await sleep(6000);
    }

    const sSaved = path.join(SCREENSHOTS_DIR, '10_profile_save_result.png');
    await page.screenshot({ path: sSaved, fullPage: true });
    console.log('📸 Screenshot saved:', sSaved);

    // 6. Check public profile view
    console.log('👀 Viewing public profile...');
    await page.goto('https://www.pinterest.com/MoneyCashpw/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(4000);

    const sPublic = path.join(SCREENSHOTS_DIR, '11_public_profile_after_save.png');
    await page.screenshot({ path: sPublic, fullPage: true });
    console.log('📸 Public profile screenshot:', sPublic);

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
    console.log('💾 Session cookies updated.');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main();
