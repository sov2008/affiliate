const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const LOGIN = 'sov7@i.ua';
const PASS = '1hi4PTyUPthkr1QzqrPY';
const WEBSITE_ID = '3007248';
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
  console.log('🚀 Launching Chrome for Admitad Navigation...');
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  let context;
  if (fs.existsSync(STATE_FILE)) {
    console.log('🔄 Loading saved session cookies...');
    context = await browser.newContext({ storageState: STATE_FILE, viewport: null });
  } else {
    context = await browser.newContext({ viewport: null });
  }

  const page = await context.newPage();

  try {
    console.log(`🌐 Navigating to dashboard: https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/ ...`);
    await page.goto(`https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const emailSelector = 'input[placeholder="Email"], input[type="email"], input[name="username"]';
    if (await page.$(emailSelector)) {
      console.log('🔑 Performing login...');
      await page.fill(emailSelector, LOGIN);
      await page.fill('input[type="password"]', PASS);
      await page.click('button:has-text("Войти")');
      await page.waitForTimeout(8000);
      await dismissCookies(page);

      // Save state
      await context.storageState({ path: STATE_FILE });
      console.log('💾 Session saved to auth_state.json');
    }

    await takeSnap(page, '40_dashboard_logged_in');

    // 1. Inspect navigation links
    console.log('🔍 Inspecting top navigation bar...');
    const navLinks = await page.$$eval('header a, nav a, .header a, .menu a', els =>
      els.map(el => ({ text: el.innerText.trim(), href: el.href })).filter(x => x.text && x.href)
    );
    console.log('📋 Navigation links found:', JSON.stringify(navLinks, null, 2));

    // Look for "Программы"
    console.log('📂 Hovering / Clicking "Программы"...');
    const programsTab = await page.$('a:has-text("Программы"), button:has-text("Программы"), span:has-text("Программы")');
    if (programsTab) {
      await programsTab.hover();
      await page.waitForTimeout(1000);
      await takeSnap(page, '41_programs_dropdown');

      const catalogSublink = await page.$('a:has-text("Каталог"), a:has-text("Все программы"), a[href*="programs"]');
      if (catalogSublink) {
        console.log('➡️ Clicking catalog link...');
        await catalogSublink.click();
      } else {
        await programsTab.click();
      }
      await page.waitForTimeout(5000);
      await dismissCookies(page);
      await takeSnap(page, '42_programs_catalog_loaded');
    }

    console.log(`📍 Current Programs URL: ${page.url()}`);

    // Search Spokeo
    console.log('🔎 Searching for Spokeo...');
    const searchField = await page.$('input[type="search"], input[placeholder*="Поиск" i], input[placeholder*="название" i], input[name="keyword"], input[name="query"], .search input');
    if (searchField) {
      await searchField.fill('Spokeo');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
      await dismissCookies(page);
      await takeSnap(page, '43_spokeo_results');

      // Click "Подключиться" if visible
      const applyBtn = await page.$('button:has-text("Подключиться"), a:has-text("Подключиться"), button:has-text("Подать заявку")');
      if (applyBtn) {
        console.log('🤝 Spokeo connect button clicked!');
        await applyBtn.click({ force: true });
        await page.waitForTimeout(3000);
        await takeSnap(page, '44_spokeo_modal');
      }

      // Search BeenVerified
      console.log('🔎 Searching for BeenVerified...');
      await searchField.fill('');
      await searchField.fill('BeenVerified');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
      await dismissCookies(page);
      await takeSnap(page, '45_beenverified_results');

      const applyBtn2 = await page.$('button:has-text("Подключиться"), a:has-text("Подключиться"), button:has-text("Подать заявку")');
      if (applyBtn2) {
        console.log('🤝 BeenVerified connect button clicked!');
        await applyBtn2.click({ force: true });
        await page.waitForTimeout(3000);
        await takeSnap(page, '46_beenverified_modal');
      }
    }

    // Now look for Postback under Profile Settings or Tools
    console.log('⚙️ Checking Profile / Settings for Postback...');
    const profileBtn = await page.$('.user-menu, .profile, button:has-text("sov2018"), [class*="avatar"], [class*="profile"]');
    if (profileBtn) {
      await profileBtn.click();
      await page.waitForTimeout(1000);
      await takeSnap(page, '47_profile_menu');
    }

    console.log('🏁 Explore cycle complete.');
  } catch (err) {
    console.error('❌ Error during explore:', err);
    await takeSnap(page, '99_explore_error');
  } finally {
    console.log('⏱️ Keeping browser open for 15s...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
