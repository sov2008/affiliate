const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Обработка пагинации через клик по страницам 2, 3, 4, 5, 6...');
  
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const targetUrl = 'https://store.admitad.com/ru/webmaster/websites/3007248/catalog/tracking_promocode_programs/';
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    let grandTotal = 14; // Уже успешно запрошено на стр 1

    for (let pageNum = 2; pageNum <= 6; pageNum++) {
      console.log(`\n======================================================`);
      console.log(`📄 Переход на страницу ${pageNum} через пагинатор...`);
      console.log(`======================================================`);

      // Скроллим в самый низ к пагинатору
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      // Ищем ссылку на номер страницы
      const pageLink = page.locator(`.pagination__link:has-text("${pageNum}"), a.pagination__link:text-is("${pageNum}")`);
      const linkCount = await pageLink.count();
      console.log(`Найдено ссылок на страницу ${pageNum}: ${linkCount}`);

      if (linkCount > 0) {
        await pageLink.first().click();
        await page.waitForTimeout(3000);
      } else {
        console.log(`Ссылка на страницу ${pageNum} не найдена, пробуем кликнуть стрелку 'Вперед'...`);
        const nextArrow = page.locator('a.pagination__next, button.pagination__next, [class*="next"]');
        if (await nextArrow.count() > 0) {
          await nextArrow.first().click();
          await page.waitForTimeout(3000);
        }
      }

      // Скроллим наверх
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(1000);

      // Скриншот страницы
      await page.screenshot({ path: path.join(OUTPUT_DIR, `real_page_${pageNum}_loaded.png`) });

      // Теперь обрабатываем все кнопки "Запросить код" на этой странице
      let pageProcessed = 0;
      let noProgressCount = 0;

      while (noProgressCount < 3) {
        const hasButton = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a')).filter(el => {
            const t = (el.innerText || '').trim();
            return t === 'Запросить код' && el.offsetParent !== null;
          });
          if (btns.length === 0) return false;
          
          btns[0].scrollIntoView({ behavior: 'instant', block: 'center' });
          btns[0].click();
          return true;
        });

        if (!hasButton) {
          console.log(`На странице ${pageNum} больше нет доступных кнопок "Запросить код".`);
          break;
        }

        console.log(`[Стр. ${pageNum}] Кликнули "Запросить код"...`);
        await page.waitForTimeout(1200);

        // В модалке
        await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], mat-dialog-container, .admitad-dialog');
          if (dialog) {
            const btn = Array.from(dialog.querySelectorAll('button')).find(b => (b.innerText || '').includes('Запросить код'));
            if (btn) btn.click();
          }
        });
        await page.waitForTimeout(1500);

        // Правила
        const rulesAccepted = await page.evaluate(() => {
          const acceptBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const t = (b.innerText || '').trim();
            return t === 'Принять' || t === 'Согласен' || t === 'Подать заявку';
          });
          if (acceptBtn) {
            acceptBtn.click();
            return true;
          }
          return false;
        });

        if (rulesAccepted) {
          console.log(`[Стр. ${pageNum}] ✅ Правила приняты! Промокод успешно запрошен!`);
          grandTotal++;
          pageProcessed++;
          noProgressCount = 0;
          await page.waitForTimeout(2000);
        } else {
          noProgressCount++;
        }

        // Закрываем модалку
        await page.evaluate(() => {
          const closeBtn = document.querySelector('button[mat-dialog-close], button[title="Закрыть"], .admitad-dialog__close');
          if (closeBtn) closeBtn.click();
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
      }

      console.log(`Страница ${pageNum} завершена. Запрошено на странице: ${pageProcessed}. Всего: ${grandTotal}`);
    }

    console.log(`\n🎉 ТОТАЛЬНЫЙ ПАКЕТНЫЙ ЗАПРОС ЗАВЕРШЕН! Всего промокодов запрошено: ${grandTotal}`);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
