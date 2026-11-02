const { chromium } = require('playwright');
const fs = require('fs');

async function testSession() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.on('response', res => {
    if (res.status() >= 400) {
      console.log('HTTP', res.status(), res.url());
    }
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await page.context().addCookies(cookies);

  const res = await page.goto('https://www.pinterest.com/', { waitUntil: 'load', timeout: 30000 });
  console.log('Status:', res.status());
  const content = await page.content();
  console.log('Content length:', content.length);
  console.log('Snippet:', content.substring(0, 400));

  await browser.close();
}

testSession().catch(e => console.error(e));

