const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('🚀 Запуск анализа раздела "Именные промокоды" (tracking_promocode_programs)...');
  
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
    console.log(`Navigating to: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    const screenshotPath = path.join(OUTPUT_DIR, 'tracking_promocodes_catalog.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Скриншот сохранен: ${screenshotPath}`);

    // Извлекаем все программы, их ставки, категории и статус подключения
    const pageData = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('[class*="card"], [class*="program"], tr, [data-test*="offer"]');
      
      // Попробуем собрать структурированную инфу
      const text = document.body.innerText;
      
      // Ищем заголовки офферов
      const titles = Array.from(document.querySelectorAll('h2, h3, a[href*="/offers/"]'))
        .map(el => el.innerText.trim())
        .filter(t => t.length > 2 && !t.includes('Каталог') && !t.includes('Admitad') && !t.includes('Спецпредложение'));

      return {
        url: window.location.href,
        titleCount: titles.length,
        titles: Array.from(new Set(titles)).slice(0, 50),
        rawSnippet: text.slice(0, 3000)
      };
    });

    console.log('Результаты страницы:', JSON.stringify({
      titleCount: pageData.titleCount,
      sampleTitles: pageData.titles.slice(0, 15)
    }, null, 2));

    const resultPath = path.join(OUTPUT_DIR, 'tracking_promocodes_data.json');
    fs.writeFileSync(resultPath, JSON.stringify(pageData, null, 2), 'utf8');
    console.log(`Данные сохранены в ${resultPath}`);

  } catch (err) {
    console.error('Ошибка при исследовании:', err);
  } finally {
    await browser.close();
  }
}

main();
