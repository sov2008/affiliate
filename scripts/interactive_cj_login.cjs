const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const LOCAL_STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
const SERVER_REMOTE_PATH = '/var/www/affiliate/artifacts_admitad/cj_auth_state.json';

async function uploadToServer(stateJsonString) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('📡 Connected to production server via SSH...');
      conn.sftp((err, sftp) => {
        if (err) {
          conn.end();
          return reject(err);
        }
        const writeStream = sftp.createWriteStream(SERVER_REMOTE_PATH);
        writeStream.on('close', () => {
          console.log('✅ Remote server cj_auth_state.json successfully updated!');
          conn.end();
          resolve();
        });
        writeStream.on('error', (e) => {
          conn.end();
          reject(e);
        });
        writeStream.write(stateJsonString);
        writeStream.end();
      });
    });
    conn.on('error', reject);
    conn.connect({
      host: '178.128.199.28',
      port: 22,
      username: 'root',
      password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
    });
  });
}

async function runLogin() {
  console.log('🚀 Launching visible Chromium browser for CJ Affiliate login...');
  console.log('👉 Please complete the login and 2FA in the opened browser window.');

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome', // Use local Chrome if available, fallback to bundled chromium
    args: ['--start-maximized']
  }).catch(async () => {
    return await chromium.launch({ headless: false, args: ['--start-maximized'] });
  });

  const context = await browser.newContext({
    viewport: null
  });

  const page = await context.newPage();
  await page.goto('https://members.cj.com/member/publisher/8102806/advertiserSearch.cj', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  console.log('⏳ Waiting for successful navigation to members.cj.com portal (max 5 minutes)...');

  // Poll until user lands inside the logged-in dashboard
  const startTime = Date.now();
  const maxWait = 5 * 60 * 1000; // 5 mins
  let loggedIn = false;

  while (Date.now() - startTime < maxWait) {
    const currentUrl = page.url();
    if (
      currentUrl.includes('members.cj.com') &&
      !currentUrl.includes('signin') &&
      !currentUrl.includes('login') &&
      !currentUrl.includes('identifier')
    ) {
      console.log(`🎉 Logged in successfully! Detected member URL: ${currentUrl}`);
      loggedIn = true;
      break;
    }
    await page.waitForTimeout(2000);
  }

  if (!loggedIn) {
    console.log('⚠️ Timed out waiting for login completion.');
    await browser.close();
    return;
  }

  // Allow extra 3 seconds for cookies to settle
  await page.waitForTimeout(3000);

  // Save storage state locally
  const state = await context.storageState();
  const stateJson = JSON.stringify(state, null, 2);
  fs.writeFileSync(LOCAL_STATE_FILE, stateJson, 'utf8');
  console.log(`💾 Saved ${state.cookies.length} cookies to ${LOCAL_STATE_FILE}`);

  await browser.close();

  // Upload to production server
  try {
    await uploadToServer(stateJson);
  } catch (err) {
    console.error('❌ Error uploading to server:', err.message);
  }

  console.log('🏁 CJ Session Renewal Finished Successfully!');
}

runLogin().catch(console.error);

