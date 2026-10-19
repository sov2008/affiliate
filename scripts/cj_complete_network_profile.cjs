const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
const LOG_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_automator.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] [CJ-PROFILE-BOT] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n', 'utf8'); } catch {}
}

async function fillNetworkProfile() {
  log('🚀 Launching browser to navigate and complete Promotional Properties / Network Profile...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1600, height: 1000 }
  });

  const page = await context.newPage();

  try {
    // 1. Navigate to Promotional Properties
    log('Opening Promotional Properties page...');
    await page.goto('https://members.cj.com/member/7793684/publisher/account/properties.cj', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    await page.waitForTimeout(4000);

    const url1 = page.url();
    log(`Arrived at: ${url1}`);
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/01_promotional_properties.png') });

    // Look for edit property / complete profile buttons
    const editBtns = await page.$$('button:has-text("Edit"), a:has-text("Edit"), button:has-text("Complete Profile"), a:has-text("Complete Profile"), button:has-text("Create Property"), a:has-text("Create Property")');
    log(`Found ${editBtns.length} edit/property action buttons.`);
    if (editBtns.length > 0) {
      await editBtns[0].click();
      log('Clicked first edit/profile button.');
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/02_edit_modal.png') });
    }

    // Check textarea for description
    const descArea = await page.$('textarea, input[name*="description"], textarea[name*="desc"]');
    if (descArea) {
      log('Filling description...');
      await descArea.fill('PromoRadar (https://promoradar.store/) is an automated promotional coupon and deals aggregator delivering verified discount codes and retail vouchers to online shoppers across USA and Europe.');
      await page.waitForTimeout(1000);
    }

    // Look for Save / Submit
    const saveBtn = await page.$('button:has-text("Save"), button:has-text("Submit"), input[type="submit"]');
    if (saveBtn) {
      log('Clicking Save / Submit...');
      await saveBtn.click();
      await page.waitForTimeout(4000);
      log('✅ Saved property profile!');
    }

    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/03_after_save.png') });

  } catch (err) {
    log(`Error in profile completion: ${err.message}`);
    await page.screenshot({ path: path.resolve(__dirname, '../artifacts_admitad/profile_error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
}

fillNetworkProfile();
