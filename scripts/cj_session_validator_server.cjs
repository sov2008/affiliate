const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
const LOG_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_automator.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
}

async function run() {
  log('🚀 Starting CJ Headless Session Validator...');
  if (!fs.existsSync(STATE_FILE)) {
    log('❌ Storage state file not found: ' + STATE_FILE);
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const context = await browser.newContext({
    storageState: STATE_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  try {
    log('Navigating to CJ Advertisers portal...');
    await page.goto('https://members.cj.com/member/7793684/publisher/advertisers/findAdvertisers.cj', {
      waitUntil: 'networkidle',
      timeout: 45000
    });

    await page.waitForTimeout(3000);
    const url = page.url();
    const title = await page.title();
    log(`Current URL: ${url}`);
    log(`Page Title: ${title}`);

    const screenshotPath = path.resolve(__dirname, '../artifacts_admitad/cj_live_portal_check.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    log(`Saved check screenshot to: ${screenshotPath}`);

    // Check for "Accept Offer" or "Pending Offers"
    const content = await page.content();
    if (content.includes('Accept Offer') || content.includes('Accept Terms') || content.includes('Pending Offers')) {
      log('🎯 Detected Offers / Terms in Member Area!');
    }

    if (url.includes('signin') || url.includes('login')) {
      log('⚠️ Session redirected to login page. Session requires refresh.');
    } else {
      log('🎉 Successfully authenticated in CJ Member Area on production!');
    }

  } catch (err) {
    log(`Execution error: ${err.message}`);
  } finally {
    await browser.close();
  }
}

run();
