import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { SocialSyndicatorService } from '../services/socialSyndicator.service.js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const LOCK_FILE = path.resolve(
  process.env.SYNDICATOR_LOCK_PATH ||
  path.join(process.cwd(), '.antigravity', 'social_syndicator.lock')
);

// Ensure lock directory exists
const lockDir = path.dirname(LOCK_FILE);
if (!fs.existsSync(lockDir)) {
  try {
    fs.mkdirSync(lockDir, { recursive: true });
  } catch {}
}

let isRunning = false;
let intervalTimer: NodeJS.Timeout | null = null;

function acquireLock(): boolean {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pidStr = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      const pid = parseInt(pidStr, 10);
      if (!isNaN(pid)) {
        try {
          // Check if process is still alive
          process.kill(pid, 0);
          console.warn(`⚠️ [SocialSyndicatorWorker] Another instance (PID ${pid}) is already running. Exiting.`);
          return false;
        } catch {
          // Stale lock file
          console.log(`[SocialSyndicatorWorker] Removing stale lock file for PID ${pid}`);
          fs.unlinkSync(LOCK_FILE);
        }
      }
    }
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: 'wx' });
    return true;
  } catch (err: any) {
    console.error(`[SocialSyndicatorWorker] Lock acquisition error:`, err.message);
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

async function runSyndicationCycle(): Promise<void> {
  if (isRunning) {
    console.log('[SocialSyndicatorWorker] Cycle already in progress, skipping.');
    return;
  }

  isRunning = true;
  console.log(`[SocialSyndicatorWorker] [${new Date().toISOString()}] Starting syndication cycle...`);

  try {
    const syndicator = SocialSyndicatorService.getInstance();
    const result = await syndicator.dispatchNextSnippet();

    if (result.success) {
      console.log(`✅ [SocialSyndicatorWorker] Dispatched snippet ${result.item?.id}: ${result.message}`);
    } else {
      console.log(`ℹ️ [SocialSyndicatorWorker] Cycle result: ${result.message}`);
    }
  } catch (err: any) {
    console.error(`❌ [SocialSyndicatorWorker] Exception in syndication cycle:`, err.message);
  } finally {
    isRunning = false;
  }
}

async function startWorker(): Promise<void> {
  console.log('====================================================');
  console.log('📡 FlirtCheck Social Syndication Worker');
  console.log(`PID: ${process.pid} | Node: ${process.version}`);
  console.log('====================================================');

  if (!acquireLock()) {
    process.exit(0);
  }

  const intervalMinutes = parseInt(process.env.SYNDICATION_INTERVAL_MINUTES || '30', 10) || 30;
  const intervalMs = intervalMinutes * 60 * 1000;

  console.log(`⏱️ Schedule: Checking queue every ${intervalMinutes} minutes.`);

  // Initial dispatch check after 10 seconds of startup
  setTimeout(() => {
    runSyndicationCycle();
  }, 10000);

  // Periodic timer
  intervalTimer = setInterval(() => {
    runSyndicationCycle();
  }, intervalMs);
}

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n🛑 [SocialSyndicatorWorker] Received ${signal}. Shutting down cleanly...`);
  if (intervalTimer) clearInterval(intervalTimer);
  releaseLock();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('exit', () => releaseLock());

startWorker().catch((err) => {
  console.error('[SocialSyndicatorWorker] Fatal error:', err);
  releaseLock();
  process.exit(1);
});
