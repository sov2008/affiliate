/**
 * Autonomous Pinterest Publisher & Queue Automation Daemon
 * Standard: Cheltenham Forensic Evidence Gazette // FlirtCheck Laboratory
 * 
 * Features:
 * - Direct integration with PinterestQueueManager (.antigravity/pinterest_queue.json)
 * - Safe organic rate limiting: 20-30m jittered intervals, 25 max daily pins
 * - Instant Telegram notifications upon publication
 * - Automatic background rendering of pending creatives (1000x1500 px)
 * - Playwright headful/headless session handling with cookie preservation
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment credentials
console.log('[DEBUG_PM2]', {
  argv: process.argv,
  main: require.main ? require.main.filename : null,
  filename: __filename,
  isMain: require.main === module
});
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../core/.env') });

const { PinterestQueueManager, CONFIG } = require('./pinterest-queue-manager.cjs');

// Worker Settings
const WORKER_CONFIG = {
  minIntervalMs: parseInt(process.env.PINTEREST_INTERVAL_MS || String(25 * 60 * 1000), 10), // 25 mins
  jitterRangeMs: 8 * 60 * 1000, // +/- jitter up to 8m
  maxDailyPins: parseInt(process.env.PINTEREST_DAILY_MAX || '25', 10), // 25 pins per day
  telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId:
    process.env.TELEGRAM_ALERT_CHAT_ID ||
    process.env.TELEGRAM_CHAT_ID ||
    process.env.ADMIN_CHAT_ID ||
    '',
};

function log(msg, ...args) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [PinterestDaemon] ${msg}`, ...args);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, timeoutMs, errorMsg = 'Operation timed out') {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(errorMsg)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sends formatted alert to Telegram administrator
 */
