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

async function loginTwitter() {
  console.log('🚀 Starting Twitter / X Login...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  if (fs.existsSync('twitter_cookies.json')) {
    try {
      const cookies = JSON.parse(fs.readFileSync('twitter_cookies.json', 'utf8'));
      await context.addCookies(cookies);
      console.log('Loaded existing twitter cookies');
    } catch (e) {}
  }

  const page = await context.newPage();

  console.log('Navigating to https://x.com/home ...');
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // Check if already logged in
  if (page.url().includes('/home')) {
    console.log('🎉 Already logged in! Current URL:', page.url());
    const cookies = await context.cookies();
    fs.writeFileSync('twitter_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');
    await page.screenshot({ path: 'scratch/twitter_home_logged_in.png', fullPage: true });
    await browser.close();
    return;
  }

  console.log('Not logged in. Going to login flow...');
  await page.goto('https://x.com/i/flow/login', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);
  await page.screenshot({ path: 'scratch/twitter_login_step1.png' });

  // 1. Enter email/username
  console.log('Entering email/username...');
  const userInput = page.locator('input[autocomplete="username"], input[name="text"]').first();
  await userInput.waitFor({ state: 'visible', timeout: 15000 });
  await userInput.fill('TheWeedsorg'); // or sapegin.oleg@gmail.com
  await sleep(1000);

  // Click Next
  const nextBtn = page.locator('button:has-text("Next"), button:has-text("Далее")').first();
  await nextBtn.click();
  await sleep(3000);
  await page.screenshot({ path: 'scratch/twitter_login_step2.png' });

  // Check if it asks for phone / username confirmation
  const verifyInput = page.locator('input[data-testid="ocfEnterTextTextInput"], input[name="text"]').first();
  if (await verifyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Verification prompt detected, filling username/email...');
    await verifyInput.fill('sapegin.oleg@gmail.com');
    await sleep(1000);
    const vNext = page.locator('button:has-text("Next"), button:has-text("Далее")').first();
    await vNext.click();
    await sleep(3000);
    await page.screenshot({ path: 'scratch/twitter_login_step2_after_verify.png' });
  }

  // 2. Enter Password
  console.log('Entering password...');
  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  await passInput.waitFor({ state: 'visible', timeout: 10000 });
  await passInput.fill('256:AAGdD');
  await sleep(1000);

  const loginBtn = page.locator('button:has-text("Log in"), button:has-text("Войти"), [data-testid="LoginForm_Login_Button"]').first();
  await loginBtn.click();
  await sleep(5000);
  await page.screenshot({ path: 'scratch/twitter_login_step3.png' });

  // Check for email code verification if required
  const codeInput = page.locator('input[data-testid="ocfEnterTextTextInput"], input[name="text"]').first();
  if (await codeInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Confirmation code requested! Fetching from Gmail...');
    await sleep(5000); // give Gmail time to receive
    const code = fetchLatestTwitterCode();
    console.log('Fetched code from Gmail:', code);
    if (code) {
      await codeInput.fill(code);
      await sleep(1000);
      const cNext = page.locator('button:has-text("Next"), button:has-text("Далее")').first();
      await cNext.click();
      await sleep(5000);
    }
  }

  await page.screenshot({ path: 'scratch/twitter_login_final.png', fullPage: true });
  console.log('Current URL after login attempt:', page.url());

  const cookies = await context.cookies();
  fs.writeFileSync('twitter_cookies.json', JSON.stringify(cookies, null, 2), 'utf8');

  await browser.close();
}

loginTwitter().catch(err => {
  console.error('Fatal Login Error:', err);
  process.exit(1);
});
