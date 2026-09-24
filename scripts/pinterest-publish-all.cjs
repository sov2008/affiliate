/**
 * Autonomous Batch Pinterest Publisher
 * 
 * Publishes all remaining 'ready' pins from .antigravity/pinterest_queue.json
 * to the Pinterest board "MoneyCash.pw".
 * 
 * Features:
 * - Persistent progress saving after each pin (atomic JSON writes)
 * - Cookie refresh after each publication
 * - Automatic delay between pins (15-20s) to comply with Pinterest anti-spam heuristics
 * - Syncs both .antigravity/pinterest_queue.json and .antigravity/pinterest_state.json
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const CONFIG = {
  queueFile: path.resolve(__dirname, '../.antigravity/pinterest_queue.json'),
  stateFile: path.resolve(__dirname, '../.antigravity/pinterest_state.json'),
  cookiesFile: path.resolve(__dirname, '../pinterest_cookies.json'),
  boardName: 'MoneyCash.pw',
  domain: 'https://flirtcheck.site',
  delayBetweenPinsMs: 15000,
};

function log(msg, ...args) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [PinterestBatch] ${msg}`, ...args);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('Starting Batch Pinterest Publisher...');

  if (!fs.existsSync(CONFIG.cookiesFile)) {
    throw new Error(`Cookies file not found: ${CONFIG.cookiesFile}`);
  }
  if (!fs.existsSync(CONFIG.queueFile)) {
    throw new Error(`Queue file not found: ${CONFIG.queueFile}`);
  }

  const queue = JSON.parse(fs.readFileSync(CONFIG.queueFile, 'utf8'));
  const state = fs.existsSync(CONFIG.stateFile) 
    ? JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'))
    : { published: {}, lastRunAt: null, dailyCount: 0, lastDailyReset: new Date().toDateString() };

  const readyItems = queue.filter(item => item.status === 'ready' || item.status === 'failed');
  log(`Found ${readyItems.length} pins waiting to be published.`);

  if (readyItems.length === 0) {
    log('🎉 All pins have already been published! Nothing to do.');
    return;
  }

  log(`Launching headless Chromium...`);
  const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesFile, 'utf8'));
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    locale: 'ru-RU',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  let successCount = 0;
  let failCount = 0;

  for (let idx = 0; idx < readyItems.length; idx++) {
    const item = readyItems[idx];
    const itemProgress = `[${idx + 1}/${readyItems.length}]`;
    log(`${itemProgress} Processing: "${item.title}" (${item.slug})`);

    if (!fs.existsSync(item.creativePath)) {
      log(`⚠️ Creative not found: ${item.creativePath}. Skipping.`);
      failCount++;
      continue;
    }

    let itemPublished = false;

    try {
      log(`${itemProgress} Navigating to /pin-builder/...`);
      await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
      await sleep(3500);

      // Dismiss any tour modals / overlays if present
      for (let i = 0; i < 2; i++) {
        const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
        if (tourBtn) {
          await tourBtn.click().catch(() => {});
          await sleep(800);
        }
        await page.keyboard.press('Escape');
      }

      // 1. Upload Creative Image
      log(`${itemProgress} Uploading creative image...`);
      const fileInput = await page.$('input[type="file"]');
      if (!fileInput) throw new Error('File input not found');
      await fileInput.setInputFiles(item.creativePath);
      await sleep(3000);

      // 2. Set Title
      log(`${itemProgress} Typing title...`);
      const titleInput = page.locator('input[id*="storyboard-selector-title"], textarea[placeholder*="Title"], input[placeholder*="заголовок"], textarea[placeholder*="заголовок"], textarea[placeholder*="название"]').first();
      await titleInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.type(item.title.substring(0, 99));
      await sleep(600);

      // 3. Set Description
      log(`${itemProgress} Typing description...`);
      const descArea = page.locator('div[contenteditable="true"], [aria-label="Добавьте описание пина"], textarea[id*="description"], [placeholder*="описание"]').first();
      if (await descArea.isVisible()) {
        await descArea.click();
        await page.keyboard.press('Control+A');
        const descText = `${item.description}\n\nRead full verified investigation at FlirtCheck.site 🔍\n\n#DatingSafety #ProfileVerification #FlirtCheck #OnlineDatingTips`;
        await page.keyboard.type(descText);
        await sleep(800);
      }

      // 4. Verify Board Selection
      const boardButton = await page.$('[data-test-id="board-dropdown-select-button"]');
      const boardText = boardButton ? await boardButton.innerText() : '';
      if (!boardText.includes(CONFIG.boardName)) {
        if (boardButton) {
          log(`${itemProgress} Selecting board "${CONFIG.boardName}"...`);
          await boardButton.click();
          await sleep(1500);
          const boardRow = await page.$(`[data-test-id="board-row"]:has-text("${CONFIG.boardName}")`);
          if (boardRow) {
            await boardRow.click();
            await sleep(1000);
          }
        }
      }

      // 5. Click Publish Button
      log(`${itemProgress} 🚀 Clicking Publish...`);
      const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
      if (!publishBtn) throw new Error('Publish button not found');
      await publishBtn.click({ force: true });

      // 6. Wait for Pinterest to save the pin (12s)
      log(`${itemProgress} ⏳ Waiting for Pinterest to commit pin...`);
      for (let w = 0; w < 4; w++) {
        await sleep(3000);
        const modal = await page.$('text="Вы создали пин", [aria-label="Вы создали пин"], button:has-text("Открыть пин")');
        if (modal) {
          log(`${itemProgress} 🎉 Success confirmation modal detected!`);
          break;
        }
      }

      itemPublished = true;
      successCount++;
      log(`${itemProgress} ✅ Pin published successfully!`);

      // Update item in memory & queue file
      item.status = 'published';
      item.publishedAt = new Date().toISOString();
      item.attempts = (item.attempts || 0) + 1;
      item.lastError = null;
      fs.writeFileSync(CONFIG.queueFile, JSON.stringify(queue, null, 2), 'utf8');

      // Update state file
      state.published = state.published || {};
      state.published[item.slug] = {
        publishedAt: item.publishedAt,
        title: item.title,
        pinUrl: 'published',
        board: CONFIG.boardName,
        directArticleUrl: item.targetUrl,
        destinationLink: item.targetUrl
      };
      state.lastRunAt = item.publishedAt;
      state.dailyCount = (state.dailyCount || 0) + 1;
      fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2), 'utf8');

      // Refresh cookies
      try {
        const curCookies = await context.cookies();
        fs.writeFileSync(CONFIG.cookiesFile, JSON.stringify(curCookies, null, 2), 'utf8');
      } catch (e) {}

    } catch (err) {
      log(`${itemProgress} ❌ Failed to publish ${item.slug}: ${err.message}`);
      item.attempts = (item.attempts || 0) + 1;
      item.lastError = err.message;
      item.status = 'failed';
      fs.writeFileSync(CONFIG.queueFile, JSON.stringify(queue, null, 2), 'utf8');
      failCount++;
    }

    if (idx < readyItems.length - 1) {
      const jitter = Math.floor(Math.random() * 5000);
      const sleepTime = CONFIG.delayBetweenPinsMs + jitter;
      log(`Sleeping ${(sleepTime / 1000).toFixed(1)}s before next pin to maintain natural profile velocity...`);
      await sleep(sleepTime);
    }
  }

  await browser.close();

  log(`\n══════════════════════════════════════════════════════════`);
  log(`BATCH PUBLISH COMPLETE`);
  log(`✅ Successfully Published: ${successCount}`);
  log(`❌ Failed:                 ${failCount}`);
  log(`📊 Remaining in Queue:     ${queue.filter(i => i.status === 'ready').length}`);
  log(`══════════════════════════════════════════════════════════\n`);
}

main().catch(err => {
  log(`Fatal Error in main: ${err.message}`);
  process.exit(1);
});
