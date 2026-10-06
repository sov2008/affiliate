const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('⚡ Автоматическое пакетное подключение к программам с именными промокодами...');
  
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

    let processedCount = 0;
    
    // Цикл по доступным кнопкам "Запросить код"
    for (let i = 0; i < 20; i++) {
      // Ищем свежие кнопки "Запросить код" на текущем экране
      const buttons = page.locator('button:has-text("Запросить код"), a:has-text("Запросить код")');
      const count = await buttons.count();
      console.log(`Итерация ${i + 1}: Найдено доступных кнопок "Запросить код": ${count}`);
      
      if (count === 0) {
        console.log('Нет больше кнопок "Запросить код" на текущем экране.');
        break;
      }

      // Кликаем по первой видимой
      try {
        await buttons.first().click({ timeout: 5000 });
        await page.waitForTimeout(1500);

        // В модалке нажимаем зеленую "Запросить код"
        const modalBtn = page.locator('button:has-text("Запросить код")').last();
        if (await modalBtn.isVisible({ timeout: 3000 })) {
          await modalBtn.click();
          await page.waitForTimeout(1500);
        }

        // Если вылезло окно с правилами, нажимаем "Принять"
        const acceptBtn = page.locator('button:has-text("Принять")');
        if (await acceptBtn.isVisible({ timeout: 3000 })) {
          await acceptBtn.click();
          await page.waitForTimeout(2000);
          console.log(`✅ Правила приняты и промокод запрошен!`);
        }

        // Закрываем модалку если осталась открыта
        const closeBtn = page.locator('button[aria-label="Close"], [class*="close"]');
        if (await closeBtn.isVisible({ timeout: 1000 })) {
          await closeBtn.first().click();
          await page.waitForTimeout(1000);
        }

        processedCount++;
        console.log(`Всего успешно обработано: ${processedCount}`);
      } catch (clickErr) {
        console.log(`Пропуск или ошибка на элементе: ${clickErr.message}`);
        // Скроллим немного вниз, чтобы увидеть другие
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(1000);
      }
    }

    const finalScreenshot = path.join(OUTPUT_DIR, 'batch_tracking_promo_result.png');
    await page.screenshot({ path: finalScreenshot });
    console.log(`📸 Финальный скриншот сохранен: ${finalScreenshot}`);

  } catch (err) {
    console.error('Ошибка в общем процессе:', err);
  } finally {
    await browser.close();
  }
}

main();
