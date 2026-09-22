const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Pinterest Save & Scroll] Starting...');

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
    await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(4000);

    // Click Save if enabled
    console.log('Checking Save button...');
    const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
    if (saveBtn) {
      const isRed = await saveBtn.evaluate(el => {
        const bg = window.getComputedStyle(el).backgroundColor;
        return bg.includes('230, 0, 35') || bg.includes('rgb(230') || bg.includes('red');
      });
      console.log('Save button is red/active:', isRed);
      if (isRed) {
        await saveBtn.click();
        console.log('✅ Clicked Save button!');
        await sleep(4000);
      }
    }

    // Now let's scroll down to see the lower half of the settings
    console.log('📜 Scrolling down page...');
    await page.evaluate(() => window.scrollBy(0, 700));
    await sleep(2000);

    const sLower = path.join(SCREENSHOTS_DIR, '06_profile_settings_lower.png');
    await page.screenshot({ path: sLower, fullPage: false });
    console.log('📸 Lower settings screenshot:', sLower);

    // Look for website input
    const webInput = await page.$('#website_url, input[name="website_url"]');
    if (webInput) {
      console.log('Found website input, filling https://flirtcheck.site/...');
      await webInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type('https://flirtcheck.site/', { delay: 20 });
      await sleep(1000);

      // Save again
      const saveBtn2 = await page.$('button:has-text("Сохранить"), button:has-text("Save")');
      if (saveBtn2) {
        await saveBtn2.click();
        console.log('✅ Clicked Save after website update!');
        await sleep(4000);
      }
    }

    // Save final state
    const sFinal = path.join(SCREENSHOTS_DIR, '07_final_settings.png');
    await page.screenshot({ path: sFinal, fullPage: false });
    console.log('📸 Final settings screenshot:', sFinal);

    // View public profile
    console.log('👀 Navigating to public profile...');
    await page.goto('https://www.pinterest.com/MoneyCashpw/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(5000);

    const sPublic = path.join(SCREENSHOTS_DIR, '08_public_profile_view.png');
    await page.screenshot({ path: sPublic, fullPage: false });
    console.log('📸 Public profile view:', sPublic);

    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

main();
