const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const OUTPUT_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function main() {
  console.log('Фильтрация "Без модерации" в tracking_promocode_programs...');
  
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

    // Кликаем чекбокс "Без модерации"
    const noModCheckbox = page.locator('label:has-text("Без модерации")');
    if (await noModCheckbox.count() > 0) {
      await noModCheckbox.click();
      await page.waitForTimeout(3000);
      console.log('Чекбокс "Без модерации" нажат.');
    }

    const screenshotPath = path.join(OUTPUT_DIR, 'tracking_promo_no_moderation.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Скриншот: ${screenshotPath}`);

    const info = await page.evaluate(() => {
      const match = document.body.innerText.match(/Найдено рекламодателей:\s*(\d+)/);
      return {
        count: match ? match[1] : 'unknown',
        snippet: document.body.innerText.slice(0, 1500)
      };
    });

    console.log('Найдено программ без модерации:', info.count);

  } catch (err) {
    console.error('Ошибка:', err);
  } finally {
    await browser.close();
  }
}

main();
