/**
 * Pinterest Background Queue Worker
 * 
 * Runs through the pending/ready queue in .antigravity/pinterest_queue.json
 * with safe delays to respect Pinterest rate limits.
 * 
 * Usage:
 *   node scripts/pinterest-queue-worker.cjs --once        (publishes 1 next ready pin and exits)
 *   node scripts/pinterest-queue-worker.cjs --interval 300 (runs continuously, publishing every 5 minutes)
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const QUEUE_MANAGER = path.resolve(__dirname, 'pinterest-queue-manager.cjs');
const args = process.argv.slice(2);

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [PinterestWorker] ${msg}`);
}

async function run() {
  const isOnce = args.includes('--once');
  const intervalArgIdx = args.indexOf('--interval');
  const intervalSec = intervalArgIdx !== -1 && args[intervalArgIdx + 1] ? parseInt(args[intervalArgIdx + 1], 10) : 300;

  log(`Starting Pinterest Queue Worker (Mode: ${isOnce ? 'ONCE' : `LOOP every ${intervalSec}s`})...`);

  do {
    try {
      log('Triggering next pin publication via PinterestQueueManager...');
      const stdout = execSync(`node "${QUEUE_MANAGER}" --publish-next`, { stdio: 'pipe' }).toString();
      console.log(stdout);

      if (stdout.includes('All pins published')) {
        log('All items in queue have been published. Worker completed.');
        break;
      }
    } catch (err) {
      log(`Error during publication: ${err.message}`);
      if (err.stdout) console.log(err.stdout.toString());
      if (err.stderr) console.error(err.stderr.toString());
    }

    if (isOnce) break;

    log(`Sleeping for ${intervalSec} seconds before next pin publication...`);
    await new Promise(r => setTimeout(r, intervalSec * 1000));
  } while (!isOnce);
}

run().catch(console.error);