async function sendTelegramAlert(text) {
  if (!WORKER_CONFIG.telegramToken || !WORKER_CONFIG.telegramChatId) {
    return;
  }
  try {
    const url = `https://api.telegram.org/bot${WORKER_CONFIG.telegramToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: WORKER_CONFIG.telegramChatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      log(`Warning: Telegram alert HTTP ${res.status}`);
    }
  } catch (err) {
    log(`Warning: Failed to send Telegram alert: ${err.message}`);
  }
}

/**
 * Persistent State Manager with daily reset persistence
 */
class StateManager {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = {
      published: {},
      lastRunAt: null,
      dailyCount: 0,
      lastDailyReset: new Date().toDateString(),
    };
    this.load();
  }

  load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        this.state = { ...this.state, ...data };
        this.checkDailyReset();
      } catch (e) {
        log(`Warning: Failed to parse state file, initializing fresh: ${e.message}`);
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      log(`Error saving state: ${e.message}`);
    }
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    if (this.state.lastDailyReset !== today) {
      this.state.dailyCount = 0;
      this.state.lastDailyReset = today;
      this.save();
      log(`[StateManager] Daily counter reset for new date: ${today}`);
    }
  }

  canPublishToday() {
    this.checkDailyReset();
    return this.state.dailyCount < WORKER_CONFIG.maxDailyPins;
  }

  recordPublication(slug, data) {
    this.checkDailyReset();
    this.state.published[slug] = {
      publishedAt: new Date().toISOString(),
      ...data,
    };
    this.state.dailyCount += 1;
    this.state.lastRunAt = new Date().toISOString();
    this.save();
  }
}

/**
 * Executes a single atomic publication step
 */
async function executePublicationCycle(options = {}) {
  const manager = new PinterestQueueManager();
  const stateMgr = new StateManager(CONFIG.stateFile);

  log('--- Starting Pinterest Publication Cycle ---');

  if (!options.force && !stateMgr.canPublishToday()) {
    log(`Daily quota reached (${stateMgr.state.dailyCount}/${WORKER_CONFIG.maxDailyPins} pins). Skipping cycle.`);
    return null;
  }

  // 1. Pre-render any pending items in background
  const pendingItems = manager.queue.filter((i) => i.status === 'pending');
  if (pendingItems.length > 0) {
    log(`Pre-rendering ${pendingItems.length} pending pin creatives...`);
    for (const item of pendingItems.slice(0, 3)) {
      try {
        await manager.renderPinCreative(item);
      } catch (err) {
        log(`Warning rendering creative for ${item.slug}: ${err.message}`);
      }
    }
  }

  // 2. Select target item
  let targetItem = null;
  if (options.targetSlug) {
    targetItem = manager.queue.find((i) => i.slug === options.targetSlug);
    if (!targetItem) {
      throw new Error(`Target post "${options.targetSlug}" not found in queue!`);
    }
  } else {
    targetItem = manager.queue.find((i) => i.status === 'ready' || i.status === 'pending');
  }

  if (!targetItem) {
    log('All items in queue are already published! Nothing to publish.');
    return null;
  }

  log(`Target pin selected: "${targetItem.title}" (${targetItem.slug})`);

  // 3. Publish via Playwright with 120s watchdog protection
  await withTimeout(
    manager.publishItem(targetItem),
    120000,
    `Playwright publish timeout (120s) for ${targetItem.slug}`
  );

  // 4. Update persistent state
  stateMgr.recordPublication(targetItem.slug, {
    title: targetItem.title,
    pinUrl: 'published',
    board: CONFIG.boardName,
    directArticleUrl: targetItem.targetUrl,
  });

  const readyRemaining = manager.queue.filter((i) => i.status === 'ready').length;

  log(`🎉 Pin successfully dispatched: ${targetItem.slug} (Remaining ready: ${readyRemaining})`);

  // 5. Telegram Alert
  const alertText = [
    `📌 <b>[Pinterest] Опубликован новый пин!</b>`,
    ``,
    `🏷 <b>Заголовок:</b> <i>${targetItem.title}</i>`,
    `📂 <b>Рубрика:</b> <code>${targetItem.category || 'General'}</code>`,
    `🔗 <b>Ссылка:</b> <a href="${targetItem.targetUrl}">${targetItem.targetUrl}</a>`,
    `📊 <b>Осталось в очереди:</b> ${readyRemaining} готовых пинов`,
    `📈 <b>Опубликовано за сегодня:</b> ${stateMgr.state.dailyCount} / ${WORKER_CONFIG.maxDailyPins}`,
  ].join('\n');

  await sendTelegramAlert(alertText);

  return targetItem;
}

/**
 * Main Entry Point
 */
async function main() {
  const args = process.argv.slice(2);
  const isOnce = args.includes('--once');
  const slugIdx = args.indexOf('--slug');
  const targetSlug = slugIdx !== -1 && args[slugIdx + 1] ? args[slugIdx + 1] : null;

  if (args.includes('--status')) {
    const manager = new PinterestQueueManager();
    manager.printStatus();
    process.exit(0);
  }

  if (isOnce) {
    log('Running in single-execution mode (--once)...');
    try {
      await executePublicationCycle({ targetSlug, force: true });
      log('Single execution cycle completed successfully.');
      process.exit(0);
    } catch (err) {
      log(`Fatal cycle error: ${err.message}`);
      process.exit(1);
    }
  }

  log(`🚀 Starting Pinterest Daemon...`);
  log(`Base interval: ${WORKER_CONFIG.minIntervalMs / 60000} mins (Daily cap: ${WORKER_CONFIG.maxDailyPins} pins)`);

  // Initial immediate run
  try {
    await executePublicationCycle();
  } catch (err) {
    log(`Initial run warning: ${err.message}`);
  }

  // Continuous loop with randomized delay
  while (true) {
    const jitter = rand(-WORKER_CONFIG.jitterRangeMs / 2, WORKER_CONFIG.jitterRangeMs / 2);
    const delayMs = Math.max(10 * 60 * 1000, WORKER_CONFIG.minIntervalMs + jitter);
    const delayMinutes = Math.round(delayMs / 60000);

    log(`Sleeping for ${delayMinutes} minutes until next scheduled pin...`);
    await sleep(delayMs);

    try {
      await executePublicationCycle();
    } catch (err) {
      log(`Scheduled cycle error: ${err.message}. Retrying in next cycle.`);
    }
  }
}

const isDirectExecution =
  require.main === module ||
  (Boolean(process.argv[1]) && process.argv[1].includes('pinterest-worker'));

if (isDirectExecution) {
  main().catch((err) => {
    console.error('Fatal Daemon Error:', err);
    process.exit(1);
  });
}

module.exports = {
  executePublicationCycle,
  StateManager,
  WORKER_CONFIG,
};
