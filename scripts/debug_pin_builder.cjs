const { chromium } = require('playwright');
const fs = require('fs');

async function testHeadless() {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });

  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));
  await context.addCookies(cookies);

  const page = await context.newPage();
  
  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'networkidle', timeout: 45000 }).catch(e => console.log('goto err:', e.message));
  await page.waitForTimeout(5000);

  console.log('Final URL:', page.url());
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 300));
  console.log('Body Text:', JSON.stringify(bodyText));

  await page.screenshot({ path: '/var/www/affiliate/scratch/pin_builder_debug.png' });
  await browser.close();
}

testHeadless().catch(e => console.error(e));

