const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const CLIENT_ID = process.env.ADMITAD_CLIENT_ID || '497e2d7ed310265e6e2fb37cd2a237';
const BASE64_HEADER = process.env.ADMITAD_BASE64_HEADER || 'NDk3ZTJkN2VkMzEwMjY1ZTZlMmZiMzdjZDJhMjM3OmY4MzJlOWU0NWQxOGVlN2E2MTU5ZTg3NDE3ODgyNA==';
const WEBSITE_ID = process.env.ADMITAD_WEBSITE_ID || '3007248';
const SCOPES = process.env.ADMITAD_SCOPES || 'advcampaigns advcampaigns_for_website banners banners_for_website payments statistics coupons coupons_for_website websites private_data_balance deeplink_generator announcements referrals broken_links';

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const ACTIVE_LINKS_FILE = path.join(ARTIFACTS_DIR, 'active_links.json');
const KNOWN_PROGRAMS_FILE = path.join(ARTIFACTS_DIR, 'known_programs_state.json');

const CHECK_INTERVAL_MS = 15 * 60 * 1000; // Check every 15 minutes (REST API is lightweight)

let cachedToken = null;
let tokenExpiresAt = 0;

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
      log(`Failed to send alert via Telegram: ${e.message}`);
    }
  } else {
    log(`[Telegram Alert Simulation]: ${text}`);
  }
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 60_000) {
    return cachedToken;
  }

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
          if (json.access_token) {
            cachedToken = json.access_token;
            tokenExpiresAt = Date.now() + (json.expires_in * 1000);
            resolve(cachedToken);
          } else {
            reject(new Error('No access_token in response: ' + d));
          }
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
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, text: d }); }
      });
    }).on('error', reject);
  });
}

async function executeSyncCycle() {
  log('====================================================');
  log('⚡ EXECUTING ZERO-TOUCH ADMITAD REST API CYCLE');
  log('====================================================');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const token = await getAccessToken();

  // 1. Fetch active programs
  const activeRes = await apiGet(token, `/advcampaigns/website/${WEBSITE_ID}/?connection_status=active&limit=100`);
  const activeItems = activeRes.data?.results || [];
  const activeCount = activeRes.data?._meta?.count || activeItems.length;

  log(`Active approved programs in Admitad: ${activeCount}`);

  // Build active map { [name]: gotolink, [id]: gotolink, details }
  const activeMap = {};
  const currentActiveIds = new Set();

  for (const it of activeItems) {
    currentActiveIds.add(it.id);
    activeMap[it.name] = it.gotolink;
    activeMap[`id_${it.id}`] = {
      id: it.id,
      name: it.name,
      gotolink: it.gotolink,
      site_url: it.site_url,
      rating: it.rating,
      cr: it.cr,
      epc: it.epc
    };
  }

  fs.writeFileSync(ACTIVE_LINKS_FILE, JSON.stringify(activeMap, null, 2), 'utf8');

  // 2. Fetch pending moderation count
  const pendingRes = await apiGet(token, `/advcampaigns/website/${WEBSITE_ID}/?connection_status=pending&limit=100`);
  const pendingCount = pendingRes.data?._meta?.count || (pendingRes.data?.results || []).length;
  log(`Programs currently on moderation: ${pendingCount}`);

  // 3. Detect state changes (Newly Approved Programs!)
  let knownState = { activeIds: [] };
  if (fs.existsSync(KNOWN_PROGRAMS_FILE)) {
    try {
      knownState = JSON.parse(fs.readFileSync(KNOWN_PROGRAMS_FILE, 'utf8'));
    } catch {}
  }

  const previousActiveSet = new Set(knownState.activeIds || []);
  const newlyApproved = activeItems.filter(it => !previousActiveSet.has(it.id));

  if (newlyApproved.length > 0 && previousActiveSet.size > 0) {
    for (const prog of newlyApproved) {
      log(`🎉 NEW PROGRAM APPROVED BY ADMITAD: ${prog.name} (ID: ${prog.id})`);
      const msg = `
🎉 <b>[ADMITAD: ПРОГРАММА ОДОБРЕНА!]</b>
━━━━━━━━━━━━━━━━━━
💼 <b>Оффер:</b> ${prog.name} (ID: <code>${prog.id}</code>)
🌐 <b>Сайт рекламодателя:</b> <a href="${prog.site_url}">${prog.site_url}</a>
🔗 <b>Gotolink:</b> <code>${prog.gotolink}</code>
📊 <b>Рейтинг / CR:</b> ${prog.rating || 'N/A'}★ / ${prog.cr || 0}%
━━━━━━━━━━━━━━━━━━
⚡ <i>Трафик блога и TDS (/go) автоматически переключены на одобренный оффер!</i>
      `.trim();
      await sendTelegramAlert(msg);
    }
  }

  // Update known state
  fs.writeFileSync(KNOWN_PROGRAMS_FILE, JSON.stringify({
    activeIds: Array.from(currentActiveIds),
    lastSync: new Date().toISOString()
  }, null, 2), 'utf8');

  // 4. Broken links monitor
  try {
    const brokenRes = await apiGet(token, `/broken_links/?website=${WEBSITE_ID}`);
    const brokenItems = brokenRes.data?.results || [];
    if (brokenItems.length > 0) {
      log(`⚠️ Broken links detected: ${brokenItems.length}`);
      const brokenMsg = `
🚨 <b>[ADMITAD: ВНИМАНИЕ — БИТЫЕ ССЫЛКИ]</b>
━━━━━━━━━━━━━━━━━━
Обнаружено <b>${brokenItems.length}</b> неработающих ссылок на офферы.
Проверьте статус программ в кабинете Admitad.
      `.trim();
      await sendTelegramAlert(brokenMsg);
    } else {
      log('Broken links check: 0 issues found (Clean).');
    }
  } catch (e) {
    log(`Broken links check note: ${e.message}`);
  }

  // 5. Recent Actions / Conversion check (Strict Zero Demo Data Rule)
  try {
    const today = new Date().toISOString().slice(0, 10);
    const actionsRes = await apiGet(token, `/statistics/actions/?website=${WEBSITE_ID}&date_start=${today}`);
    const actions = actionsRes.data?.results || [];
    if (actions.length > 0) {
      log(`💰 Real actions detected today: ${actions.length}`);
      for (const act of actions) {
        const actMsg = `
💰 <b>[ADMITAD: РЕАЛЬНАЯ КОНВЕРСИЯ!]</b>
━━━━━━━━━━━━━━━━━━
💼 <b>Оффер:</b> ${act.advcampaign_name}
💵 <b>Выплата:</b> ${act.payment} ${act.currency} (Статус: <b>${act.status.toUpperCase()}</b>)
🆔 <b>Order ID:</b> <code>${act.order_id}</code>
🎯 <b>Click ID (SubID):</b> <code>${act.subid || 'direct'}</code>
⏱️ <b>Время:</b> <code>${act.action_date}</code>
        `.trim();
        await sendTelegramAlert(actMsg);
      }
    }
  } catch (e) {
    log(`Actions check note: ${e.message}`);
  }

  log(`Cycle complete. Status: Active=${activeCount}, Pending=${pendingCount}`);
  log(`Next autonomous sync in ${CHECK_INTERVAL_MS / 60000} minutes.\n`);
}

async function main() {
  log('🚀 Admitad Autonomous REST API Daemon started (Zero-Touch Mode).');
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
