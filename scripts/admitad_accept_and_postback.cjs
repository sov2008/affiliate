const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const POSTBACK_URL = 'https://flirtcheck.site/api/postback/admitad?subid=[[subid]]&payment=[[payment]]&status=[[status]]&currency=[[currency]]&order_id=[[order_id]]&advcampaign_id=[[advcampaign_id]]';

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

async function run() {
  console.log('🚀 Connecting to Admitad...');
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  const context = await browser.newContext({ storageState: STATE_FILE, viewport: null });
  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // PART 1: CONNECT NORDVPN
    // -------------------------------------------------------------
    console.log('🔍 Navigating to catalog...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await dismissCookies(page);

    console.log('✍️ Typing NordVPN into search...');
    const searchInput = page.locator('input[placeholder*="Поиск" i], input[type="search"]').first();
    await searchInput.fill('NordVPN');
    await page.waitForTimeout(2000);

    // Look for suggestion in autocomplete
    const option = page.locator('.cdk-overlay-container mat-option, .mat-option, [role="option"], [class*="autocomplete"] div').filter({ hasText: 'NordVPN' }).first();
    if (await option.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('🎯 Clicking autocomplete option...');
      await option.click();
      await page.waitForTimeout(4000);
      await dismissCookies(page);
      await takeSnap(page, '90_nordvpn_page_loaded');

      // Click "Подключиться"
      const connectBtn = page.locator('button, a').filter({ hasText: 'Подключиться' }).first();
      if (await connectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('🤝 Clicking "Подключиться"...');
        await connectBtn.click();
        await page.waitForTimeout(2000);
        await takeSnap(page, '91_modal_opened');

        // Click "Принять" in modal
        const acceptBtn = page.locator('button').filter({ hasText: 'Принять' }).first();
        if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
          console.log('✅ Clicking "Принять" in modal...');
          await acceptBtn.click();
          await page.waitForTimeout(4000);
          console.log('🎉 NordVPN connection confirmed!');
          await takeSnap(page, '92_nordvpn_accepted');
        }
      }
    }

    // -------------------------------------------------------------
    // PART 2: PROFILE SETTINGS & POSTBACK DISCOVERY
    // -------------------------------------------------------------
    console.log('⚙️ Checking profile dropdown for Settings URL...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const badge = page.locator('div:has-text("SO"), span:has-text("SO"), .user-menu, button:has-text("sov2018")').last();
    if (await badge.isVisible()) {
      await badge.click();
      await page.waitForTimeout(1000);
      await takeSnap(page, '93_avatar_clicked');

      const settingsOption = page.locator('a, button, div').filter({ hasText: 'Настройки' }).first();
      if (await settingsOption.isVisible()) {
        console.log('➡️ Clicking "Настройки"...');
        await settingsOption.click();
        await page.waitForTimeout(5000);
        await dismissCookies(page);
        console.log(`📍 Landed on Settings URL: ${page.url()}`);
        await takeSnap(page, '94_settings_landed');

        // Search for postback inside settings
        const allLinks = await page.$$eval('a, button', els =>
          els.map(e => ({ text: e.innerText.trim(), href: e.href || '' })).filter(x => x.text && x.text.length < 35)
        );
        console.log('SETTINGS_ELEMENTS:', JSON.stringify(allLinks, null, 2));

        const pbLink = page.locator('a, button').filter({ hasText: /postback/i }).first();
        if (await pbLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log('🎯 Found Postback element! Clicking...');
          await pbLink.click();
          await page.waitForTimeout(3000);
          await takeSnap(page, '95_postback_screen');

          const addBtn = page.locator('button, a').filter({ hasText: /добавить/i }).first();
          if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await addBtn.click();
            await page.waitForTimeout(2000);
          }

          const urlBox = page.locator('input[type="text"], input[name*="url" i], textarea').first();
          if (await urlBox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await urlBox.fill(POSTBACK_URL);
            await takeSnap(page, '96_postback_entered');

            const saveBtn = page.locator('button').filter({ hasText: /сохранить|save/i }).first();
            if (await saveBtn.isVisible().catch(() => false)) {
              await saveBtn.click();
              await page.waitForTimeout(3000);
              console.log('💾 Postback saved successfully!');
              await takeSnap(page, '97_postback_saved');
            }
          }
        }
      }
    }

  } catch (err) {
    console.error('ERROR:', err);
    await takeSnap(page, '99_critical_err');
  } finally {
    console.log('⏱️ Keeping session open for 15s before closing...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
