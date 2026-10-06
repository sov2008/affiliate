const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('🔍 Глубокий парсинг всех 113 программ раздела "Промокодные программы"...');
  
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();
    await page.setViewportSize({ width: 1600, height: 1200 });

    const targetUrl = 'https://store.admitad.com/ru/webmaster/websites/3007248/catalog/tracking_promocode_programs/';
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    const allPrograms = [];

    // Функция сбора карточек на текущей странице
    async function scrapeCurrentPage() {
      return await page.evaluate(() => {
        const rows = [];
        // Находим все блоки программ
        // В разметке они лежат в блоках с логотипом и названием
        const cards = document.querySelectorAll('div[class*="ProgramCard"], div[class*="card"], div.b-card');
        
        // Альтернативный поиск по заголовкам
        const programBlocks = Array.from(document.querySelectorAll('h2, h3, div')).filter(el => {
          return el.querySelector('button, [class*="request"], a[class*="rule"]') || 
                 (el.innerText && el.innerText.includes('Ставка:') && el.innerText.includes('Запросить код'));
        });

        // Пройдемся по всем текстовым контейнерам предложений
        const rawCards = Array.from(document.querySelectorAll('body *')).filter(el => {
          return el.children.length > 2 && el.innerText && el.innerText.includes('Запросить код') && el.innerText.includes('Ставка:');
        });

        // Самый надежный способ - спарсить прямо DOM элементы карточек
        const elements = document.querySelectorAll('[class*="item"], [class*="card"]');
        const processed = new Set();

        document.querySelectorAll('div').forEach(card => {
          const btn = card.querySelector('button, a');
          const text = card.innerText || '';
          if (text.includes('Запросить код') && text.includes('Ставка:') && !processed.has(text.slice(0, 50))) {
            processed.add(text.slice(0, 50));
            
            // Название программы (обычно первый крупный заголовок или строка)
            const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
            const title = lines[0] || 'Unknown';
            
            // Парсим ставку
            const rateMatch = text.match(/Ставка:\s*([^%\n]+%?)/);
            const rate = rateMatch ? rateMatch[1] : '';

            // Парсим % подтверждения
            const crMatch = text.match(/% подтверждения:\s*([^%\n]+%?)/);
            const approvalRate = crMatch ? crMatch[1] : '';

            // Парсим срок оплаты
            const holdMatch = text.match(/Срок оплаты:\s*([^\n]+)/);
            const hold = holdMatch ? holdMatch[1] : '';

            // Парсим промо-предложения
            const promos = lines.filter(l => l.includes('скидка') || l.includes('Off') || l.includes('off') || l.includes('discount') || l.includes('Промокод'));

            rows.push({
              title,
              rate,
              approvalRate,
              hold,
              promos,
              fullSnippet: lines.slice(0, 8).join(' | ')
            });
          }
        });

        return rows;
      });
    }

    // Собираем страницу 1
    const p1 = await scrapeCurrentPage();
    console.log(`Найдено на странице: ${p1.length} программ.`);

    // Делаем скриншот полного списка с прокруткой
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tracking_promo_scroll1.png') });

    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'tracking_promo_scroll2.png') });

    // Сохраняем результат
    const resultFile = path.join(OUTPUT_DIR, 'tracking_promocodes_extracted.json');
    fs.writeFileSync(resultFile, JSON.stringify(p1, null, 2), 'utf8');
    console.log(`Данные сохранены в ${resultFile}`);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
