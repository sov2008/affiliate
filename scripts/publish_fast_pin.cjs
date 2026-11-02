const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function publishFastPin() {
  console.log('🚀 Starting Fast Pin Publisher with Direct Board Creation...');
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

  // Listen to network to catch exact error if any
  page.on('response', async res => {
    if (res.url().includes('PinResource/create') || res.url().includes('BoardResource/create')) {
      console.log('📡 API Response:', res.status(), res.url().split('?')[0]);
      try {
        const text = await res.text();
        console.log('Body snippet:', text.substring(0, 300));
      } catch (e) {}
    }
  });

  await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 35000 });
  await sleep(4000);

  // Upload image
  console.log('1. Uploading image...');
  const pinImage = '/var/www/affiliate/scratch/pins_promoradar/pin_hostinger-cloud-75.png';
  await page.setInputFiles('input[type="file"]', pinImage);
  await sleep(3000);

  // Title
  console.log('2. Entering Title...');
  const title = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i]').first();
  await title.click();
  await page.keyboard.type('Hostinger: 75% OFF Cloud Hosting + Free Domain [HOSTING75]', { delay: 10 });

  // Description
  console.log('3. Entering Description...');
  const desc = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"]').first();
  if (await desc.isVisible().catch(() => false)) {
    await desc.click();
    await page.keyboard.type('Verified checkout promo code on PromoRadar.', { delay: 5 });
  }

  // Link
  console.log('4. Entering Link...');
  const link = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="ссылк" i]').first();
  await link.click();
  await page.keyboard.type('https://promoradar.store/stores/hostinger/', { delay: 10 });

  // Select board dropdown
  console.log('5. Clicking board dropdown button...');
  const selectBoardBtn = page.locator('button:has-text("Выберите доску"), [data-test-id="board-dropdown-select-button"]').first();
  await selectBoardBtn.click();
  await sleep(1500);

  // Click "+ Создать доску" (we use exact coordinates from screenshot)
  console.log('6. Clicking "+ Создать доску"...');
  const createBoardRow = page.locator('text="Создать доску"').last();
  await createBoardRow.click({ force: true });
  await sleep(2000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/modal_open_state.png' });

  // Type board name
  console.log('7. Typing board name in modal...');
  const boardNameField = page.locator('input[id*="board-name"], input[placeholder*="Название" i]').first();
  if (await boardNameField.isVisible({ timeout: 4000 }).catch(() => false)) {
    await boardNameField.fill('PromoRadar Deals');
    await sleep(500);
    // Click submit in modal
    const submitModalBtn = page.locator('button[type="submit"]:has-text("Создать")').first();
    await submitModalBtn.click();
    console.log('Modal submitted, waiting 3s...');
    await sleep(3000);
  } else {
    console.log('Modal name input not visible, checking active element...');
    await page.keyboard.type('PromoRadar Deals');
    await sleep(500);
    await page.keyboard.press('Enter');
    await sleep(3000);
  }

  // Publish
  console.log('8. Clicking red Publish button...');
  const pubBtn = page.locator('button:has-text("Сохранить"), button:has-text("Опубликовать")').first();
  await pubBtn.click({ force: true });
  console.log('Clicked Publish! Waiting 8s for live response...');
  await sleep(8000);

  await page.screenshot({ path: '/var/www/affiliate/scratch/final_publish_result.png' });

  // Check public profile
  console.log('9. Checking public profile for created pin...');
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(3000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/public_live_check.png', fullPage: true });

  await browser.close();
  console.log('🎉 Fast pin publish script finished!');
}

publishFastPin().catch(console.error);

