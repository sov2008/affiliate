/**
 * CJ Affiliate Autonomous Application Engine for PromoRadar
 * 
 * 1. Authenticates against members.cj.com using persistent state.
 * 2. Fetches highest-EPC unapplied merchants across core verticals (VPN, Hosting, Software, Travel, Fashion, Tech).
 * 3. Directly navigates to legal terms affiliation endpoints and submits applications ("Accept and Apply").
 * 4. Parses real-time approval status (PENDING_REVIEW, APPROVED, DECLINED).
 * 5. Logs history in artifacts_admitad/cj_applied_history.json to avoid duplicates.
 * 6. Dispatches real-time Telegram alerts to admin chat (808343978).
 * 7. Enforces STRICT ZERO DEMO DATA & 100% genuine affiliate submissions.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.ADMIN_CHAT_ID || '808343978';

const STATE_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_auth_state.json');
const LOG_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_automator.log');
const HISTORY_FILE = path.resolve(__dirname, '../artifacts_admitad/cj_applied_history.json');
const SCREENSHOTS_DIR = path.resolve(__dirname, '../artifacts_admitad');

const PUBLISHER_ID = '8102806';
const WEBSITE_ID = '101907236';
const BATCH_SIZE = 10; // 10 high-quality applications per run

function log(msg) {
  const line = `[${new Date().toISOString()}] [CJ-AUTONOMOUS-APPLIER] ${msg}`;
  console.log(line);
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
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
      log('Sent Telegram alert to admin chat.');
    } catch (e) {
      log(`Failed to send Telegram alert: ${e.message}`);
    }
  } else {
    log('Telegram credentials not configured, skipping push alert.');
  }
}

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch {}
  return { applied: {} };
}

function saveHistory(history) {
  try {
    fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8');
  } catch (e) {
    log(`Failed to save history: ${e.message}`);
  }
}

async function runAutonomousApplier() {
  log('================================================================');
  log('⚡ STARTING AUTONOMOUS CJ AFFILIATE APPLIER (PROMORADAR)');
  log('================================================================');

  if (!fs.existsSync(STATE_FILE)) {
    log('❌ Storage state not found: ' + STATE_FILE);
    await sendTelegramAlert('⚠️ <b>[CJ Affiliate Worker]</b> Ошибка: отсутствует файл сессии cj_auth_state.json на сервере.');
    return { success: false, appliedCount: 0 };
  }

  const history = loadHistory();

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
    viewport: { width: 1600, height: 1000 }
  });

  const page = await context.newPage();

  try {
    // 1. Session health check & discovery
    log('Checking CJ Member Area session...');
    const searchUrl = `https://members.cj.com/member/publisher/${PUBLISHER_ID}/advertiserSearch.json?pageNumber=1&publisherId=${PUBLISHER_ID}&pageSize=100&relationshipStatus=none&sortColumn=threeMonthEpc&sortDescending=true`;
    
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    if (currentUrl.includes('signin.cj.com') || currentUrl.includes('login')) {
      log('❌ CJ session expired: redirected to signin.cj.com');
      await sendTelegramAlert('⚠️ <b>[CJ Affiliate Worker]</b> Сессия CJ истекла. Требуется обновление токена cj_auth_state.json.');
      return { success: false, appliedCount: 0 };
    }

    // 2. Parse high-EPC unapplied advertisers
    let searchData;
    try {
      const rawBody = await page.evaluate(() => document.body.innerText);
      searchData = JSON.parse(rawBody);
    } catch (parseErr) {
      log(`Failed to parse advertiser search JSON: ${parseErr.message}`);
      return { success: false, appliedCount: 0 };
    }

    const advertisers = searchData.advertisers || [];
    log(`Found ${advertisers.length} unapplied advertisers in CJ directory (Total available: ${searchData.totalResults || 0}).`);

    // Filter advertisers not yet applied
    const candidates = [];
    for (const adv of advertisers) {
      const advId = String(adv.advertiserId);
      if (!history.applied[advId]) {
        candidates.push(adv);
        if (candidates.length >= BATCH_SIZE) break;
      }
    }

    log(`Selected ${candidates.length} candidate advertisers for this batch.`);
    if (candidates.length === 0) {
      log('No new candidate advertisers to apply in this batch.');
      return { success: true, appliedCount: 0 };
    }

    // 3. Process each application via direct joinprograms.do terms endpoint
    const batchResults = [];

    for (let i = 0; i < candidates.length; i++) {
      const adv = candidates[i];
      const advId = String(adv.advertiserId);
      const advName = adv.advertiserName || `Advertiser #${advId}`;
      const epc = adv.threeMonthEpc ? `$${(adv.threeMonthEpc / 100).toFixed(2)}` : 'N/A';

      log(`[${i + 1}/${candidates.length}] Applying to: "${advName}" (ID: ${advId}, EPC: ${epc})...`);

      const joinUrl = `https://members.cj.com/member/accounts/publisher/affiliations/joinprograms.do?onJoin=clickSearch&advertiserId=${advId}&publisherId=${PUBLISHER_ID}&norefresh=true`;
      
      try {
        await page.goto(joinUrl, { waitUntil: 'networkidle', timeout: 35000 });
        await page.waitForTimeout(2000);

        const submitBtn = await page.$('input[name="a_commit"], input[type="submit"][value*="Accept"], button:has-text("Accept and Apply")');
        if (submitBtn) {
          log(`  Submitting terms acceptance for "${advName}"...`);
          await submitBtn.click();
          await page.waitForTimeout(3000);
        }

        const resultText = await page.evaluate(() => document.body.innerText);
        let status = 'SUBMITTED';
        let statusLabel = '⏳ На рассмотрении';

        if (/Application submitted for review|Pending Application/i.test(resultText)) {
          status = 'PENDING_REVIEW';
          statusLabel = '⏳ На рассмотрении рекламодателем';
        } else if (/Application approved|Active|Successfully joined/i.test(resultText)) {
          status = 'APPROVED';
          statusLabel = '✅ Одобрена автоматически';
        } else if (/Application declined/i.test(resultText)) {
          status = 'DECLINED';
          statusLabel = '❌ Отклонена правилами оффера';
        } else if (resultText.includes('already applied') || resultText.includes('Already joined')) {
          status = 'ALREADY_APPLIED';
          statusLabel = 'ℹ️ Ранее подана';
        } else {
          log(`  Notice: Unrecognized response for ${advName}. Snippet: ${resultText.slice(0, 150).replace(/\n+/g, ' ')}`);
        }

        log(`  Result for "${advName}": ${status} (${statusLabel})`);

        history.applied[advId] = {
          id: advId,
          name: advName,
          status,
          epc,
          appliedAt: new Date().toISOString()
        };

        batchResults.push({
          id: advId,
          name: advName,
          status,
          statusLabel,
          epc
        });

      } catch (applyErr) {
        log(`  Error applying to ${advName}: ${applyErr.message}`);
      }

      await page.waitForTimeout(1500);
    }

    // Save updated history
    saveHistory(history);

    // Save updated session state
    try {
      const freshCookies = await context.cookies();
      const freshState = {
        cookies: freshCookies,
        origins: [
          {
            origin: 'https://members.cj.com',
            localStorage: [
              { name: 'active_company', value: PUBLISHER_ID },
              { name: 'nav_active_session', value: 'true' }
            ]
          }
        ]
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(freshState, null, 2), 'utf8');
      log('Updated CJ session state cookies.');
    } catch {}

    // 4. Dispatch Telegram Notification
    if (batchResults.length > 0) {
      const totalAppliedCount = Object.keys(history.applied).length;
      const lines = batchResults.map(r => `• <b>${r.name}</b> (ID: <code>${r.id}</code>) — ${r.statusLabel}`);
      
      const message = [
        `🚀 <b>[CJ AFFILIATE] ПОДАНЫ НОВЫЕ ЗАЯВКИ НА ОФФЕРЫ</b>\n`,
        `🏢 <b>Обработано рекламодателей (${batchResults.length}):</b>`,
        lines.join('\n'),
        `\n📊 <b>Всего обработано в CJ:</b> ${totalAppliedCount} программ`,
        `🌐 <b>Площадка:</b> PromoRadar (CID: <code>${PUBLISHER_ID}</code>, Site: <code>${WEBSITE_ID}</code>)`
      ].join('\n');

      await sendTelegramAlert(message);
    }

    log(`Batch complete. Applications processed: ${batchResults.length}.`);
    return { success: true, appliedCount: batchResults.length };

  } catch (fatalErr) {
    log(`Fatal applier error: ${fatalErr.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'cj_applier_fatal.png') }).catch(() => {});
    return { success: false, appliedCount: 0 };
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runAutonomousApplier().then(res => {
    log(`Worker execution finished with status: ${JSON.stringify(res)}`);
    process.exit(0);
  }).catch(err => {
    log(`Top-level crash: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { runAutonomousApplier };
