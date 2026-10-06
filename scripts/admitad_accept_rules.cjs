const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Клик по кнопке "Принять правила"...');
  
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const targetUrl = 'https://store.admitad.com/ru/webmaster/websites/3007248/catalog/tracking_promocode_programs/';
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    // 1. Клик "Запросить код"
    await page.locator('text=Запросить код').first().click();
    await page.waitForTimeout(1500);

    // 2. Клик зеленая кнопка "Запросить код"
    const submitBtn = page.locator('button:has-text("Запросить код")').last();
    await submitBtn.click();
    await page.waitForTimeout(2000);

    // 3. Клик "Принять" в правилах
    const acceptBtn = page.locator('button:has-text("Принять")');
    console.log('Кликаем "Принять"...');
    await acceptBtn.click();
    await page.waitForTimeout(4000);

    // Скриншот результата
    const finalScreenshot = path.join(OUTPUT_DIR, 'tracking_promo_accepted.png');
    await page.screenshot({ path: finalScreenshot });
    console.log(`📸 Скриншот после "Принять": ${finalScreenshot}`);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
