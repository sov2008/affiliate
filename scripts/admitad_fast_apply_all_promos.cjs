const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('🚀 Быстрая подача заявок на все промокодные программы (tracking_promocode_programs)...');
  
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    let grandTotal = 0;

    for (let pageNum = 1; pageNum <= 6; pageNum++) {
      console.log(`\n======================================================`);
      console.log(`📄 Загрузка страницы ${pageNum} из 6...`);
      console.log(`======================================================`);

      const targetUrl = `https://store.admitad.com/ru/webmaster/websites/3007248/catalog/tracking_promocode_programs/?page=${pageNum}`;
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);

      let pageProcessed = 0;
      let noProgressCount = 0;

      while (noProgressCount < 3) {
        // Проверяем, есть ли на странице доступные кнопки "Запросить код"
        const hasButton = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a')).filter(el => {
            const t = (el.innerText || '').trim();
            return t === 'Запросить код' && el.offsetParent !== null;
          });
          if (btns.length === 0) return false;
          
          // Скроллим к первой кнопке и кликаем
          btns[0].scrollIntoView({ behavior: 'instant', block: 'center' });
          btns[0].click();
          return true;
        });

        if (!hasButton) {
          console.log(`На странице ${pageNum} больше нет активных кнопок "Запросить код".`);
          break;
        }

        console.log(`[Стр. ${pageNum}] Кликнули "Запросить код"...`);
        await page.waitForTimeout(1200);

        // В модалке ищем кнопку подтверждения "Запросить код"
        const modalClicked = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"], mat-dialog-container, .mat-dialog-container, .admitad-dialog');
          if (!dialog) return false;

          const btn = Array.from(dialog.querySelectorAll('button')).find(b => (b.innerText || '').includes('Запросить код'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        if (modalClicked) {
          console.log(`[Стр. ${pageNum}] Нажали подтверждение в модалке...`);
          await page.waitForTimeout(1500);
        }

        // Проверяем, появились ли правила программы с кнопкой "Принять"
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

        // Закрываем модалку если осталась открытой
        await page.evaluate(() => {
          const closeBtn = document.querySelector('button[mat-dialog-close], button[title="Закрыть"], .admitad-dialog__close, button[aria-label="Close"]');
          if (closeBtn) closeBtn.click();
        });
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
      }

      console.log(`Страница ${pageNum} завершена. Обработано на странице: ${pageProcessed}. Всего запрошено: ${grandTotal}`);
      await page.screenshot({ path: path.join(OUTPUT_DIR, `page_${pageNum}_result.png`) });
    }

    console.log(`\n🎉 ВСЕ 6 СТРАНИЦ КАТАЛОГА ОБРАБОТАНЫ! Всего запрошено промокодов: ${grandTotal}`);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
