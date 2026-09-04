import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_DIR = '/var/www/affiliate';

function runSsh(conn: Client, cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      stream.on('close', (code: number) => resolve({ stdout, stderr, code }));
    });
  });
}

async function main() {
  console.log(`\n🚀 [DEPLOY TELEGRAM & SCOUT] Connecting to DigitalOcean: ${USER}@${HOST}...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('   ✅ SSH session established\n');
        resolve();
      })
      .on('error', (err) => reject(err))
      .connect({
        host: HOST,
        username: USER,
        password: PASS,
        readyTimeout: 20000,
      });
  });

  try {
    // 1. Git pull
    console.log('📥 [1/4] Pulling latest code from GitHub origin/main...');
    const gitRes = await runSsh(conn, `cd ${REMOTE_DIR} && git fetch origin && git reset --hard origin/main`);
    console.log(gitRes.stdout.trim() || gitRes.stderr.trim());

    // 2. Build core TypeScript
    console.log('\n🔨 [2/4] Compiling TypeScript in core...');
    const buildRes = await runSsh(conn, `cd ${REMOTE_DIR}/core && npm run build`);
    console.log(buildRes.stdout.trim() || buildRes.stderr.trim());

    // 3. Restart PM2 services
    console.log('\n🔄 [3/4] Restarting scout-reddit-worker, reddit-session-watchdog, affiliate-telegram-bot (--update-env)...');
    const restartRes = await runSsh(conn, `pm2 restart scout-reddit-worker reddit-session-watchdog affiliate-telegram-bot --update-env`);
    console.log(restartRes.stdout.trim() || restartRes.stderr.trim());

    // Wait a brief moment for startup
    await new Promise((r) => setTimeout(r, 4000));

    // 4. Verify logs
    console.log('\n📋 [4/4] Verifying PM2 process status & logs...');
    const statusRes = await runSsh(conn, `pm2 status`);
    console.log(statusRes.stdout.trim());

    console.log('\n--- reddit-session-watchdog Logs ---');
    const watchdogLogs = await runSsh(conn, `pm2 logs reddit-session-watchdog --lines 25 --nostream`);
    console.log(watchdogLogs.stdout.trim() || watchdogLogs.stderr.trim());

    console.log('\n--- scout-reddit-worker Logs ---');
    const scoutLogs = await runSsh(conn, `pm2 logs scout-reddit-worker --lines 25 --nostream`);
    console.log(scoutLogs.stdout.trim() || scoutLogs.stderr.trim());

    console.log('\n✅ [DEPLOY SUCCESS] Scout Worker & Reddit Session Watchdog updated and verified!');
  } catch (err) {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
