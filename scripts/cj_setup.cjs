const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts_cj');

async function run() {
  console.log('🚀 Attempting login with realistic human interaction...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  try {
    await page.goto('https://members.cj.com/member/publisher/login.cj', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);

    const emailInput = await page.waitForSelector('input[type="email"], #username', { timeout: 15000 });
    // Type like a human
    await emailInput.click();
    await page.keyboard.type('sapegin.oleg@gmail.com', { delay: 65 });
    await page.waitForTimeout(1500);

    // Look for recaptcha iframe
    const recaptchaFrame = page.frames().find(f => f.url().includes('google.com/recaptcha') || f.url().includes('recaptcha/api2/anchor'));
    if (recaptchaFrame) {
      console.log('Found reCAPTCHA frame! Checking anchor...');
      const checkbox = await recaptchaFrame.$('#recaptcha-anchor, .recaptcha-checkbox');
      if (checkbox) {
        console.log('Clicking recaptcha checkbox...');
        await checkbox.click({ delay: 100 });
        await page.waitForTimeout(4000);
      }
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '03_recaptcha_clicked.png') });

    // Click Continue
    const continueBtn = await page.waitForSelector('button:has-text("Continue"), button[type="submit"]', { timeout: 10000 });
    await continueBtn.click();
    await page.waitForTimeout(4000);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, '04_after_continue.png') });

    // Check if password field appeared
    const passInput = await page.$('input[type="password"]:visible, #password:visible');
    if (passInput) {
      console.log('Password field visible! Typing password...');
      await passInput.click();
      await page.keyboard.type('a554nU@Q5S2U6BY', { delay: 65 });
      await page.waitForTimeout(1000);

      const loginBtn = await page.$('button[type="submit"], button:has-text("Log in"), button:has-text("Sign In"), button:has-text("Continue")');
      if (loginBtn) {
        console.log('Submitting password...');
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle', timeout: 35000 }).catch(() => {}),
          loginBtn.click()
        ]);
      }
      await page.waitForTimeout(5000);
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, '05_logged_in.png') });
      console.log('Logged in URL:', page.url());

      const cookies = await context.cookies();
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'cookies.json'), JSON.stringify(cookies, null, 2));
    } else {
      console.log('Password field not yet visible, current URL:', page.url());
    }

  } catch (err) {
    console.error('Error during run:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'run_error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
}

run();
