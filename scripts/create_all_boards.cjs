const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const BOARDS_TO_CREATE = [
  'Web Hosting & Software Licenses',
  'VPN & Cyber Privacy Promo Codes',
  'Black Friday 2026 Deals & Early Access',
  'Outdoor Gear & Tech Gadgets',
  'Global Shopping & Travel eSIM Deals'
];

async function main() {
  console.log('🚀 [Pinterest Batch Board Creator] Starting...');
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

  for (const boardTitle of BOARDS_TO_CREATE) {
    console.log(`\n📁 Checking/Creating Board: "${boardTitle}"...`);
    await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(3000);

    // Check if board already exists on page
    const existing = await page.$(`div:has-text("${boardTitle}"), h2:has-text("${boardTitle}")`);
    if (existing) {
      console.log(`✅ Board "${boardTitle}" already exists. Skipping.`);
      continue;
    }

    // Click red "Создать" button
    const createBtn = await page.locator('button:has-text("Создать")').first();
    await createBtn.click();
    await sleep(1000);

    // Click "Доска" option
    const boardOpt = page.locator('div[role="menuitem"]:has-text("Доска"), span:has-text("Доска")').first();
    await boardOpt.click();
    await sleep(2000);

    // Fill board name in popup modal
    const nameInput = page.locator('input[id*="board-name"], input[placeholder*="Название" i]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(boardTitle);
    await sleep(500);

    // Submit modal
    const submitBtn = page.locator('button[type="submit"]:has-text("Создать")').first();
    await submitBtn.click();
    console.log(`🎉 Board "${boardTitle}" created!`);
    await sleep(3500);
  }

  // Final check
  await page.goto('https://www.pinterest.com/PromoRadarStore/_saved/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/all_boards_verified.png', fullPage: true });
  console.log('📸 All boards verified screenshot captured.');

  const finalCookies = await context.cookies();
  fs.writeFileSync('/var/www/affiliate/pinterest_cookies.json', JSON.stringify(finalCookies, null, 2), 'utf8');

  await browser.close();
}

main().catch(console.error);

