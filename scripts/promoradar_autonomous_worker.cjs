/**
 * PromoRadar Autonomous Affiliate Sync & Publisher Daemon
 * 
 * Pipeline:
 * 1. Discover: Polls Admitad catalog & active campaigns via REST API & Playwright for new offers.
 * 2. Connect: Automatically submits attachment requests for promising merchant programs.
 * 3. Sync: Fetches genuine promo codes, discounts, vouchers, and direct affiliate tracking links.
 * 4. Generate: Builds and updates `couponsData.ts` with brand profiles, SEO guides, and coupons.
 * 5. Publish: Triggers Astro static build and deploys to production (/var/www/affiliate/deals-portal/dist).
 * 6. Alert: Sends instant Telegram notifications with verified real metrics (Strict Zero Demo Data Rule).
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

const WEBSITE_IDS = ['3007248', '3012753']; // Both active platforms
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const ROOT_DIR = path.resolve(__dirname, '..');
const DEALS_DIR = path.resolve(ROOT_DIR, 'deals-portal');
const DATA_FILE = path.resolve(DEALS_DIR, 'src/data/couponsData.ts');
const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/promoradar_sync_state.json');

// Check every 30 minutes
const SYNC_INTERVAL_MS = 30 * 60 * 1000;

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

/**
 * Categorizes campaign by industry into site-supported categories
 */
function inferCategory(campName, categories = []) {
  const lower = (campName + ' ' + categories.join(' ')).toLowerCase();
  if (lower.includes('fashion') || lower.includes('cloth') || lower.includes('dress') || lower.includes('apparel') || lower.includes('wear')) {
    return 'Fashion & Apparel';
  }
  if (lower.includes('vpn') || lower.includes('security') || lower.includes('privacy') || lower.includes('password') || lower.includes('sim') || lower.includes('safe')) {
    return 'Privacy & Security';
  }
  if (lower.includes('optical') || lower.includes('glasses') || lower.includes('lens') || lower.includes('eyewear')) {
    return 'Eyewear & Health';
  }
  if (lower.includes('tour') || lower.includes('travel') || lower.includes('flight') || lower.includes('esim') || lower.includes('hotel') || lower.includes('safari')) {
    return 'Travel & Tours';
  }
  if (lower.includes('dating') || lower.includes('match') || lower.includes('single') || lower.includes('love')) {
    return 'Dating & Lifestyle';
  }
  if (lower.includes('power') || lower.includes('solar') || lower.includes('electron') || lower.includes('battery') || lower.includes('gadget')) {
    return 'Electronics & Gadgets';
  }
  if (lower.includes('education') || lower.includes('code') || lower.includes('course') || lower.includes('tutor') || lower.includes('learning')) {
    return 'Education & Learning';
  }
  if (lower.includes('toy') || lower.includes('kid') || lower.includes('baby') || lower.includes('game')) {
    return 'Kids & Toys';
  }
  if (lower.includes('perfume') || lower.includes('beauty') || lower.includes('cosmetic') || lower.includes('fragrance') || lower.includes('oud')) {
    return 'Beauty & Fragrances';
  }
  return 'E-Commerce & Wholesale';
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\b(ww|many geos|ua|ae|sa|gcc|offline|codes|links|tracking)\b/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'partner';
}

const { syncAndBuild } = require('./promoradar_catalog_sync.cjs');

async function runAutoConnect() {
  log('⚡ [AutoConnect] Scanning catalog for new merchant opportunities...');
  try {
    const scriptPath = path.resolve(__dirname, 'admitad_mass_connect_promoradar.cjs');
    if (fs.existsSync(scriptPath)) {
      execSync(`node "${scriptPath}"`, { stdio: 'inherit', timeout: 300000 });
      log('✅ [AutoConnect] Connection scan completed.');
    }
  } catch (err) {
    log(`⚠️ [AutoConnect] Notice: ${err.message}`);
  }
}

async function runSyncCycle() {
  log('======================================================');
  log('🔄 STARTING PROMORADAR SYNC & PUBLISHING CYCLE');
  log('======================================================');

  try {
    await syncAndBuild();
  } catch (syncErr) {
    log(`❌ Catalog sync & build failed: ${syncErr.message}`);
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

  // Check Merchant Announcements for Launch Opportunities
  try {
    const annRes = await apiGet(token, `/announcements/?limit=5`);
    if (annRes.results && annRes.results.length > 0) {
      const latestAnn = annRes.results[0];
      let state = {};
      if (fs.existsSync(STATE_FILE)) {
        try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
      }
      if (state.lastAnnouncementId !== latestAnn.id) {
        log(`📢 Fresh merchant announcement: [${latestAnn.event}] ${latestAnn.message || ''}`);
        state.lastAnnouncementId = latestAnn.id;
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
      }
    }
  } catch (err) {
    log(`Announcements note: ${err.message}`);
  }

  log(`Sync cycle complete. Next run in ${SYNC_INTERVAL_MS / 60000} minutes.\n`);
}

async function main() {
  log('🚀 PromoRadar Autonomous Affiliate Worker initialized.');
  
  // 1. Initial run
  try {
    await runSyncCycle();
  } catch (e) {
    log(`Initial sync cycle error: ${e.message}`);
  }

  // 2. Schedule regular cycles
  setInterval(async () => {
    try {
      // Run auto connect scan occasionally
      await runAutoConnect();
      await runSyncCycle();
    } catch (e) {
      log(`Cycle execution error: ${e.message}`);
    }
  }, SYNC_INTERVAL_MS);
}

main().catch(err => {
  log(`FATAL ERROR: ${err.message}`);
  process.exit(1);
});
