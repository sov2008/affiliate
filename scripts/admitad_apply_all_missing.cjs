const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const TRAFFIC_DESC = 'Editorial cybersecurity and dating safety investigative platform (flirtcheck.site). Organic SEO and social investigative journalism covering identity verification and romance scam prevention. We place context-relevant verification CTAs inside analytical longreads for US/UK/CA audience.';

const TARGET_OFFERS = [
  { id: '103765', name: 'ExpressVPN' },
  { id: '162597', name: 'Proton VPN' },
  { id: '24210', name: 'Surfshark' },
  { id: '34688', name: 'PureVPN' },
];

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

async function applyOnOfferPage(page, offer) {
  const url = `https://store.admitad.com/ru/webmaster/websites/3007248/offers/${offer.id}/`;
  console.log(`\n======================================================`);
  console.log(`🚀 Applying to ${offer.name} (${offer.id}): ${url}`);
  console.log(`======================================================`);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await dismissCookies(page);

  const pageText = await page.innerText('body');
  if (pageText.includes('Рекламные материалы') && !pageText.includes('Подать заявку')) {
    console.log(`✅ ${offer.name} is ALREADY connected or on moderation!`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `applied_${offer.name}_already.png`) });
    return true;
  }

  const applyBtn = page.locator('button, a').filter({ hasText: /подать заявку|подключиться/i }).first();
  if (await applyBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    console.log(`🔘 Clicking "Подать заявку" for ${offer.name}...`);
    await applyBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // Click "Принять" in modal
    const acceptBtn = page.locator('button').filter({ hasText: 'Принять' }).first();
    if (await acceptBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      console.log(`🟣 Clicking "Принять" in modal for ${offer.name}...`);
      await acceptBtn.click({ force: true });
      await page.waitForTimeout(3000);
    }

    // Check if description textarea appeared
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`✍️ Filling description for ${offer.name}...`);
      await textarea.fill(TRAFFIC_DESC);
      await page.waitForTimeout(500);

      const confirmBtn = page.locator('button').filter({ hasText: /подключиться|подать заявку|отправить/i }).last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(3000);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `applied_${offer.name}_result.png`) });
    console.log(`🎉 Processed application for ${offer.name}!`);
    return true;
  } else {
    console.log(`⚠️ No apply button found for ${offer.name}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `applied_${offer.name}_no_btn.png`) });
    return false;
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  try {
    for (const off of TARGET_OFFERS) {
      await applyOnOfferPage(page, off);
    }

    // Now navigate to moderation list to verify all
    console.log('\n🔍 Verifying all applications on moderation page...');
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=pending', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await dismissCookies(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'all_pending_verified.png') });

    const totalText = await page.innerText('body');
    const match = totalText.match(/Найдено рекламодателей:\s*(\d+)/);
    if (match) {
      console.log(`📊 TOTAL PENDING ADVERTISERS: ${match[1]}`);
    }

  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

run();
