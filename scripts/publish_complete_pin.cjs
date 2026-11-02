const { chromium } = require('playwright');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function publishComplete() {
  console.log('🚀 Publishing Hostinger Pin with Board Creation...');
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
  await sleep(4000);

  // 1. Upload creative
  const pinImage = '/var/www/affiliate/scratch/pins_promoradar/pin_hostinger-cloud-75.png';
  await page.setInputFiles('input[type="file"]', pinImage);
  await sleep(3500);

  // 2. Title
  const titleInput = page.locator('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i]').first();
  await titleInput.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Hostinger: 75% OFF Cloud Hosting + Free Domain [HOSTING75]', { delay: 10 });

  // 3. Description
  const descArea = page.locator('div[aria-label*="описание пина" i], div[contenteditable="true"]').first();
  if (await descArea.isVisible().catch(() => false)) {
    await descArea.click();
    await page.keyboard.type('Launch on ultra-fast LiteSpeed NVMe servers. Code HOSTING75 applies an instant 75% discount, free domain name, and automated daily backups. Tested on PromoRadar.', { delay: 5 });
  }

  // 4. Link
  const linkInput = page.locator('textarea[id*="pin-draft-link"], textarea[placeholder*="ссылк" i]').first();
  await linkInput.click();
  await page.keyboard.type('https://promoradar.store/stores/hostinger/', { delay: 10 });
  await page.keyboard.press('Tab');
  await sleep(1000);

  // 5. Open Board dropdown and click "Создать доску"
  console.log('Opening board selector...');
  const selectBoardBtn = await page.$('button:has-text("Выберите доску"), [data-test-id="board-dropdown-select-button"]');
  if (selectBoardBtn) {
    await selectBoardBtn.click();
    await sleep(1500);
  }

  console.log('Clicking "Создать доску"...');
  const createBoardBtn = await page.$('button:has-text("Создать доску"), div:has-text("Создать доску")');
  if (createBoardBtn) {
    await createBoardBtn.click();
    await sleep(2000);

    // Fill board name in popup
    const boardNameInput = await page.$('input[id*="board-name"], input[placeholder*="Название"], input[name*="name"]');
    if (boardNameInput) {
      await boardNameInput.fill('Web Hosting & Software Licenses');
      await sleep(500);
      const submitModal = await page.$('button[type="submit"]:has-text("Создать"), button:has-text("Создать")');
      if (submitModal) {
        await submitModal.click();
        console.log('✅ Board created and selected in modal!');
        await sleep(3500);
      }
    }
  }

  // 6. Click Red Save / Publish button
  console.log('Submitting Pin Publication (Save / Опубликовать)...');
  const pubBtn = await page.$('button:has-text("Сохранить"), button:has-text("Опубликовать"), [data-test-id="board-dropdown-save-button"]');
  if (pubBtn) {
    await pubBtn.focus();
    await pubBtn.click({ force: true });
    console.log('🔘 Clicked Publish!');
    await sleep(10000);
  }

  await page.screenshot({ path: '/var/www/affiliate/scratch/live_pin_created_success.png', fullPage: true });
  console.log('📸 Screenshot saved.');

  // Check public profile
  await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 35000 });
  await sleep(4000);
  await page.screenshot({ path: '/var/www/affiliate/scratch/profile_with_live_pins.png', fullPage: true });

  await browser.close();
  console.log('🎉 Done!');
}

publishComplete().catch(console.error);

