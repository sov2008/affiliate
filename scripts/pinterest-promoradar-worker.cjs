const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const CONFIG = {
  queueFile: '/var/www/affiliate/.antigravity/promoradar_pinterest_queue.json',
  stateFile: '/var/www/affiliate/.antigravity/promoradar_pinterest_state.json',
  cookiesFile: '/var/www/affiliate/pinterest_cookies.json',
  avatarFile: '/var/www/affiliate/scratch/stitch_pinterest/pure_radar_avatar.png',
  minIntervalMs: 45 * 60 * 1000,
  maxDailyPins: 20
};

function log(msg, ...args) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log('[' + ts + '] [PromoRadarWorker] ' + msg, ...args);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function updateProfileAvatar(page) {
  log('Checking / Updating profile avatar to pure radar...');
  try {
    await page.goto('https://www.pinterest.com/settings/edit-profile/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2500);

    const fileInput = await page.$('input[type="file"]');
    if (fileInput && fs.existsSync(CONFIG.avatarFile)) {
      await fileInput.setInputFiles(CONFIG.avatarFile);
      log('Avatar file injected into input[type="file"]');
      await sleep(3500);
      
      const saveBtn = await page.$('button[type="submit"], button:has-text("Сохранить"), button:has-text("Save")');
      if (saveBtn) {
        const isEnabled = await saveBtn.isEnabled().catch(() => false);
        if (isEnabled) {
          await saveBtn.click();
          log('Saved profile with new pure radar avatar');
          await sleep(3000);
        }
      }
    }
  } catch (e) {
    log('Avatar update notice: ' + e.message);
  }
}

async function publishNextPin() {
  if (!fs.existsSync(CONFIG.queueFile) || !fs.existsSync(CONFIG.cookiesFile)) {
    log('Queue or cookies file missing!');
    return;
  }

  const queue = JSON.parse(fs.readFileSync(CONFIG.queueFile, 'utf8'));
  const nextItem = queue.find(q => q.status === 'pending');

  if (!nextItem) {
    log('All pins published! Queue is empty.');
    return;
  }

  log('Target Pin: "' + nextItem.title + '" (' + nextItem.storeName + ' -> Board: "' + nextItem.board + '")');

  const cookies = JSON.parse(fs.readFileSync(CONFIG.cookiesFile, 'utf8'));
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  });
  await context.addCookies(cookies);
  const page = await context.newPage();

  let createdPinId = null;
  page.on('response', async res => {
    if (res.url().includes('PinResource/create')) {
      try {
        const json = await res.json();
        const nodeId = json.resource_response && json.resource_response.data && json.resource_response.data.node_id;
        if (nodeId) {
          const raw = Buffer.from(nodeId, 'base64').toString('utf8');
          createdPinId = raw.replace('Pin:', '');
          log('Captured createdPinId via API: ' + createdPinId);
        }
      } catch (e) {}
    }
  });

  try {
    // 1. First ensure avatar is updated to pure radar
    await updateProfileAvatar(page);

    // 2. Pin Builder Flow
    log('Navigating to pin-builder...');
    await page.goto('https://www.pinterest.com/pin-builder/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await sleep(3000);

    // Dismiss tour / popups
    for (let i = 0; i < 2; i++) {
      const tourBtn = await page.$('button:has-text("Перейти к обзору"), button:has-text("Далее"), button:has-text("ОК"), [aria-label="Отмена"], [aria-label="Close"]');
      if (tourBtn) await tourBtn.click().catch(() => {});
      await page.keyboard.press('Escape');
      await sleep(500);
    }

    // Upload Image
    log('Uploading creative: ' + nextItem.creativePath);
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');
    await fileInput.setInputFiles(nextItem.creativePath);
    await sleep(3500);

    // Title
    log('Filling Title: ' + nextItem.title);
    const titleArea = await page.$('textarea[id*="pin-draft-title"], textarea[placeholder*="название" i], textarea[placeholder*="title" i], [data-test-id="editor-title"] textarea');
    if (titleArea) {
      await titleArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(nextItem.title, { delay: 10 });
    }

    // Description
    log('Filling Description...');
    const descArea = await page.$('div[aria-label*="описание пина" i], div[contenteditable="true"], [data-test-id="editor-description"] div[contenteditable="true"]');
    if (descArea) {
      await descArea.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(nextItem.description, { delay: 5 });
    }

    // Destination Link
    log('Filling Link: ' + nextItem.targetUrl);
    const linkInput = await page.$('textarea[id*="pin-draft-link"], textarea[placeholder*="целевую ссылку" i], textarea[placeholder*="ссылк" i], input[placeholder*="link" i]');
    if (linkInput) {
      await linkInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(nextItem.targetUrl, { delay: 10 });
    }

    // Board Selection
    const targetBoard = nextItem.board;
    log('Checking Board selection for "' + targetBoard + '"...');
    const boardDropdown = await page.$('[data-test-id="board-dropdown-select-button"]');
    if (boardDropdown) {
      const currentText = await boardDropdown.innerText();
      if (!currentText.includes(targetBoard)) {
        await boardDropdown.click();
        await sleep(1500);

        let boardRow = await page.$('[data-test-id="board-row-' + targetBoard + '"], [data-test-id="board-row"]:has-text("' + targetBoard + '")');
        if (boardRow) {
          await boardRow.click();
          await sleep(1000);
        } else {
          // Look for create board button
          log('Board "' + targetBoard + '" not in list, creating...');
          const createBtn = await page.$('[data-test-id="create-board-button"], div:has-text("Создать доску"), button:has-text("Создать доску")');
          if (createBtn) {
            await createBtn.click();
            await sleep(1500);

            // Modal dialog input
            const nameInput = await page.$('div[role="dialog"] input, input[id*="board-name"], input[placeholder*="Например" i]');
            if (nameInput) {
              await nameInput.fill(targetBoard);
              await sleep(500);
              const submitBtn = await page.$('div[role="dialog"] button:has-text("Создать"), button[type="submit"]:has-text("Создать")');
              if (submitBtn) {
                await submitBtn.click();
                log('Created board "' + targetBoard + '" via modal');
                await sleep(2500);
              }
            }
          }
        }
      }
    }

    // Dismiss any leftover flyout
    await page.keyboard.press('Escape');
    await sleep(800);

    // Click Publish
    log('Clicking Publish / Save button...');
    const publishBtn = await page.$('[data-test-id="board-dropdown-save-button"], button:has-text("Опубликовать"), button:has-text("Сохранить")');
    if (!publishBtn) throw new Error('Publish button not found');

    await publishBtn.focus().catch(() => {});
    await publishBtn.click({ force: true }).catch(() => {});
    await page.keyboard.press('Enter').catch(() => {});

    // Wait for confirmation
    log('Waiting for confirmation...');
    let confirmed = false;
    for (let i = 0; i < 15; i++) {
      await sleep(1500);
      if (createdPinId) {
        confirmed = true;
        log('Confirmed via API Pin ID: ' + createdPinId);
        break;
      }
      const cur = page.url();
      if (cur.includes('/pin/')) {
        confirmed = true;
        log('Confirmed via URL redirect: ' + cur);
        break;
      }
      const toast = await page.$('text="Сохранено на доске", text="Вы создали пин", [role="alert"]');
      if (toast) {
        confirmed = true;
        log('Confirmed via Toast alert');
        break;
      }
    }

    // Mark status
    nextItem.status = 'published';
    nextItem.pinUrl = createdPinId ? ('https://www.pinterest.com/pin/' + createdPinId + '/') : 'https://www.pinterest.com/PromoRadarStore/';
    nextItem.publishedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.queueFile, JSON.stringify(queue, null, 2), 'utf8');

    // Fresh cookies
    const freshCookies = await context.cookies();
    fs.writeFileSync(CONFIG.cookiesFile, JSON.stringify(freshCookies, null, 2), 'utf8');

    // Take screenshot of live profile
    await page.goto('https://www.pinterest.com/PromoRadarStore/', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);
    await page.screenshot({ path: '/var/www/affiliate/scratch/final_live_profile.png', fullPage: false });
    log('Final profile screenshot captured at /var/www/affiliate/scratch/final_live_profile.png');

  } catch (err) {
    log('Error: ' + err.message);
    await page.screenshot({ path: '/var/www/affiliate/scratch/publish_error.png' }).catch(() => {});
  } finally {
    await browser.close();
  }
}

publishNextPin().catch(console.error);

