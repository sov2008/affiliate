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

  const context = await browser.newContext({
    storageState: STATE_FILE,
    viewport: null
  });

  const page = await context.newPage();

  try {
    // 1. Connect to NordVPN WW
    console.log('🔍 Opening catalog to connect NordVPN WW...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const searchInput = await page.$('input[placeholder*="Поиск" i], input[type="search"]');
    if (searchInput) {
      await searchInput.fill('NordVPN');
      await page.waitForTimeout(2000);
      await takeSnap(page, '80_nordvpn_suggest');

      // Click the suggestion for NordVPN WW
      const suggestion = await page.$('div:has-text("NordVPN WW"), span:has-text("NordVPN WW"), a:has-text("NordVPN WW")');
      if (suggestion) {
        console.log('🎯 Clicking NordVPN WW suggestion...');
        await suggestion.click();
        await page.waitForTimeout(4000);
        await dismissCookies(page);
        await takeSnap(page, '81_nordvpn_page');

        // Look for "Подключиться" button
        const connectBtn = await page.$('button:has-text("Подключиться"), a:has-text("Подключиться"), button:has-text("Подать заявку")');
        if (connectBtn) {
          console.log('🤝 Clicking "Подключиться" to NordVPN...');
          await connectBtn.click({ force: true });
          await page.waitForTimeout(2000);
          await takeSnap(page, '82_nordvpn_modal');

          // Check rules checkbox
          const check = await page.$('input[type="checkbox"]');
          if (check) await check.check().catch(() => {});

          const confirm = await page.$('button:has-text("Подключиться"), button:has-text("Подать заявку"), button:has-text("Согласен")');
          if (confirm) {
            await confirm.click({ force: true });
            await page.waitForTimeout(3000);
            console.log('🎉 NordVPN WW Connected!');
            await takeSnap(page, '83_nordvpn_connected');
          }
        }
      }
    }

    // 2. Discover Settings URL from Profile Menu
    console.log('⚙️ Checking Profile Menu for Settings Link...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await dismissCookies(page);

    const userMenu = await page.$('.user-menu, button:has-text("sov2018"), .avatar, [class*="profile"]');
    if (userMenu) {
      await userMenu.click();
      await page.waitForTimeout(1000);
      await takeSnap(page, '84_profile_dropdown');

      const settingsLink = await page.$eval('a:has-text("Настройки")', el => el.href).catch(() => null);
      console.log('🔗 Actual Settings URL found:', settingsLink);

      if (settingsLink) {
        await page.goto(settingsLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        await dismissCookies(page);
        await takeSnap(page, '85_actual_settings_page');

        // Check tabs inside settings
        const tabs = await page.$$eval('a, button, li', els =>
          els.map(el => ({ text: el.innerText.trim(), href: el.href })).filter(x => x.text && x.text.length < 30)
        );
        console.log('📋 Settings Subsections:', JSON.stringify(tabs, null, 2));

        const postbackTab = await page.$('a:has-text("Postback"), button:has-text("Postback"), a[href*="postback"]');
        if (postbackTab) {
          console.log('🎯 Found Postback tab inside settings!');
          await postbackTab.click();
          await page.waitForTimeout(3000);
          await dismissCookies(page);
          await takeSnap(page, '86_postback_section');

          const addBtn = await page.$('a:has-text("Добавить"), button:has-text("Добавить")');
          if (addBtn) {
            await addBtn.click({ force: true });
            await page.waitForTimeout(2000);
            await takeSnap(page, '87_add_postback_dialog');
          }

          const input = await page.$('input[name*="url" i], textarea[name*="url" i], input[type="text"]');
          if (input) {
            await input.fill(POSTBACK_URL);
            await takeSnap(page, '88_url_filled');
            const save = await page.$('button:has-text("Сохранить"), button[type="submit"]');
            if (save) {
              await save.click({ force: true });
              await page.waitForTimeout(3000);
              console.log('💾 Postback URL successfully configured and saved!');
              await takeSnap(page, '89_postback_complete');
            }
          }
        }
      }
    }

  } catch (err) {
    console.error('❌ Error during setup:', err);
    await takeSnap(page, '99_final_error');
  } finally {
    console.log('⏱️ Keeping session open for 15s...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
