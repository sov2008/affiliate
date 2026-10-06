const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const TRAFFIC_DESC = 'Editorial cybersecurity and dating safety investigative platform (flirtcheck.site). Organic SEO and social investigative journalism covering identity verification, romance scam prevention, and digital privacy. We place context-relevant CTAs and review blocks inside analytical longreads for Tier-1 US/UK/CA audience.';

const TARGET_OFFERS = [
  { id: '22143', name: 'Norton_Antivirus' },
  { id: '168984', name: 'Avast' },
  { id: '24655', name: 'Clevguard_AntiSpy' },
  { id: '28424', name: 'Keeper_Security' },
  { id: '144643', name: 'Qustodio' },
  { id: '191148', name: 'Onlinesim_Virtual_Numbers' },
  { id: '29056', name: 'Airalo_eSIM' },
  { id: '169376', name: 'Proton_Ecosystem' },
  { id: '127996', name: 'AOMEI_Backup' },
  { id: '44814', name: 'Global_YO_eSIM' },
  { id: '49070', name: 'Elitedate_Dating' },
  { id: '26969', name: 'Bunches_Flowers' },
  { id: '18696', name: 'Kiwi_Travel' },
  { id: '28476', name: 'iolo_System_Mechanic' },
  { id: '6115', name: 'AliExpress' },
  { id: '118860', name: 'WPS_Office' }
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

async function applyToOffer(page, offer) {
  const url = `https://store.admitad.com/ru/webmaster/websites/3007248/offers/${offer.id}/`;
  console.log(`\n======================================================`);
  console.log(`🚀 [${offer.name}] (ID: ${offer.id}) -> ${url}`);

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await dismissCookies(page);

    const bodyText = await page.innerText('body');

    if (bodyText.includes('Рекламные материалы') && !bodyText.includes('Подать заявку')) {
      console.log(`✅ [${offer.name}] ALREADY active / on moderation!`);
      return { offer: offer.name, id: offer.id, status: 'ALREADY_APPLIED' };
    }

    const applyBtn = page.locator('button, a').filter({ hasText: /подать заявку|подключиться/i }).first();
    const btnVisible = await applyBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (!btnVisible) {
      console.log(`⚠️ [${offer.name}] Apply button not found (possibly already pending or restricted)`);
      return { offer: offer.name, id: offer.id, status: 'BUTTON_NOT_FOUND' };
    }

    console.log(`🔘 Clicking "Подать заявку / Подключиться" for ${offer.name}...`);
    await applyBtn.click({ force: true });
    await page.waitForTimeout(2000);

    // Modal check: "Принять" button
    const acceptBtn = page.locator('button').filter({ hasText: 'Принять' }).first();
    if (await acceptBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log(`🟣 Clicking "Принять" rules for ${offer.name}...`);
      await acceptBtn.click({ force: true });
      await page.waitForTimeout(2500);
    }

    // Modal check: textarea for traffic description
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log(`✍️ Filling traffic description for ${offer.name}...`);
      await textarea.fill(TRAFFIC_DESC);
      await page.waitForTimeout(500);

      const confirmBtn = page.locator('button').filter({ hasText: /подключиться|подать заявку|отправить/i }).last();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click({ force: true });
        await page.waitForTimeout(2500);
      }
    }

    const screenshotPath = path.join(SCREENSHOTS_DIR, `batch_applied_${offer.name}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`🎉 [${offer.name}] Application submitted successfully! Saved: ${screenshotPath}`);

    return { offer: offer.name, id: offer.id, status: 'SUBMITTED' };
  } catch (err) {
    console.error(`❌ [${offer.name}] Failed to apply:`, err.message);
    return { offer: offer.name, id: offer.id, status: 'ERROR', error: err.message };
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  const results = [];

  for (const offer of TARGET_OFFERS) {
    const res = await applyToOffer(page, offer);
    results.push(res);
    await page.waitForTimeout(1000);
  }

  // Finally take a fresh screenshot of all on moderation
  console.log('\n📊 Refreshing moderation catalog view...');
  await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await dismissCookies(page);

  const modCheckbox = page.locator('label:has-text("На модерации")').first();
  if (await modCheckbox.isVisible()) {
    await modCheckbox.scrollIntoViewIfNeeded();
    await modCheckbox.click();
    await page.waitForTimeout(3000);
  }

  const finalScreenshot = path.join(SCREENSHOTS_DIR, 'batch_all_moderation_final.png');
  await page.screenshot({ path: finalScreenshot, fullPage: true });

  await browser.close();

  console.log('\n======================================================');
  console.log('BATCH APPLICATION COMPLETE! Results:');
  console.log(JSON.stringify(results, null, 2));
  console.log(`Final catalog screenshot saved to: ${finalScreenshot}`);
}

run().catch(console.error);
