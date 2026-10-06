const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Изучаем пагинацию и структуру раздела tracking_promocode_programs...');
  
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

    // Скроллим в самый низ
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    const bottomScreenshot = path.join(OUTPUT_DIR, 'tracking_promo_bottom.png');
    await page.screenshot({ path: bottomScreenshot });
    console.log(`📸 Скриншот подвала: ${bottomScreenshot}`);

    // Анализ элементов пагинации
    const paginationInfo = await page.evaluate(() => {
      const pagers = Array.from(document.querySelectorAll('ul.pagination, nav, [class*="pagination"], [class*="pager"]')).map(el => el.innerText);
      const buttons = Array.from(document.querySelectorAll('button, a')).filter(el => {
        const t = (el.innerText || '').trim();
        return t === '2' || t === '3' || t === 'Вперед' || t === '>' || t === 'Далее' || t.includes('Показать еще');
      }).map(el => ({ text: el.innerText, tag: el.tagName, class: el.className }));

      return {
        pagers,
        buttons: buttons.slice(0, 10),
        totalCountText: document.body.innerText.match(/Найдено рекламодателей:\s*(\d+)/)?.[0] || 'not found'
      };
    });

    console.log('Пагинация:', JSON.stringify(paginationInfo, null, 2));

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
