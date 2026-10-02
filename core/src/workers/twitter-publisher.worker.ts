import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import { chromium } from 'playwright';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LOCK_FILE = path.resolve(
  process.env.TWITTER_LOCK_PATH ||
  path.join(process.cwd(), '.antigravity', 'twitter_publisher.lock')
);

// Ensure lock directory exists
const lockDir = path.dirname(LOCK_FILE);
if (!fs.existsSync(lockDir)) {
  try {
    fs.mkdirSync(lockDir, { recursive: true });
  } catch {}
}

const dbCandidatePaths = [
  path.resolve(process.cwd(), 'core/data/content_queue.sqlite'),
  path.resolve(process.cwd(), 'data/content_queue.sqlite'),
  path.resolve(__dirname, '../../../core/data/content_queue.sqlite'),
  path.resolve(__dirname, '../../data/content_queue.sqlite'),
  '/var/www/affiliate/core/data/content_queue.sqlite',
];
const dbPath = dbCandidatePaths.find(p => fs.existsSync(p)) || dbCandidatePaths[0];

const cookieCandidatePaths = [
  path.resolve(process.cwd(), 'twitter_cookies.json'),
  path.resolve(process.cwd(), '../twitter_cookies.json'),
  path.resolve(__dirname, '../../../twitter_cookies.json'),
  path.resolve(__dirname, '../../twitter_cookies.json'),
  '/var/www/affiliate/twitter_cookies.json',
];
const cookiesPath = cookieCandidatePaths.find(p => fs.existsSync(p)) || cookieCandidatePaths[0];

let isRunning = false;
let intervalTimer: NodeJS.Timeout | null = null;

function acquireLock(): boolean {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pidStr = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      const pid = parseInt(pidStr, 10);
      if (!isNaN(pid)) {
        try {
          process.kill(pid, 0);
          console.warn(`⚠️ [TwitterPublisherWorker] Another instance (PID ${pid}) is running. Exiting.`);
          return false;
        } catch {
          console.log(`[TwitterPublisherWorker] Removing stale lock file for PID ${pid}`);
          fs.unlinkSync(LOCK_FILE);
        }
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
    return true;
  } catch (err: any) {
    console.error(`[TwitterPublisherWorker] Lock acquisition error:`, err.message);
    return false;
  }
}

