const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');

async function takeSnap(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 Screenshot saved: ${file}`);
}

async function dismissCookies(page) {
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      await okayBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => {
      const banner = document.getElementById('cmpwrapper');
      if (banner) banner.remove();
      const overlays = document.querySelectorAll('.cmpwrapper, .modal-backdrop');
      overlays.forEach(o => o.remove());
    }).catch(() => {});
  } catch (err) {}
}

async function applyToProgram(page, queryName) {
  console.log(`\n🔎 [APPLY FLOW] Searching for "${queryName}"...`);
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await dismissCookies(page);

  const searchInput = page.locator('input[placeholder*="Поиск" i], input[type="search"]').first();
  await searchInput.fill(queryName);
  await page.waitForTimeout(2000);

  // Click suggestion
  const option = page.locator('.cdk-overlay-container mat-option, .mat-option, [role="option"], [class*="autocomplete"] div').filter({ hasText: queryName }).first();
  if (await option.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log(`🎯 Clicking suggestion for ${queryName}...`);
    await option.click();
    await page.waitForTimeout(4000);
    await dismissCookies(page);
    await takeSnap(page, `offer_${queryName.toLowerCase()}_page`);

    console.log(`📍 Offer URL: ${page.url()}`);

    // Look for button "Подать заявку" or "Подключиться"
    const applyBtn = page.locator('button, a').filter({ hasText: /подать заявку|подключиться/i }).first();
    if (await applyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log(`🤝 Clicking apply button for ${queryName}...`);
      await applyBtn.click({ force: true });
      await page.waitForTimeout(2500);
      await takeSnap(page, `offer_${queryName.toLowerCase()}_modal`);

      // Check for agreement checkbox / "Принять" button
      const acceptBtn = page.locator('button, a').filter({ hasText: /принять|согласен|подтвердить|подать заявку/i }).first();
      if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`✅ Confirming terms for ${queryName}...`);
        await acceptBtn.click({ force: true });
        await page.waitForTimeout(3000);
        await takeSnap(page, `offer_${queryName.toLowerCase()}_success`);
        console.log(`🎉 Successfully applied to ${queryName}!`);
        return true;
      }
    } else {
      console.log(`ℹ️ Already connected or no apply button for ${queryName}`);
    }
  } else {
    console.log(`⚠️ No direct autocomplete suggestion found for "${queryName}"`);
    await takeSnap(page, `offer_${queryName.toLowerCase()}_no_suggest`);
  }
  return false;
}

async function run() {
  console.log('🚀 Connecting to Admitad for Multi-Offer Application...');
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  const context = await browser.newContext({ storageState: STATE_FILE, viewport: null });
  const page = await context.newPage();

  try {
    // 1. NordVPN
    await applyToProgram(page, 'NordVPN');

    // 2. ExpressVPN
    await applyToProgram(page, 'ExpressVPN');

    // 3. Proton VPN
    await applyToProgram(page, 'Proton VPN');

    // 4. hidemy.name
    await applyToProgram(page, 'hidemy.name');

    // 5. Check other dating/security terms
    await applyToProgram(page, 'PureVPN');
    await applyToProgram(page, 'Surfshark');

  } catch (err) {
    console.error('❌ Error during application flow:', err);
  } finally {
    console.log('⏱️ Keeping session open for 15s...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
