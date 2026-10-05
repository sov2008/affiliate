const { chromium } = require('playwright');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const API_ID = Number(process.env.TELEGRAM_APP_API_ID || 36036114);
const API_HASH = process.env.TELEGRAM_APP_API_HASH || '19bd84292c33441170cad1585e7989fc';
const SESSION = process.env.TELEGRAM_USER_SESSION || '';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/auth_state.json');
const ACTIVE_LINKS_FILE = path.resolve(__dirname, '../artifacts_admitad/active_links.json');
const ACTIVE_COUPONS_FILE = path.resolve(__dirname, '../artifacts_admitad/active_coupons.json');

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // Check every 60 minutes

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] [AdmitadAutonomousDaemon] ${msg}`);
}

async function sendTelegramAlert(text) {
  if (BOT_TOKEN && ADMIN_CHAT_ID) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' })
      });
    } catch (e) {
      log(`Failed to send alert via bot token: ${e.message}`);
    }
  } else {
    log(`[Telegram Alert Simulation]: ${text}`);
  }
}

async function checkCatalogModeration() {
  log('Starting catalog status scan (pending vs active)...');
  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  if (process.platform === 'win32' && fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
    launchOptions.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    launchOptions.headless = false;
  }
  const browser = await chromium.launch(launchOptions);

  try {
    const context = await browser.newContext({ storageState: STATE_FILE });
    const page = await context.newPage();

    // 1. Check Connected Programs
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=active', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const activeCards = await page.$$eval('[class*="card"], [class*="program"]', els => {
      return els.map(e => {
        const title = e.querySelector('h2, h3, [class*="title"]')?.innerText || e.innerText.split('\n')[0];
        const link = e.querySelector('a[href*="/offers/"]')?.href || '';
        return { title: title.trim(), link };
      }).filter(x => x.title && !x.title.includes('Спецпредложение'));
    });

    log(`Found ${activeCards.length} ACTIVE approved programs in catalog.`);

    if (activeCards.length > 0) {
      const activeMap = {};
      for (const card of activeCards) {
        activeMap[card.title] = card.link;
      }
      fs.writeFileSync(ACTIVE_LINKS_FILE, JSON.stringify(activeMap, null, 2), 'utf8');
      log(`Saved ${activeCards.length} active programs to ${ACTIVE_LINKS_FILE}`);
    }

    // 2. Check Pending Programs Count
    await page.goto('https://store.admitad.com/ru/webmaster/websites/3007248/catalog/?connection_status=pending', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const pendingCountText = await page.innerText('body');
    const match = pendingCountText.match(/Найдено рекламодателей:\s*(\d+)/);
    const pendingCount = match ? match[1] : 'unknown';
    log(`Total programs currently on moderation: ${pendingCount}`);

    return { activeCount: activeCards.length, pendingCount };
  } catch (err) {
    log(`Error scanning catalog: ${err.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

async function queryAdmitadBot() {
  if (!SESSION) {
    log('TELEGRAM_USER_SESSION not present, skipping MTProto bot query.');
    return;
  }

  log('Connecting to Telegram MTProto for @admitad_bot query...');
  const client = new TelegramClient(new StringSession(SESSION), API_ID, API_HASH, {
    connectionRetries: 3,
  });

  try {
    await client.connect();
    const botEntity = await client.getEntity('admitad_bot');

    // Query Coupons
    log('Querying @admitad_bot for /get_coupons...');
    const sent = await client.sendMessage(botEntity, { message: '/get_coupons' });
    await new Promise(r => setTimeout(r, 4000));
    const messages = await client.getMessages(botEntity, { limit: 2 });
    const reply = messages.find(m => !m.out && m.id > sent.id);

    if (reply && reply.message) {
      log(`@admitad_bot coupon response: ${reply.message.slice(0, 120)}...`);
      fs.writeFileSync(ACTIVE_COUPONS_FILE, JSON.stringify({
        lastChecked: new Date().toISOString(),
        reply: reply.message
      }, null, 2), 'utf8');
    }

    await client.disconnect();
  } catch (err) {
    log(`MTProto bot query error: ${err.message}`);
  }
}

async function executeSyncCycle() {
  log('====================================================');
  log('⚡ EXECUTING ZERO-TOUCH ADMITAD AUTONOMOUS CYCLE');
  log('====================================================');

  const catalogResult = await checkCatalogModeration();
  await queryAdmitadBot();

  log(`Cycle complete. Status: Active=${catalogResult?.activeCount ?? 0}, Pending=${catalogResult?.pendingCount ?? 'N/A'}`);
  log(`Next autonomous sync in ${CHECK_INTERVAL_MS / 60000} minutes.\n`);
}

async function main() {
  log('🚀 Admitad Autonomous Daemon started.');
  await executeSyncCycle();

  setInterval(async () => {
    try {
      await executeSyncCycle();
    } catch (e) {
      log(`Unhandled error in cycle: ${e.message}`);
    }
  }, CHECK_INTERVAL_MS);
}

main().catch(err => {
  log(`FATAL DAEMON ERROR: ${err.message}`);
  process.exit(1);
});
