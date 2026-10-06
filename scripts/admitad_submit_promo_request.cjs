const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Клик по кнопке "Запросить код" внутри модального окна...');
  
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

    // Находим первую кнопку "Запросить код" в списке
    await page.locator('text=Запросить код').first().click();
    await page.waitForTimeout(1500);

    // Теперь кликаем на зеленую кнопку "Запросить код" внутри модалки
    // Ищем кнопку внутри модалки
    const submitBtn = page.locator('button:has-text("Запросить код"), [class*="modal"] button:has-text("Запросить код")').last();
    console.log('Нажимаем зеленую кнопку в модалке...');
    await submitBtn.click();
    await page.waitForTimeout(3000);

    // Скриншот результата
    const afterScreenshot = path.join(OUTPUT_DIR, 'tracking_promo_requested.png');
    await page.screenshot({ path: afterScreenshot });
    console.log(`📸 Скриншот после клика: ${afterScreenshot}`);

    // Текст на странице
    const alertOrModal = await page.evaluate(() => {
      const el = document.querySelector('[role="alert"], [class*="toast"], [class*="notification"], [class*="modal"]');
      return el ? el.innerText : document.body.innerText.slice(0, 1000);
    });

    console.log('Результат запроса:', alertOrModal);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
