const { chromium } = require('playwright');
const fs = require('fs');

async function testSession() {
  console.log('Testing Pinterest session...');
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
  await page.goto('https://www.pinterest.com/settings/profile/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  
  const title = await page.title();
  console.log('Page Title:', title);

  const nameVal = await page.$eval('#business_name', el => el.value).catch(() => 'not found');
  const aboutVal = await page.$eval('#about', el => el.value).catch(() => 'not found');
  const websiteVal = await page.$eval('#website_url', el => el.value).catch(() => 'not found');

  console.log('Business Name:', nameVal);
  console.log('About:', aboutVal);
  console.log('Website:', websiteVal);

  await page.screenshot({ path: '/var/www/affiliate/scratch/pinterest_profile_current.png', fullPage: true });
  console.log('Screenshot saved to /var/www/affiliate/scratch/pinterest_profile_current.png');

  await browser.close();
}

testSession().catch(err => {
  console.error('Error during Pinterest check:', err);
  process.exit(1);
});

