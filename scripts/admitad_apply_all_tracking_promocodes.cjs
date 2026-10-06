const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('🚀 Старт тотальной подачи заявок на ВСЕ программы с именными промокодами (113 рекламодателей)...');
  
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    let totalRequested = 0;
    let totalConnected = 0;

    // Проходим по страницам от 1 до 6
    for (let pageNum = 1; pageNum <= 6; pageNum++) {
      const pageUrl = `https://store.admitad.com/ru/webmaster/websites/3007248/catalog/tracking_promocode_programs/?page=${pageNum}`;
      console.log(`\n======================================================`);
      console.log(`📄 Обработка страницы ${pageNum} из 6: ${pageUrl}`);
      console.log(`======================================================`);

      await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);

      // Сначала проверим кнопки "Подключиться" (для неподключенных программ)
      const connectButtons = page.locator('button:has-text("Подключиться"), a:has-text("Подключиться")');
      const connCount = await connectButtons.count();
      if (connCount > 0) {
        console.log(`На странице найдено кнопок "Подключиться": ${connCount}`);
        for (let c = 0; c < connCount; c++) {
          try {
            const btn = connectButtons.nth(c);
            if (await btn.isVisible()) {
              await btn.scrollIntoViewIfNeeded();
              await btn.click({ timeout: 4000 });
              await page.waitForTimeout(1500);

              // Если появилось окно с правилами или соглашением
              const agreeCheck = page.locator('input[type="checkbox"], label:has-text("согласен"), label:has-text("правила")');
              if (await agreeCheck.count() > 0 && await agreeCheck.first().isVisible()) {
                await agreeCheck.first().check();
                await page.waitForTimeout(500);
              }

              const submitConnect = page.locator('button:has-text("Подключиться"), button:has-text("Подать заявку")').last();
              if (await submitConnect.isVisible()) {
                await submitConnect.click();
                await page.waitForTimeout(2000);
                totalConnected++;
                console.log(`✅ Программа успешно подключена!`);
              }
            }
          } catch (e) {
            console.log(`Не удалось нажать "Подключиться": ${e.message}`);
          }
        }
      }

      // Теперь обрабатываем кнопки "Запросить код"
      // Кнопки могут появляться после раскрытия предложений
      // Нажимаем все кнопки "Показать промокоды" / "expand", если они свернуты
      try {
        const expandBtns = page.locator('button.pp-offer__show-codes, [class*="expand"]');
        const expCount = await expandBtns.count();
        for (let e = 0; e < expCount; e++) {
          try {
            await expandBtns.nth(e).click({ timeout: 1000 });
            await page.waitForTimeout(200);
          } catch {}
        }
      } catch {}

      // Собираем все видимые кнопки "Запросить код"
      let hasMoreButtons = true;
      let iteration = 0;

      while (hasMoreButtons && iteration < 25) {
        iteration++;
        const requestButtons = page.locator('button:has-text("Запросить код"), a:has-text("Запросить код")');
        const count = await requestButtons.count();

        // Фильтруем те, которые еще не в статусе "На модерации"
        let clicked = false;
        for (let i = 0; i < count; i++) {
          const btn = requestButtons.nth(i);
          try {
            if (await btn.isVisible()) {
              await btn.scrollIntoViewIfNeeded();
              await btn.click({ timeout: 4000 });
              await page.waitForTimeout(1500);

              // 1. Модалка: нажимаем "Запросить код"
              const modalReqBtn = page.locator('mat-dialog-container button:has-text("Запросить код"), [role="dialog"] button:has-text("Запросить код")');
              if (await modalReqBtn.isVisible({ timeout: 3000 })) {
                await modalReqBtn.click();
                await page.waitForTimeout(1500);
              }

              // 2. Если правила: нажимаем "Принять"
              const acceptBtn = page.locator('button:has-text("Принять")');
              if (await acceptBtn.isVisible({ timeout: 3000 })) {
                await acceptBtn.click();
                await page.waitForTimeout(2000);
                console.log(`🎉 Именной промокод успешно запрошен! (Всего: ${++totalRequested})`);
              }

              // 3. Закрываем диалог
              const closeBtn = page.locator('button[mat-dialog-close], button[title="Закрыть"], button.admitad-dialog__close');
              if (await closeBtn.isVisible({ timeout: 1500 })) {
                await closeBtn.click();
                await page.waitForTimeout(1000);
              } else {
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
              }

              clicked = true;
              break; // Обновляем список локаторов
            }
          } catch (itemErr) {
            // Пропускаем и пробуем закрыть модалку если зависла
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
          }
        }

        if (!clicked) {
          hasMoreButtons = false;
        }
      }

      console.log(`Страница ${pageNum} завершена. Текущий итог: запрошено ${totalRequested} промокодов, подключено ${totalConnected} программ.`);
      
      // Скриншот страницы
      const pageScreenshot = path.join(OUTPUT_DIR, `tracking_promo_page_${pageNum}_done.png`);
      await page.screenshot({ path: pageScreenshot });
    }

    console.log('\n======================================================');
    console.log(`🏁 ПОЛНЫЙ ПАКЕТНЫЙ ЗАПУСК ЗАВЕРШЕН!`);
    console.log(`Итог: запрошено ${totalRequested} именных промокодов, подключено ${totalConnected} программ.`);
    console.log('======================================================');

  } catch (err) {
    console.error('Критическая ошибка цикла:', err);
  } finally {
    await browser.close();
  }
}

main();
