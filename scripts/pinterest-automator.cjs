const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\93f4d295-5965-4e67-afd8-acb47c16a2a6\\screenshots';
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 [Pinterest Automator] Starting Chromium (headed mode)...');
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--start-maximized'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const page = await context.newPage();

  try {
    console.log('🌐 [1/5] Navigating to https://www.pinterest.com/login...');
    await page.goto('https://www.pinterest.com/login', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(3000);

    const s1 = path.join(SCREENSHOTS_DIR, '01_login_page.png');
    await page.screenshot({ path: s1, fullPage: false });
    console.log('📸 Screenshot saved:', s1);

    // Close any cookie banner if present
    try {
      const cookieBtn = await page.$('button:has-text("Accept"), button:has-text("Allow all"), [aria-label="Accept all cookies"]');
      if (cookieBtn) {
        await cookieBtn.click();
        await sleep(1000);
      }
    } catch {}

    console.log('🔑 [2/5] Filling credentials...');
    // Try multiple selector patterns for email
    const emailSelector = 'input[id="email"], input[name="id"], input[type="email"]';
    await page.waitForSelector(emailSelector, { timeout: 15000 });
    await page.fill(emailSelector, 'admin@moneycash.pw');
    await sleep(500);

    // Password field
    const passSelector = 'input[id="password"], input[name="password"], input[type="password"]';
    await page.waitForSelector(passSelector, { timeout: 15000 });
    await page.fill(passSelector, '2zik4iter');
    await sleep(500);

    console.log('🔘 [3/5] Submitting login form...');
    const submitBtnSelector = 'button[type="submit"], [data-test-id="registerFormSubmitButton"]';
    await page.click(submitBtnSelector);

    console.log('⏳ Waiting 10s for login response...');
    await sleep(10000);

    const s2 = path.join(SCREENSHOTS_DIR, '02_post_login.png');
    await page.screenshot({ path: s2, fullPage: false });
    console.log('📸 Screenshot saved:', s2);

    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);

    // Check if we are logged in or what state we are in
    const pageText = await page.evaluate(() => document.body.innerText.slice(0, 500));
    console.log('📄 Page snippet:', pageText.replace(/\n+/g, ' '));

    // Keep browser open for a little bit to inspect
    if (!currentUrl.includes('/login')) {
      console.log('🎉 Login SUCCESS! Heading to settings/profile...');
      await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await sleep(4000);
      const s3 = path.join(SCREENSHOTS_DIR, '03_profile_settings.png');
      await page.screenshot({ path: s3, fullPage: false });
      console.log('📸 Profile settings screenshot:', s3);
    } else {
      console.log('⚠️ Still on login page or verification prompted. Inspecting...');
    }

    // Save context cookies so future sessions can reuse them
    const cookies = await context.cookies();
    fs.writeFileSync('pinterest_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
    console.log('💾 Cookies saved to pinterest_cookies.json');

  } catch (err) {
    console.error('❌ Automation Error:', err.message);
    const errScreenshot = path.join(SCREENSHOTS_DIR, 'error_state.png');
    await page.screenshot({ path: errScreenshot }).catch(() => {});
  } finally {
    console.log('Closing browser session...');
    await browser.close();
  }
}

main();
