const { chromium } = require('playwright');
const fs = require('fs');

async function testSession() {
  console.log('Testing Pinterest cookies and home page...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();
  await page.goto('https://www.pinterest.com/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('Current URL after home load:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
  console.log('Body preview:\n', bodyText);

  const isLoginVisible = await page.$('button:has-text("Log in"), a:has-text("Log in")');
  console.log('Is Log In button visible?', !!isLoginVisible);

  await page.screenshot({ path: '/var/www/affiliate/scratch/pinterest_home.png', fullPage: true });

  await browser.close();
}

testSession().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

