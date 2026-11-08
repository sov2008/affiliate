const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function reauth() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const statePath = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    storageState: statePath,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();
  console.log('Navigating to Mitgo login page...');
  await page.goto('https://login.mitgo.com/auth/realms/users/protocol/openid-connect/auth?client_id=monolith&redirect_uri=https%3A%2F%2Fstore.admitad.com%2Fru%2Fsso%2Flogin-complete%2F&response_type=code&scope=openid+email+profile&ui_locales=ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Fill credentials from environment
  const admitadUser = process.env.ADMITAD_LOGIN || 'sov7@i.ua';
  const admitadPass = process.env.ADMITAD_PASSWORD || '';
  await page.fill('input[name="username"]', admitadUser);
  await page.fill('input[name="password"]', admitadPass);
  console.log('Credentials filled. Submitting form...');
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForTimeout(7000);

  console.log('After submit URL:', page.url());
  const title = await page.title();
  console.log('After submit Title:', title);

  if (page.url().includes('store.admitad.com') || page.url().includes('login-complete')) {
    console.log('🎉 Login successful! Saving refreshed auth_state.json...');
    await page.waitForTimeout(2000);
    await context.storageState({ path: statePath });
    console.log('State saved successfully to:', statePath);
  } else {
    const errorText = await page.evaluate(() => {
      const el = document.querySelector('.alert-error, .kc-feedback-text, [class*="error"], #input-error');
      return el ? el.innerText : 'none';
    });
    console.log('Login not finalized. Error snippet:', errorText);
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/reauth_debug.png') });
  }

  await browser.close();
}

reauth().catch(err => {
  console.error('Reauth error:', err);
  process.exit(1);
});
