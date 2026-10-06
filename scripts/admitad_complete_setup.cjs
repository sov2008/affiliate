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
      await page.waitForTimeout(1000);
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
  console.log('🚀 Launching Admitad Automated Deep Setup...');
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
    // -------------------------------------------------------------------------
    // STEP 1: Postback via Profile Settings
    // -------------------------------------------------------------------------
    console.log('⚙️ Navigating to Profile Settings...');
    await page.goto('https://store.admitad.com/ru/webmaster/settings/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await dismissCookies(page);
    await takeSnap(page, '50_settings_main');

    console.log(`📍 Settings URL: ${page.url()}`);
    // Inspect settings subtabs
    const settingsTabs = await page.$$eval('a, button, [role="tab"]', els =>
      els.map(el => ({ text: el.innerText.trim(), href: el.href })).filter(x => x.text && (x.text.includes('Postback') || x.text.includes('Инструмент') || x.text.includes('Интеграц') || x.text.includes('API') || x.text.includes('Площадк')))
    );
    console.log('📋 Settings related tabs:', JSON.stringify(settingsTabs, null, 2));

    // Check if there is a Postback link/tab
    const pbTab = await page.$('a:has-text("Postback"), button:has-text("Postback"), [href*="postback"]');
    if (pbTab) {
      console.log('🎯 Found Postback tab! Clicking...');
      await pbTab.click();
      await page.waitForTimeout(3000);
      await takeSnap(page, '51_postback_tab_opened');

      // Check form for URL
      const addBtn = await page.$('a:has-text("Добавить"), button:has-text("Добавить"), a:has-text("Создать"), button:has-text("Создать")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(2000);
        await takeSnap(page, '52_add_postback_form');
      }

      const urlInput = await page.$('input[name*="url" i], input[placeholder*="http" i], textarea[name*="url" i]');
      if (urlInput) {
        await urlInput.fill(POSTBACK_URL);
        console.log('✍️ Filled Postback URL');
        await takeSnap(page, '53_postback_url_set');

        const saveBtn = await page.$('button:has-text("Сохранить"), button[type="submit"]');
        if (saveBtn) {
          await saveBtn.click();
          await page.waitForTimeout(3000);
          console.log('💾 Saved Postback URL!');
          await takeSnap(page, '54_postback_saved');
        }
      }
    }

    // -------------------------------------------------------------------------
    // STEP 2: Programs Catalog - Partner Programs & Global Niches
    // -------------------------------------------------------------------------
    console.log('🔍 Navigating to Programs Catalog...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    await dismissCookies(page);
    await takeSnap(page, '60_catalog_overview');

    // Check tab "Аффилиатные программы от партнеров"
    const partnerTab = await page.$('a:has-text("Аффилиатные программы от партнеров"), span:has-text("Аффилиатные программы от партнеров"), div:has-text("Аффилиатные программы от партнеров")');
    if (partnerTab) {
      console.log('📂 Clicking "Аффилиатные программы от партнеров"...');
      await partnerTab.click();
      await page.waitForTimeout(4000);
      await dismissCookies(page);
      await takeSnap(page, '61_partner_programs_tab');

      // Search for Spokeo or BeenVerified
      const searchBox = await page.$('input[type="search"], input[placeholder*="Поиск" i], input[placeholder*="название" i], input[name="keyword"], .search input');
      if (searchBox) {
        console.log('🔎 Searching in partner programs for Spokeo...');
        await searchBox.fill('Spokeo');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
        await takeSnap(page, '62_partner_spokeo_results');

        console.log('🔎 Searching in partner programs for BeenVerified...');
        await searchBox.fill('');
        await searchBox.fill('BeenVerified');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
        await takeSnap(page, '63_partner_beenverified_results');
      }
    }

    // Now return to primary tab and test searches: "VPN", "Dating", "Cyber"
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    const searches = ['VPN', 'Dating', 'Security', 'Nord'];
    for (const term of searches) {
      console.log(`🔎 Searching for niche: "${term}"...`);
      const input = await page.$('input[type="search"], input[placeholder*="Поиск" i], input[name="keyword"], .search input');
      if (input) {
        await input.fill('');
        await input.fill(term);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(4000);
        await dismissCookies(page);
        await takeSnap(page, `70_search_${term.toLowerCase()}`);

        // Scrape found programs
        const cards = await page.$$eval('[class*="offer-card"], [class*="program-card"], .card, article', els =>
          els.map(el => el.innerText.split('\n').filter(Boolean).slice(0, 4).join(' | ')).slice(0, 5)
        );
        console.log(`📊 Found for "${term}":`, cards);
      }
    }

    console.log('🏁 Deep setup cycle finished.');
  } catch (err) {
    console.error('❌ Error during deep setup:', err);
    await takeSnap(page, '99_deep_error');
  } finally {
    console.log('⏱️ Keeping browser open for 15s...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
