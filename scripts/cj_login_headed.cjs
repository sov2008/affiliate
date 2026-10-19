const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts_cj');

async function run() {
  console.log('🚀 Launching headed browser for human reCAPTCHA verification...');
  const browser = await chromium.launch({
    headless: false, // Visible window on user screen!
    channel: 'chrome',
    args: ['--start-maximized']
  }).catch(async () => {
    // Fallback if system chrome not found
    return await chromium.launch({ headless: false, args: ['--start-maximized'] });
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();

  try {
    await page.goto('https://members.cj.com/member/publisher/login.cj', { waitUntil: 'domcontentloaded' });

    // Pre-fill email
    try {
      const emailInput = await page.waitForSelector('input[type="email"], #username', { timeout: 10000 });
      if (emailInput) {
        await emailInput.fill('sapegin.oleg@gmail.com');
      }
    } catch {}

    console.log('Window opened. Waiting for user to solve captcha / complete login...');

    // Wait until logged in to member dashboard (URL changes to cj.com member area)
    await page.waitForURL(url => url.toString().includes('members.cj.com') && !url.toString().includes('login') && !url.toString().includes('signin.cj.com'), { timeout: 300000 });

    console.log('🎉 Successfully logged into CJ.com!');
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'cookies.json'), JSON.stringify(cookies, null, 2));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05_logged_in_dashboard.png') });

    console.log('Saved authenticated session cookies.');
  } catch (err) {
    console.log('Session wait finished or timed out:', err.message);
  } finally {
    await browser.close().catch(() => {});
  }
}

run();
