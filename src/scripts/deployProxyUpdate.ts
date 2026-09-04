/**
 * Production Proxy Deploy & PM2 Restart Script
 * Connects to DigitalOcean VPS (178.128.199.28)
 * 1. Pulls latest main branch with proxy integration
 * 2. Updates /var/www/affiliate/.env and /var/www/affiliate/core/.env with REDDIT_PROXY_*
 * 3. Installs undici in /var/www/affiliate/core
 * 4. Compiles TypeScript via npm --prefix core run build
 * 5. Runs testWebshareProxy.ts on production node
 * 6. Restarts PM2 processes with --update-env
 * 7. Outputs logs of the first scout cycle
 */

import { Client } from 'ssh2';
import * as path from 'path';
import dotenv from 'dotenv';

const ROOT = process.cwd();
dotenv.config({ path: path.join(ROOT, 'core', '.env') });
dotenv.config({ path: path.join(ROOT, '.env') });

const host = process.env.DEPLOY_HOST || '178.128.199.28';
const user = process.env.DEPLOY_USER || 'root';
const password = process.env.SSH_ROOT_PASSWORD || '';
const remotePath = '/var/www/affiliate';

async function main() {
  if (!password) {
    console.error('❌ SSH_ROOT_PASSWORD not found in .env');
    process.exit(1);
  }

  console.log(`Connecting to ${user}@${host}...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn.on('ready', () => {
      console.log('✓ SSH connection established');
      resolve();
    });
    conn.on('error', (err) => reject(err));
    conn.connect({
      host,
      port: 22,
      username: user,
      password,
      readyTimeout: 30000,
    });
  });

  const commands = [
    `cd ${remotePath}`,
    // 1. Pull latest code from GitHub
    `git pull origin main`,
    // 2. Ensure REDDIT_PROXY_ENABLED and REDDIT_PROXY_URL exist in .env
    `grep -q 'REDDIT_PROXY_ENABLED' .env || echo '\nREDDIT_PROXY_ENABLED="true"\nREDDIT_PROXY_URL="http://qffiaxbo:814brmrez7fe@198.23.243.226:6361"' >> .env`,
    `grep -q 'REDDIT_PROXY_ENABLED' core/.env || echo '\nREDDIT_PROXY_ENABLED="true"\nREDDIT_PROXY_URL="http://qffiaxbo:814brmrez7fe@198.23.243.226:6361"' >> core/.env`,
    // Update existing if already there
    `sed -i 's/^REDDIT_PROXY_ENABLED=.*/REDDIT_PROXY_ENABLED="true"/' .env`,
    `sed -i 's|^REDDIT_PROXY_URL=.*|REDDIT_PROXY_URL="http://qffiaxbo:814brmrez7fe@198.23.243.226:6361"|' .env`,
    `sed -i 's/^REDDIT_PROXY_ENABLED=.*/REDDIT_PROXY_ENABLED="true"/' core/.env`,
    `sed -i 's|^REDDIT_PROXY_URL=.*|REDDIT_PROXY_URL="http://qffiaxbo:814brmrez7fe@198.23.243.226:6361"|' core/.env`,
    // 3. Install dependencies in core
    `npm --prefix core i undici`,
    // 4. Build TypeScript
    `npm --prefix core run build`,
    // 5. Run diagnostic script on production node
    `npx tsx core/src/scripts/testWebshareProxy.ts`,
    // 6. Restart PM2 processes with --update-env
    `pm2 restart scout-reddit-worker affiliate-scheduler reddit-session-watchdog affiliate-telegram-bot --update-env`,
    // 7. Check PM2 status
    `pm2 list`,
    // 8. Wait 12s for first scout cycle to start and output logs
    `sleep 12`,
    `pm2 logs scout-reddit-worker --lines 30 --nostream`
  ];

  const fullCmd = commands.join(' && ');
  console.log('\nExecuting remote pipeline:\n');

  await new Promise<void>((resolve, reject) => {
    conn.exec(fullCmd, (err, stream) => {
      if (err) {
        conn.end();
        return reject(err);
      }

      stream.on('close', (code: number) => {
        conn.end();
        if (code === 0) {
          console.log('\n✅ Remote execution successfully completed!');
          resolve();
        } else {
          reject(new Error(`Remote pipeline failed with exit code ${code}`));
        }
      });

      stream.on('data', (data: Buffer) => {
        process.stdout.write(data.toString());
      });

      stream.stderr.on('data', (data: Buffer) => {
        process.stderr.write(data.toString());
      });
    });
  });
}

main().catch((err) => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
