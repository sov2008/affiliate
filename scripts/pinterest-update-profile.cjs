const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function prepareAvatar() {
  const avatarPngPath = path.resolve(__dirname, '../scratch/avatar_flirtcheck.png');
  const sourceWebp = path.resolve(__dirname, '../blog/public/images/author/arthur-vance-avatar.webp');

  try {
    if (fs.existsSync(sourceWebp)) {
      await sharp(sourceWebp).resize(400, 400).png().toFile(avatarPngPath);
      console.log('✅ Prepared avatar ->', avatarPngPath);
      return avatarPngPath;
    }
  } catch (err) {
    console.warn('Avatar prepare error:', err.message);
  }
  return null;
}

async function main() {
  console.log('🚀 [Pinterest Profile Updater v2] Starting...');

  const avatarPath = await prepareAvatar();

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
    console.log('🍪 Injected saved session cookies.');
  }

  const page = await context.newPage();

  try {
    console.log('🌐 Navigating to profile settings...');
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // 1. Upload Avatar if button exists
    if (avatarPath && fs.existsSync(avatarPath)) {
      try {
        console.log('🖼️ Handling avatar change...');
        const changeBtn = await page.$('button:has-text("Изменить"), button:has-text("Change")');
        if (changeBtn) {
          // Listen for fileChooser
          const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 8000 }).catch(() => null);
          await changeBtn.click();
          const fileChooser = await fileChooserPromise;
          if (fileChooser) {
            await fileChooser.setFiles(avatarPath);
            console.log('✅ Avatar file chosen via fileChooser!');
            await sleep(3000);
          } else {
            const fileInput = await page.$('input[type="file"]');
            if (fileInput) {
              await fileInput.setInputFiles(avatarPath);
              console.log('✅ Avatar set directly on input[type=file]!');
              await sleep(3000);
            }
          }
        }
      } catch (avErr) {
        console.warn('Avatar upload notice:', avErr.message);
      }
    }

    // 2. Business Name
    console.log('✏️ Updating Business Name...');
    const nameInput = await page.$('#business_name');
    if (nameInput) {
      await nameInput.scrollIntoViewIfNeeded();
      await nameInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('FlirtCheck | Dating Safety & Cyber Forensics Lab', { delay: 10 });
      console.log('✅ Name set.');
      await sleep(500);
    }

    // 3. About
    console.log('✏️ Updating About...');
    const aboutInput = await page.$('#about');
    if (aboutInput) {
      await aboutInput.scrollIntoViewIfNeeded();
      await aboutInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('Independent investigative desk exposing online dating scams, AI deepfakes, bot farms & algorithm mechanics. 🔍 Stay verified, date smart. 🛡️', { delay: 10 });
      console.log('✅ About set.');
      await sleep(500);
    }

    // 4. Website URL
    console.log('✏️ Updating Website URL...');
    const websiteInput = await page.$('#website_url');
    if (websiteInput) {
      await websiteInput.scrollIntoViewIfNeeded();
      await websiteInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('https://flirtcheck.site/', { delay: 15 });
      console.log('✅ Website URL set to https://flirtcheck.site/');
      await sleep(500);
    }

    // 5. Click Save Button
    console.log('💾 Clicking Save button...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      await saveBtn.scrollIntoViewIfNeeded();
      await sleep(500);
      const isRed = await saveBtn.evaluate(el => el.classList.contains('red') || getComputedStyle(el).backgroundColor.includes('rgb('));
      console.log('Save button ready, clicking...');
      await saveBtn.click();
      console.log('🔘 Clicked Save!');
      await sleep(5000);
    }

    const sSaved = path.join(SCREENSHOTS_DIR, '04_profile_saved.png');
    await page.screenshot({ path: sSaved, fullPage: true });
    console.log('📸 Saved state screenshot:', sSaved);

    // 6. Navigate to public profile
    console.log('👀 Navigating to public profile...');
    await page.goto('https://www.pinterest.com/MoneyCashpw/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(5000);

    const sPublic = path.join(SCREENSHOTS_DIR, '05_public_profile.png');
    await page.screenshot({ path: sPublic, fullPage: true });
    console.log('📸 Public profile screenshot:', sPublic);

    // Save fresh cookies
    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  } catch (err) {
    console.error('❌ Error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'profile_error_v2.png') }).catch(() => {});
  } finally {
    console.log('Closing browser session...');
    await browser.close();
  }
}

main();
