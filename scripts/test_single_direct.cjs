const { chromium } = require('playwright');
const fs = require('fs');

async function testSingleDirect() {
  console.log('Publishing single pin and checking board save button...');
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

  page.on('response', async res => {
    if (res.url().includes('PinResource/create')) {
      console.log('PinResource/create status:', res.status());
      try {
        const json = await res.json();
        console.log('PinResource data:', JSON.stringify(json).substring(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  // Upload image
  const pinImage = '/var/www/affiliate/scratch/pins_promoradar/pin_hostinger-cloud-75.png';
  await page.setInputFiles('input[type="file"]', pinImage);
  await page.waitForTimeout(3000);

  // Title
  const titleInput = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i]').first();
  await titleInput.click();
  await page.keyboard.type('Hostinger: 75% OFF Cloud Hosting + Free Domain [HOSTING75]', { delay: 10 });

  // Description
  const descArea = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"]').first();
  if (await descArea.isVisible().catch(() => false)) {
    await descArea.click();
    await page.keyboard.type('Verified checkout promo code on PromoRadar.', { delay: 5 });
  }

  // Link
  const linkInput = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="ссылк" i]').first();
  await linkInput.click();
  await page.keyboard.type('https://promoradar.store/stores/hostinger/', { delay: 10 });

  // Look at board selector
  const boardBtn = page.locator('[data-test-id="board-dropdown-select-button"], button:has-text("Выберите доску")').first();
  await boardBtn.click();
  await page.waitForTimeout(2000);

  // Search input in dropdown
  const searchInput = page.locator('input[placeholder*="Поиск" i], input[type="text"]').first();
  await searchInput.fill('Deals');
  await page.waitForTimeout(1000);

  // Create board button in dropdown
  console.log('Clicking create board inside dropdown...');
  const createBtn = page.locator('div:has-text("Создать доску"), button:has-text("Создать доску")').first();
  await createBtn.click();
  await page.waitForTimeout(2000);

  // Name input in modal
  const nameInput = page.locator('input[id*="board-name"], input[placeholder*="Название" i]').first();
  console.log('Is name input visible:', await nameInput.isVisible());
  if (await nameInput.isVisible()) {
    await nameInput.fill('PromoRadar Deals');
    await page.waitForTimeout(500);

    const submitCreateBtn = page.locator('button[type="submit"]:has-text("Создать")').first();
    await submitCreateBtn.click();
    console.log('Submitted create board modal!');
    await page.waitForTimeout(4000);
  }

  // Look at Save / Publish button
  const pubBtn = page.locator('button:has-text("Сохранить"), button:has-text("Опубликовать"), [data-test-id="board-dropdown-save-button"]').first();
  console.log('Publish button text:', await pubBtn.innerText().catch(() => 'none'));
  await pubBtn.click();
  console.log('Clicked Publish button!');
  await page.waitForTimeout(8000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/single_pin_result.png', fullPage: true });

  await browser.close();
}

testSingleDirect().catch(console.error);

