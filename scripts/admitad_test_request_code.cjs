const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Тестирование кнопки "Запросить код" в tracking_promocode_programs...');
  
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

    // Находим первую доступную кнопку "Запросить код"
    const reqButtons = page.locator('text=Запросить код');
    const count = await reqButtons.count();
    console.log(`Найдено кнопок "Запросить код": ${count}`);

    if (count > 0) {
      // Кликаем по первой
      await reqButtons.first().click();
      await page.waitForTimeout(2000);

      // Делаем скриншот модального окна
      const modalScreenshot = path.join(OUTPUT_DIR, 'tracking_promo_modal.png');
      await page.screenshot({ path: modalScreenshot });
      console.log(`📸 Скриншот модалки сохранен: ${modalScreenshot}`);

      // Читаем текст модалки
      const modalText = await page.evaluate(() => {
        const modal = document.querySelector('[role="dialog"], [class*="modal"], [class*="popup"], [class*="drawer"]');
        return modal ? modal.innerText : 'Модалка не найдена в DOM';
      });

      console.log('Текст модального окна:', modalText);
    }

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
