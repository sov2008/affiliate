const { chromium } = require('playwright');
const fs = require('fs');

async function testHeadlessCreation() {
  console.log('Testing board creation via Pinterest API/UI...');
  const cookies = JSON.parse(fs.readFileSync('/var/www/affiliate/pinterest_cookies.json', 'utf8'));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    locale: 'ru-RU'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Upload image
  const pinImage = '/var/www/affiliate/scratch/pins_promoradar/pin_hostinger-cloud-75.png';
  await page.setInputFiles('input[type="file"]', pinImage);
  await page.waitForTimeout(3000);

  // Click board selector
  const selectBtn = page.locator('button:has-text("Выберите доску")').first();
  await selectBtn.click();
  await page.waitForTimeout(1500);

  // Inspect HTML of the board flyout
  const flyoutHtml = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"], [data-test-id*="board"]');
    return dialog ? dialog.outerHTML : 'no dialog';
  });
  console.log('Flyout snippet:', flyoutHtml.substring(0, 400));
  fs.writeFileSync('/var/www/affiliate/scratch/flyout_dump.html', flyoutHtml, 'utf8');

  await browser.close();
}

testHeadlessCreation().catch(console.error);

