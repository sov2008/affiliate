const { chromium } = require('playwright');
const fs = require('fs');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  if (fs.existsSync('pinterest_cookies.json')) {
    const cookies = JSON.parse(fs.readFileSync('pinterest_cookies.json', 'utf8'));
    await context.addCookies(cookies);
  }

  const page = await context.newPage();
  console.log('Navigating to user profile created pins...');
  await page.goto('https://www.pinterest.com/FlirtCheck/_created/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('Navigation err:', e.message));

  await page.waitForTimeout(4000);

  // Take screenshot
  await page.screenshot({ path: 'scratch/pinterest_created_pins.png', fullPage: true });

  const pins = await page.$$eval('a[href*="/pin/"]', links => links.map(a => ({
    href: a.href,
    text: a.innerText.trim(),
    ariaLabel: a.getAttribute('aria-label')
  })));

  console.log('Found pin links on profile:', pins.length);
  console.log('Sample pins:', pins.slice(0, 10));

  // Also check /FlirtCheck/moneycashpw/ or /FlirtCheck/_saved/
  console.log('Navigating to saved / boards...');
  await page.goto('https://www.pinterest.com/FlirtCheck/_saved/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('Saved nav err:', e.message));
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'scratch/pinterest_saved_boards.png', fullPage: true });

  const boards = await page.$$eval('a[href*="/FlirtCheck/"]', links => links.map(a => a.href));
  console.log('Found boards links:', boards);

  await browser.close();
}

main().catch(console.error);
