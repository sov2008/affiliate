const { chromium } = require('playwright');
const fs = require('fs');

async function testAuth0Login() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    storageState: '/var/www/affiliate/artifacts_admitad/cj_auth_state.json',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Try navigating to signin.cj.com which might refresh via auth0 cookie
  console.log('Navigating to signin.cj.com...');
  await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj', {
    waitUntil: 'networkidle',
    timeout: 45000
  });

  console.log('Final URL:', page.url());
  const title = await page.title();
  console.log('Title:', title);

  const text = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Body snippet:', text.replace(/\n+/g, ' '));

  await browser.close();
}

testAuth0Login().catch(console.error);
