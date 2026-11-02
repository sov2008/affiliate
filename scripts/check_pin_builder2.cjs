const { chromium } = require('playwright');
const fs = require('fs');

async function testSession() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'en-US'
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  console.log('Navigating to pin-builder...');
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(6000);

  console.log('URL after pin-builder:', page.url());
  const title = await page.title();
  console.log('Title:', title);

  const fileInput = await page.$('input[type="file"]');
  console.log('Has input[type="file"]:', !!fileInput);

  await page.screenshot({ path: '/var/www/affiliate/scratch/pin_builder_test.png', fullPage: true });

  await browser.close();
}

testSession().catch(e => console.error(e));

