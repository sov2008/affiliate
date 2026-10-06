const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchLatestTwitterCode() {
  try {
    const stdout = execSync('python scripts/check_mail_twitter.py').toString();
    const match = stdout.match(/>\s*(\d{6})\b/);
    if (match) return match[1];
    const match2 = stdout.match(/\b(\d{6})\b/);
    if (match2) return match2[1];
  } catch (e) {
    console.log('Error fetching code:', e.message);
  }
  return null;
}

async function main() {
  console.log('🚀 Starting X / Twitter Automated Login in Headful mode...');

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--start-maximized'
    ]
  });

  const context = await browser.newContext({
    viewport: null,
    locale: 'ru-RU'
  });

  if (fs.existsSync('twitter_cookies.json')) {
    try {
      const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
      if (cookies.length > 0) {
        await context.addCookies(cookies);
        console.log('Loaded existing twitter cookies');
      }
    } catch (e) {}
  }

  const page = await context.newPage();

  console.log('Navigating to login flow...');
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(5000);
  await page.screenshot({ path: 'scratch/x_flow_initial.png' });

  // 1. Enter Email
  console.log('Looking for email input...');
  const userInput = page.locator('input[autocomplete="username"], input[name="text"], input[type="text"]').first();
  await userInput.waitFor({ state: 'visible', timeout: 15000 });
  await userInput.fill('sapegin.oleg@gmail.com');
  await sleep(1000);

  const nextBtn = page.locator('button:has-text("Продолжить"), button:has-text("Далее"), button:has-text("Next")').first();
  await nextBtn.click();
  await sleep(3500);

  // Take screenshot step 1
  await page.screenshot({ path: 'scratch/x_login_after_user.png' });

  // 2. Check if secondary identification (phone or username) is requested
  const secondaryInput = page.locator('input[data-testid="ocfEnterTextTextInput"], input[name="text"]').first();
  if (await secondaryInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('Secondary identifier requested, entering username TheWeedsorg...');
    await secondaryInput.fill('TheWeedsorg');
    await sleep(1000);
    const sNext = page.locator('button:has-text("Продолжить"), button:has-text("Далее"), button:has-text("Next")').first();
    await sNext.click();
    await sleep(3500);
    await page.screenshot({ path: 'scratch/x_login_after_secondary.png' });
  }

  // 3. Enter Password
  console.log('Looking for password field...');
  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  await passInput.waitFor({ state: 'visible', timeout: 10000 });
  await passInput.fill('256:AAGdD');
  await sleep(1000);

  const loginBtn = page.locator('button:has-text("Войти"), button:has-text("Log in"), [data-testid="LoginForm_Login_Button"]').first();
  await loginBtn.click();
  await sleep(6000);

  await page.screenshot({ path: 'scratch/x_login_after_password.png' });

  // 4. Check if confirmation code was sent
  const codeInput = page.locator('input[data-testid="ocfEnterTextTextInput"], input[name="text"]').first();
  if (await codeInput.isVisible({ timeout: 2500 }).catch(() => false)) {
    console.log('📩 Verification code prompt detected! Waiting 8s for email delivery...');
    await sleep(8000);
    const code = fetchLatestTwitterCode();
    console.log('Received code from Gmail:', code);
    if (code) {
      await codeInput.fill(code);
      await sleep(1000);
      const cNext = page.locator('button:has-text("Продолжить"), button:has-text("Далее"), button:has-text("Next")').first();
      await cNext.click();
      await sleep(6000);
    }
  }

  // Final check
  console.log('Final URL:', page.url());
  await page.screenshot({ path: 'scratch/x_login_final_state.png', fullPage: true });

  const cookies = await context.cookies();
  fs.writeFileSync('twitter_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
  console.log('Saved cookies to twitter_cookies.json (total cookies:', cookies.length, ')');

  await browser.close();
}

main().catch(err => {
  console.error('Login error:', err);
  process.exit(1);
});
