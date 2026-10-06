const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const POSTBACK_URL = 'https://flirtcheck.site/api/postback/admitad?subid=[[subid]]&payment=[[payment]]&status=[[status]]&currency=[[currency]]&order_id=[[order_id]]&advcampaign_id=[[advcampaign_id]]';

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    console.log('🌐 Opening: https://store.admitad.com/ru/webmaster/websites/3007248/postback/ ...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/postback/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'exact_postback_page.png') });

    console.log('Current URL:', page.url());

    // Check for add postback button or input
    const content = await page.content();
    console.log('Page title:', await page.title());

    const addBtn = page.locator('button, a').filter({ hasText: /добавить|создать|add/i }).first();
    if (await addBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('➕ Clicking Add Postback button...');
      await addBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'postback_modal_opened.png') });
    }

    const urlInput = page.locator('input[type="text"], input[name*="url" i], textarea').first();
    if (await urlInput.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log('✍️ Entering Postback URL...');
      await urlInput.fill(POSTBACK_URL);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'postback_url_in_field.png') });

      const saveBtn = page.locator('button').filter({ hasText: /сохранить|save/i }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        console.log('💾 Postback saved!');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'postback_saved_final.png') });
      }
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

run();
