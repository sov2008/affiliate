/**
 * PromoRadar Autonomous Affiliate Sync & Publisher Daemon
 * 
 * Pipeline:
 * 1. Discover & Auto-Connect:
 *    - Periodically scans Admitad catalog across Tier 1 (US, EU, GCC, UK, CA, AU) and Tier 2 (UA, BR, MX).
 *    - Automatically calculates Rule 9 Opportunity Score and submits application via Playwright.
 *    - Dispatches instant Telegram notification to Administrator upon submission.
 * 2. Real-Time Sync & Ingestion:
 *    - Monitors active approved programs and fetches genuine promo codes, discounts, vouchers, and tracking links.
 *    - Categorically rejects RU / BY / KZ affiliate programs (Strict Ban Rule 8).
 * 3. Humanized Copywriting & Schema.org Generation:
 *    - Applies Bespoke Humanized Copywriting standards (Rule 4).
 *    - Generates typed StoreProfile and CouponDeal data, ensuring every active store has at least one verified offer.
 * 4. Build, Deploy & IndexNow:
 *    - Recompiles Astro static portal with updated store pages and sitemaps.
 *    - Deploys directly to production (/var/www/promoradar.store/releases/) and reloads Nginx.
 *    - Pings IndexNow API with fresh sitemap URLs.
 * 5. Telegram Notification:
 *    - Sends comprehensive summary report to Administrator chat (808343978).
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const CLIENT_ID = process.env.ADMITAD_CLIENT_ID || '497e2d7ed310265e6e2fb37cd2a237';
const BASE64_HEADER = process.env.ADMITAD_BASE64_HEADER || 'NDk3ZTJkN2VkMzEwMjY1ZTZlMmZiMzdjZDJhMjM3OmY4MzJlOWU0NWQxOGVlN2E2MTU5ZTg3NDE3ODgyNA==';
const SCOPES = process.env.ADMITAD_SCOPES || 'advcampaigns advcampaigns_for_website banners banners_for_website payments statistics coupons coupons_for_website websites private_data_balance deeplink_generator announcements referrals broken_links';

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const ROOT_DIR = path.resolve(__dirname, '..');
const DEALS_DIR = path.resolve(ROOT_DIR, 'deals-portal');
const DATA_FILE = path.resolve(DEALS_DIR, 'src/data/couponsData.ts');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/promoradar_sync_state.json');

// Check and sync catalog every 30 minutes
const SYNC_INTERVAL_MS = 30 * 60 * 1000;
// Scan and submit applications every 6 hours
const AUTO_CONNECT_INTERVAL_MS = 6 * 60 * 60 * 1000;

function log(msg, ...args) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [PromoRadarWorker] ${msg}`, ...args);
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
      log(`Telegram notification error: ${e.message}`);
    }
  }
}

async function getAccessToken() {
  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    scope: SCOPES
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.admitad.com',
      port: 443,
      path: '/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${BASE64_HEADER}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(d);
          if (json.access_token) resolve(json.access_token);
          else reject(new Error('No access_token: ' + d));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function apiGet(token, apiPath) {
  return new Promise((resolve, reject) => {
    https.get({
      hostname: 'api.admitad.com',
      port: 443,
      path: apiPath,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); } catch { resolve(d); }
      });
    }).on('error', reject);
  });
}

const { syncAndBuild } = require('./promoradar_catalog_sync.cjs');
const { runAutoApplier } = require('./admitad_auto_applier.cjs');
const { runAwinSyncCycle } = require('./awin_promoradar_sync.cjs');

async function runAutoConnect(force = false) {
  let state = {};
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  }

  const now = Date.now();
  const lastRun = state.lastAutoConnectTime || 0;
  if (!force && (now - lastRun < AUTO_CONNECT_INTERVAL_MS)) {
    const hoursLeft = ((AUTO_CONNECT_INTERVAL_MS - (now - lastRun)) / (60 * 60 * 1000)).toFixed(1);
    log(`⏳ [AutoConnect] Cooldown active (next application scan in ~${hoursLeft}h). Skipping.`);
    return;
  }

  log('⚡ [AutoConnect] Scanning catalog & submitting applications for top merchant opportunities...');
  try {
    const result = await runAutoApplier(5);
    state.lastAutoConnectTime = now;
    state.lastAutoConnectResult = result;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
    log(`✅ [AutoConnect] Application batch finished. Applied: ${result ? result.appliedCount : 0}`);
  } catch (err) {
    log(`⚠️ [AutoConnect] Error in auto applier: ${err.message}`);
  }
}

async function runSyncCycle() {
  log('======================================================');
  log('🔄 STARTING PROMORADAR SYNC & PUBLISHING CYCLE');
  log('======================================================');

  let state = {};
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  }

  const previousDealsCount = state.activeDealsCount || 0;
  const previousStoresCount = state.activeStoresCount || 0;

  try {
    await syncAndBuild();
  } catch (syncErr) {
    log(`❌ Admitad catalog sync & build failed: ${syncErr.message}`);
  }

  // Awin Catalog Sync & Continuous Intake
  try {
    log('🔄 [Awin] Checking Awin catalog for high-converting brand opportunities...');
    await runAwinSyncCycle();
  } catch (awinErr) {
    log(`❌ Awin sync error: ${awinErr.message}`);
  }

  // Reload state after sync
  if (fs.existsSync(STATE_FILE)) {
    try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  }

  const newDealsCount = state.activeDealsCount || 0;
  const newStoresCount = state.activeStoresCount || 0;

  // If new deals or stores appeared, trigger auto-deploy to production
  if (newDealsCount > previousDealsCount || newStoresCount > previousStoresCount) {
    log(`🎉 Detected catalog expansion (+${newStoresCount - previousStoresCount} stores, +${newDealsCount - previousDealsCount} deals). Triggering direct production deploy...`);
    try {
      const deployScript = path.resolve(__dirname, 'direct_deploy_promoradar.cjs');
      execSync(`node "${deployScript}"`, { stdio: 'inherit', timeout: 300000 });
      log('🚀 Production deploy & IndexNow ping completed successfully!');

      const publishAlert = `
🚀 <b>[PROMORADAR: НОВЫЕ ПАРТНЕРСКИЕ ПРОГРАММЫ ОПУБЛИКОВАНЫ]</b>
━━━━━━━━━━━━━━━━━━
🏬 <b>Всего магазинов в каталоге:</b> <code>${newStoresCount}</code> (+${newStoresCount - previousStoresCount})
🎟️ <b>Всего активных купонов:</b> <code>${newDealsCount}</code> (+${newDealsCount - previousDealsCount})
🌐 <b>Витрина:</b> <a href="https://promoradar.store">promoradar.store</a>
⚡ <i>Деплой на боевой сервер (178.128.199.28) выполнен, поисковики уведомлены через IndexNow!</i>
      `.trim();
      await sendTelegramAlert(publishAlert);
    } catch (deployErr) {
      log(`⚠️ Deploy notice: ${deployErr.message}`);
    }
  }

  const token = await getAccessToken().catch(() => null);
  if (!token) {
    log('⚠️ Skipping secondary health checks due to token error.');
    return;
  }

  // Broken Links & Safety Check
  try {
    const brokenRes = await apiGet(token, `/broken_links/?limit=20`);
    if (brokenRes.results && brokenRes.results.length > 0) {
      log(`⚠️ Detected ${brokenRes.results.length} broken merchant links in account. Triggering audit.`);
    } else {
      log('🛡️ Broken Links Audit: 0 broken links. All affiliate redirects are healthy.');
    }
  } catch (err) {
    log(`Broken links audit note: ${err.message}`);
  }

  log(`Sync cycle complete. Next run in ${SYNC_INTERVAL_MS / 60000} minutes.\n`);
}

async function main() {
  log('🚀 PromoRadar Continuous Autonomous Expansion Daemon initialized.');
  
  // 1. Initial run: execute application intake, then sync and build
  try {
    await runAutoConnect(true);
    await runSyncCycle();
  } catch (e) {
    log(`Initial sync cycle error: ${e.message}`);
  }

  // 2. Schedule regular cycles
  setInterval(async () => {
    try {
      await runAutoConnect();
      await runSyncCycle();
    } catch (e) {
      log(`Cycle execution error: ${e.message}`);
    }
  }, SYNC_INTERVAL_MS);
}

if (require.main === module) {
  main().catch(err => {
    log(`FATAL ERROR: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runAutoConnect, runSyncCycle };
