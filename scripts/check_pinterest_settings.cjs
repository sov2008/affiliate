const { chromium } = require('playwright');
const fs = require('fs');

async function testSession() {
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
  await page.goto('https://www.pinterest.com/settings/', { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForTimeout(3000);

  console.log('Current URL after /settings/:', page.url());
  const links = await page.$$eval('a', els => els.map(a => a.href).slice(0, 20));
  console.log('Sample links:', links);

  await page.screenshot({ path: '/var/www/affiliate/scratch/pinterest_settings.png', fullPage: true });

  await browser.close();
}

testSession().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

