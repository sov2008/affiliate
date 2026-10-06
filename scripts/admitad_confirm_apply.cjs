const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const TRAFFIC_DESC = 'Editorial cybersecurity and dating safety investigative platform (flirtcheck.site). Organic SEO and social investigative journalism covering identity verification and romance scam prevention. We place context-relevant verification CTAs inside analytical longreads for US/UK/CA audience.';

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
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    console.log('🌐 Opening NordVPN WW offer page: 18867 ...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/offers/18867/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await dismissCookies(page);

    const applyBtn = page.locator('button, a').filter({ hasText: /подать заявку/i }).first();
    if (await applyBtn.isVisible()) {
      console.log('🔘 Clicking "Подать заявку"...');
      await applyBtn.click({ force: true });
      await page.waitForTimeout(2000);

      // In modal click "Принять"
      const acceptBtn = page.locator('button:has-text("Принять")').first();
      if (await acceptBtn.isVisible()) {
        console.log('🟣 Clicking "Принять" in modal...');
        await acceptBtn.click({ force: true });
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_after_accept.png') });

        // If a description textarea appears:
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible().catch(() => false)) {
          console.log('✍️ Filling traffic source description...');
          await textarea.fill(TRAFFIC_DESC);
          await page.waitForTimeout(1000);

          const finalBtn = page.locator('button:has-text("Подключиться"), button:has-text("Подать заявку"), button:has-text("Отправить")').last();
          if (await finalBtn.isVisible()) {
            await finalBtn.click({ force: true });
            await page.waitForTimeout(3000);
          }
        }

        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'nordvpn_final_submitted.png') });
        console.log('🎉 Successfully applied to NordVPN!');
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