function releaseLock(): void {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pidStr = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      if (pidStr === String(process.pid)) {
        fs.unlinkSync(LOCK_FILE);
      }
    }
  } catch {}
}

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function runPublishCycle(): Promise<void> {
  if (isRunning) {
    console.log('[TwitterPublisherWorker] Publish cycle already in progress, skipping.');
    return;
  }

  isRunning = true;
  const timestamp = new Date().toISOString();
  console.log(`\n🐦 [TwitterPublisherWorker] [${timestamp}] Starting Twitter publish cycle...`);

  if (!fs.existsSync(cookiesPath)) {
    console.error(`❌ [TwitterPublisherWorker] Cookies file missing at ${cookiesPath}. Cannot publish.`);
    isRunning = false;
    return;
  }

  if (!fs.existsSync(dbPath)) {
    console.error(`❌ [TwitterPublisherWorker] Database missing at ${dbPath}.`);
    isRunning = false;
    return;
  }

  const db = new DatabaseSync(dbPath);

  const pendingItem = db.prepare(`
    SELECT * FROM content_queue_v2 
    WHERE platform = 'TWITTER' AND status = 'APPROVED'
    ORDER BY created_at ASC 
    LIMIT 1
  `).get() as any;

  if (!pendingItem) {
    console.log('ℹ️ [TwitterPublisherWorker] No pending approved tweets found in queue.');
    isRunning = false;
    return;
  }

  const remainingCount = (db.prepare(`
    SELECT count(*) as count FROM content_queue_v2 
    WHERE platform = 'TWITTER' AND status = 'APPROVED'
  `).get() as any).count;

  console.log(`📝 [TwitterPublisherWorker] Selected item ${pendingItem.id} for: ${pendingItem.target_url}`);
  console.log(`📊 [TwitterPublisherWorker] Remaining in queue after this: ${remainingCount - 1}`);

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-infobars',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      locale: 'en-US',
    });

    const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf8'));
    await context.addCookies(cookies);

    const page = await context.newPage();
    await page.goto('https://x.com/compose/post', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await sleep(3500);

    const editor = page.locator('div[role="textbox"][contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 15000 });
    
    // Dismiss any backdrop mask or modal overlays
    const mask = page.locator('div[data-testid="mask"]');
    if (await mask.count() > 0) {
      await page.keyboard.press('Escape').catch(() => {});
      await sleep(500);
    }

    try {
      await editor.click({ force: true, timeout: 5000 });
    } catch {
      await editor.focus().catch(() => {});
    }
    await editor.fill(pendingItem.body);
    await sleep(1500);

    // Resolve and attach Cover Image if available
    let coverPath = pendingItem.image_path || '';
    if (!coverPath || !fs.existsSync(coverPath)) {
      const match = (pendingItem.target_url || '').match(/\/blog\/([^/]+)/);
      if (match) {
        const slug = match[1];
        const candidates = [
          path.resolve(process.cwd(), `blog/public/images/posts/${slug}.webp`),
          path.resolve(process.cwd(), `../blog/public/images/posts/${slug}.webp`),
          path.resolve(__dirname, `../../../blog/public/images/posts/${slug}.webp`),
          path.resolve(__dirname, `../../blog/public/images/posts/${slug}.webp`),
          `/var/www/affiliate/blog/public/images/posts/${slug}.webp`,
        ];
        coverPath = candidates.find(c => fs.existsSync(c)) || '';
      }
    }

    if (coverPath && fs.existsSync(coverPath)) {
      console.log(`🖼️ [TwitterPublisherWorker] Attaching cover image: ${path.basename(coverPath)}`);
      const fileInput = page.locator('input[type="file"][data-testid="fileInput"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles(path.resolve(coverPath));
        await sleep(3500); // Allow image upload preview to render
      }
    } else {
      console.log('ℹ️ [TwitterPublisherWorker] No specific cover image found, publishing text-only.');
    }

    // Publish
    await page.keyboard.press('Control+Enter');
    await sleep(2000);

    const postBtn = page.locator('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]').first();
    if (await postBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await postBtn.click({ force: true }).catch(() => {});
    }
    await sleep(5000);

    // Update status to DISPATCHED
    const publishedUrl = 'https://x.com/TheWeedsorg';
    const updateStmt = db.prepare(`
      UPDATE content_queue_v2 
      SET status = 'DISPATCHED', published_url = ?, updated_at = ?
      WHERE id = ?
    `);
    updateStmt.run(publishedUrl, Date.now(), pendingItem.id);

    // Save refreshed cookies
    const freshCookies = await context.cookies();
    fs.writeFileSync(cookiesPath, JSON.stringify(freshCookies, null, 2), 'utf8');

    console.log(`✅ [TwitterPublisherWorker] Successfully published tweet for ${pendingItem.target_url}`);
  } catch (err: any) {
    console.error(`❌ [TwitterPublisherWorker] Publish error:`, err.message);
  } finally {
    if (browser) await browser.close().catch(() => {});
    isRunning = false;
  }
}

async function startWorker(): Promise<void> {
  console.log('====================================================');
  console.log('🐦 FlirtCheck Twitter (X) Automated Publisher Worker');
  console.log(`PID: ${process.pid} | Node: ${process.version}`);
  console.log(`Database: ${dbPath}`);
  console.log(`Cookies: ${cookiesPath}`);
  console.log('====================================================');

  if (!acquireLock()) {
    process.exit(0);
  }

  // Premium Publishing Cadence: 30 minutes between deep-dive dossiers
  const intervalMinutes = parseInt(process.env.TWITTER_PUBLISH_INTERVAL_MINUTES || '30', 10) || 30;
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`⏱️ Schedule: Publishing next Premium dossier every ${intervalMinutes} minutes.`);

  // If run with --once argument, execute once and exit
  if (process.argv.includes('--once')) {
    console.log('⚡ Single dispatch requested via --once flag.');
    await runPublishCycle();
    releaseLock();
    process.exit(0);
  }

  // Initial check after 5 seconds
  setTimeout(() => {
    runPublishCycle();
  }, 5000);

  // Periodic publishing
  intervalTimer = setInterval(() => {
    runPublishCycle();
  }, intervalMs);
}

function shutdown(signal: string): void {
  console.log(`\n🛑 [TwitterPublisherWorker] Received ${signal}. Shutting down cleanly...`);
  if (intervalTimer) clearInterval(intervalTimer);
  releaseLock();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('exit', () => releaseLock());

startWorker().catch(err => {
  console.error('[TwitterPublisherWorker] Fatal startup error:', err);
  releaseLock();
  process.exit(1);
});
