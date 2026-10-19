/**
 * Admitad Autonomous Auto-Applier for PromoRadar (Ad Space ID: 3012753)
 * 
 * Flow:
 * 1. Fetches top performing campaigns from Admitad Catalog API (high EPC / high rating).
 * 2. Cross-references against already active, pending, or declined programs for ad space 3012753.
 * 3. Uses Playwright with authenticated session state to directly navigate to each offer's join page.
 * 4. Submits application with tailored PromoRadar traffic description and accepts terms.
 * 5. Sends Telegram notifications upon successful submission.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { chromium } = require('playwright');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const WEBSITE_ID = '3012753'; // PromoRadar
const CLIENT_ID = process.env.ADMITAD_CLIENT_ID || '497e2d7ed310265e6e2fb37cd2a237';
const BASE64_HEADER = process.env.ADMITAD_BASE64_HEADER || 'NDk3ZTJkN2VkMzEwMjY1ZTZlMmZiMzdjZDJhMjM3OmY4MzJlOWU0NWQxOGVlN2E2MTU5ZTg3NDE3ODgyNA==';
const SCOPES = 'advcampaigns advcampaigns_for_website coupons coupons_for_website';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const ARTIFACTS_DIR = path.resolve(__dirname, '../artifacts_admitad');
const STATE_FILE = path.resolve(ARTIFACTS_DIR, 'auth_state.json');
const LOG_FILE = path.resolve(ARTIFACTS_DIR, 'admitad_applier.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] [ADMITAD-AUTO-APPLIER] ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch {}
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

async function dismissOverlays(page) {
  try {
    const okayBtn = await page.$('button:has-text("OKAY"), button:has-text("Accept"), button:has-text("Принять"), #cmpwelcomebtnyes');
    if (okayBtn && await okayBtn.isVisible()) {
      await okayBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
    await page.evaluate(() => {
      const banner = document.getElementById('cmpwrapper');
      if (banner) banner.remove();
      const overlays = document.querySelectorAll('.cmpwrapper');
      overlays.forEach(o => o.remove());
    }).catch(() => {});
  } catch {}
}

async function runAutoApplier(maxApplications = 6) {
  log('================================================================');
  log(`🚀 STARTING ADMITAD AUTONOMOUS APPLIER FOR PROMORADAR (${WEBSITE_ID})`);
  log('================================================================');

  if (!fs.existsSync(STATE_FILE)) {
    log(`❌ Session state file not found: ${STATE_FILE}`);
    return;
  }

  const token = await getAccessToken();

  // 1. Get existing programs connected/pending for PromoRadar
  const [activeRes, pendingRes, declinedRes] = await Promise.all([
    apiGet(token, `/advcampaigns/website/${WEBSITE_ID}/?connection_status=active&limit=100`),
    apiGet(token, `/advcampaigns/website/${WEBSITE_ID}/?connection_status=pending&limit=100`),
    apiGet(token, `/advcampaigns/website/${WEBSITE_ID}/?connection_status=declined&limit=100`).catch(() => ({ results: [] }))
  ]);

  const activeIds = new Set((activeRes.results || []).map(r => r.id));
  const pendingIds = new Set((pendingRes.results || []).map(r => r.id));
  const declinedIds = new Set((declinedRes.results || []).map(r => r.id));

  log(`Current state for PromoRadar (3012753): Active=${activeIds.size}, Pending=${pendingIds.size}, Declined=${declinedIds.size}`);

  const excludeSet = new Set([...activeIds, ...pendingIds, ...declinedIds]);

  // 2. Query top campaigns from catalog (page 1 & 2)
  const catalogRes = await apiGet(token, `/advcampaigns/?limit=100&has_moderation=1`);
  const candidates = (catalogRes.results || []).filter(c => {
    if (excludeSet.has(c.id)) return false;
    if (c.status !== 'active') return false;
    // Prefer campaigns with rating >= 3 or good cr/epc
    return (c.rating >= 3 || c.epc > 0 || c.cr > 0);
  });

  log(`Discovered ${candidates.length} qualified candidate programs not yet applied.`);

  if (candidates.length === 0) {
    log('No new candidates to apply to at this time.');
    return;
  }

  // Sort by rating desc, then epc desc
  candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.epc || 0) - (a.epc || 0));

  const batch = candidates.slice(0, maxApplications);
  log(`Selected batch of ${batch.length} campaigns for application: ${batch.map(b => `${b.name} (${b.id})`).join(', ')}`);

  // 3. Launch Playwright
  const launchOpts = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  };
  if (process.platform === 'win32' && fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')) {
    launchOpts.executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  }

  const browser = await chromium.launch(launchOpts);
  const context = await browser.newContext({
    storageState: STATE_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();
  let appliedSuccessCount = 0;

  for (const camp of batch) {
    const offerUrl = `https://store.admitad.com/ru/webmaster/websites/${WEBSITE_ID}/offers/${camp.id}/`;
    log(`Navigating to program page: ${camp.name} (ID: ${camp.id}) -> ${offerUrl}`);

    try {
      await page.goto(offerUrl, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(2500);
      await dismissOverlays(page);

      // Check if button "Подать заявку" / "Подключиться" / join_dialog exists
      const joinBtn = page.locator('button.join_dialog, button:has-text("Подать заявку"), button:has-text("Подключиться")').first();
      
      const isVisible = await joinBtn.isVisible({ timeout: 5000 }).catch(() => false);
      if (!isVisible) {
        log(`ℹ️ Join button not visible for ${camp.name} (ID: ${camp.id}). May already be pending/joined.`);
        continue;
      }

      log(`👉 Clicking Join button for ${camp.name}...`);
      await joinBtn.click({ force: true });
      await page.waitForTimeout(2000);

      // Wait for modal dialog
      const dialog = page.locator('[role="dialog"], mat-dialog-container, .modal, .dialog').first();
      if (await dialog.isVisible({ timeout: 5000 }).catch(() => false)) {
        log(`Dialog opened for ${camp.name}. Filling requirements...`);

        // If traffic description textarea exists, fill it
        const textarea = dialog.locator('textarea, input[type="text"]').first();
        if (await textarea.isVisible().catch(() => false)) {
          const promoDesc = `PromoRadar (https://promoradar.store) is an automated coupon, promo codes, and deals curation portal. We drive high-intent, targeted buyer traffic to promotional discounts, vouchers, and seasonal sales.`;
          await textarea.fill(promoDesc);
          log('Filled traffic source description in dialog.');
          await page.waitForTimeout(500);
        }

        // If rules agreement checkbox exists and not checked, check it
        const checkbox = dialog.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible().catch(() => false)) {
          const isChecked = await checkbox.isChecked().catch(() => false);
          if (!isChecked) {
            await checkbox.check({ force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }

        // Click Accept / Apply button
        const confirmBtn = dialog.locator('button:has-text("Принять"), button:has-text("Подать заявку"), button:has-text("Подключиться"), button:has-text("Отправить")').first();
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click({ force: true });
          log(`✅ Clicked confirmation button for ${camp.name}!`);
          appliedSuccessCount++;
          await page.waitForTimeout(3000);

          // Alert via Telegram
          const alertMsg = `
🚀 <b>[ADMITAD: ПОДАНА НОВАЯ ЗАЯВКА НА ОФФЕР]</b>
━━━━━━━━━━━━━━━━━━
💼 <b>Программа:</b> ${camp.name} (ID: <code>${camp.id}</code>)
🌐 <b>Сайт рекламодателя:</b> <a href="${camp.site_url}">${camp.site_url}</a>
⭐ <b>Рейтинг:</b> ${camp.rating || 'N/A'}★ | <b>CR:</b> ${camp.cr || 0}%
🎯 <b>Площадка:</b> PromoRadar (ID: <code>${WEBSITE_ID}</code>)
━━━━━━━━━━━━━━━━━━
⚡ <i>Заявка успешно отправлена на модерацию в Admitad!</i>
          `.trim();
          await sendTelegramAlert(alertMsg);

        } else {
          log(`⚠️ Confirmation button not found in dialog for ${camp.name}`);
        }
      } else {
        log(`⚠️ Modal dialog did not appear for ${camp.name}`);
      }

    } catch (err) {
      log(`Error applying to ${camp.name} (${camp.id}): ${err.message}`);
    }

    await page.waitForTimeout(2000);
  }

  await browser.close();
  log(`🎉 Application batch complete. Successfully applied to ${appliedSuccessCount} programs.`);
}

if (require.main === module) {
  runAutoApplier().catch(err => {
    console.error('Fatal error in auto applier:', err);
    process.exit(1);
  });
}

module.exports = { runAutoApplier };
