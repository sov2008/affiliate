const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const LOGIN = 'sov7@i.ua';
const PASS = '1hi4PTyUPthkr1QzqrPY';
const WEBSITE_ID = '3007248';
const POSTBACK_URL = 'https://flirtcheck.site/api/postback/admitad?subid=[[subid]]&payment=[[payment]]&status=[[status]]&currency=[[currency]]&order_id=[[order_id]]&advcampaign_id=[[advcampaign_id]]';

const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function takeSnap(page, name) {
  const file = path.join(SCREENSHOTS_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`📸 Screenshot saved: ${file}`);
}

async function dismissCookies(page) {
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      console.log('🍪 Clicking OKAY on cookie modal...');
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
  console.log('🚀 Starting Admitad Automated Setup...');
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();

  try {
    console.log(`🌐 Navigating directly to webmaster website: https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/ ...`);
    await page.goto(`https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
    await dismissCookies(page);
    await takeSnap(page, '10_direct_navigation');

    const emailSelector = 'input[placeholder="Email"], input[type="email"], input[name="username"], input[name="email"], input[name="login"]';
    const passSelector = 'input[placeholder="Пароль"], input[placeholder="Password"], input[type="password"], input[name="password"]';

    if (await page.$(emailSelector)) {
      console.log('🔑 Mitgo ID login form detected!');
      await dismissCookies(page);

      await page.fill(emailSelector, LOGIN);
      console.log('✍️ Email filled:', LOGIN);
      await page.waitForTimeout(300);

      await page.fill(passSelector, PASS);
      console.log('✍️ Password filled.');
      await page.waitForTimeout(500);

      await dismissCookies(page);
      await takeSnap(page, '11_credentials_entered');

      // Click "Войти" button
      console.log('🔘 Submitting login...');
      const loginButton = await page.$('button:has-text("Войти"), button:has-text("Log in"), button[type="submit"]');
      if (loginButton) {
        await loginButton.click({ force: true });
      } else {
        await page.keyboard.press('Enter');
      }

      console.log('⏳ Waiting for authentication and navigation...');
      await page.waitForTimeout(10000);
      await dismissCookies(page);
      await takeSnap(page, '12_after_login');
    }

    console.log(`📍 Current Post-Auth URL: ${page.url()}`);

    // Check if 2FA or verification prompt
    const bodyText = await page.innerText('body').catch(() => '');
    if (bodyText.includes('код') || bodyText.includes('code') || bodyText.includes('подтвержд') || bodyText.includes('Captcha')) {
      console.log('⚠️ Verification code or prompt detected!');
      await takeSnap(page, '13_verification_challenge');
    }

    // Step 2: Postback Configuration
    console.log(`⚙️ Navigating to Postback settings: https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/postbacks/ ...`);
    await page.goto(`https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/postbacks/`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dismissCookies(page);
    await takeSnap(page, '20_postbacks_page');

    // Check if postback already exists or add new
    const pageContent = await page.content();
    if (pageContent.includes('flirtcheck.site/api/postback/admitad')) {
      console.log('✅ Postback URL already registered and active!');
    } else {
      const addPbBtn = await page.$('a:has-text("Добавить Postback"), button:has-text("Добавить Postback"), a:has-text("Добавить"), button:has-text("Добавить"), a:has-text("Add Postback")');
      if (addPbBtn) {
        console.log('➕ Clicking Add Postback button...');
        await addPbBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await takeSnap(page, '21_postback_modal');

        const urlInput = await page.$('input[name*="url"], input[placeholder*="http"], textarea[name*="url"], input[type="text"]');
        if (urlInput) {
          await urlInput.fill(POSTBACK_URL);
          console.log('✍️ Postback URL filled in form');
          await takeSnap(page, '22_postback_url_filled');

          const saveBtn = await page.$('button:has-text("Сохранить"), button:has-text("Save"), button[type="submit"]');
          if (saveBtn) {
            console.log('💾 Saving Postback...');
            await saveBtn.click({ force: true });
            await page.waitForTimeout(3000);
            await takeSnap(page, '23_postback_saved');
          }
        }
      }
    }

    // Step 3: Programs Catalog - Spokeo & BeenVerified
    console.log(`🔍 Navigating to Programs Catalog: https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/programs/ ...`);
    await page.goto(`https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/programs/`, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(4000);
    await dismissCookies(page);
    await takeSnap(page, '30_programs_catalog_page');

    // Search Spokeo
    console.log('🔎 Searching for Spokeo in catalog...');
    const searchInput = await page.$('input[placeholder*="поиск" i], input[placeholder*="search" i], input[type="search"], input[name="keyword"], input[name="query"]');
    if (searchInput) {
      await searchInput.fill('Spokeo');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);
      await takeSnap(page, '31_spokeo_search_results');

      const connectBtn = await page.$('button:has-text("Подключиться"), a:has-text("Подключиться"), button:has-text("Подать заявку"), a:has-text("Подать заявку")');
      if (connectBtn) {
        console.log('🤝 Found Spokeo connect button! Clicking...');
        await connectBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await takeSnap(page, '32_spokeo_connect_modal');

        // Check if there is an agreement checkbox or textarea
        const agreeCheckbox = await page.$('input[type="checkbox"]');
        if (agreeCheckbox) await agreeCheckbox.check().catch(() => {});

        const confirmBtn = await page.$('button:has-text("Подключиться"), button:has-text("Подать заявку"), button:has-text("Отправить"), button:has-text("Apply")');
        if (confirmBtn) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(3000);
          console.log('✅ Spokeo application submitted!');
          await takeSnap(page, '33_spokeo_submitted');
        }
      }
    }

    // Search BeenVerified
    if (searchInput) {
      console.log('🔎 Searching for BeenVerified in catalog...');
      await searchInput.fill('BeenVerified');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(4000);
      await takeSnap(page, '34_beenverified_search_results');

      const connectBtn = await page.$('button:has-text("Подключиться"), a:has-text("Подключиться"), button:has-text("Подать заявку"), a:has-text("Подать заявку")');
      if (connectBtn) {
        console.log('🤝 Found BeenVerified connect button! Clicking...');
        await connectBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await takeSnap(page, '35_beenverified_connect_modal');

        const agreeCheckbox = await page.$('input[type="checkbox"]');
        if (agreeCheckbox) await agreeCheckbox.check().catch(() => {});

        const confirmBtn = await page.$('button:has-text("Подключиться"), button:has-text("Подать заявку"), button:has-text("Отправить"), button:has-text("Apply")');
        if (confirmBtn) {
          await confirmBtn.click({ force: true });
          await page.waitForTimeout(3000);
          console.log('✅ BeenVerified application submitted!');
          await takeSnap(page, '36_beenverified_submitted');
        }
      }
    }

    console.log('🎉 Automation successfully executed all steps.');
  } catch (err) {
    console.error('❌ Error in Admitad automation:', err);
    await takeSnap(page, '99_error_state');
  } finally {
    console.log('⏱️ Keeping session open for 15s before exit...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

run();
