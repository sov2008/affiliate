import { Client } from 'ssh2';
import * as path from 'path';
import dotenv from 'dotenv';

const ROOT = process.cwd();
dotenv.config({ path: path.join(ROOT, 'core', '.env') });
dotenv.config({ path: path.join(ROOT, '.env') });

const host = process.env.DEPLOY_HOST || '178.128.199.28';
const user = process.env.DEPLOY_USER || 'root';
const password = process.env.SSH_ROOT_PASSWORD || '';

async function main() {
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn.on('ready', () => resolve());
    conn.on('error', reject);
    conn.connect({
      host,
      port: 22,
      username: user,
      password,
      readyTimeout: 30000,
    });
  });

  const cmd = `
    echo "=== SCOUT-REDDIT-WORKER OUT LOGS ===" &&
    pm2 logs scout-reddit-worker --lines 40 --nostream --out &&
    echo "=== REDDIT-SESSION-WATCHDOG OUT LOGS ===" &&
    pm2 logs reddit-session-watchdog --lines 20 --nostream --out &&
    echo "=== PM2 STATUS ===" &&
    pm2 list
  `;

  await new Promise<void>((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', () => {
        conn.end();
        resolve();
      });
      stream.on('data', (d: Buffer) => process.stdout.write(d.toString()));
      stream.stderr.on('data', (d: Buffer) => process.stderr.write(d.toString()));
    });
  });
}

main().catch(console.error);
