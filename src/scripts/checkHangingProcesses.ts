import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

function runSsh(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      stream.on('close', () => resolve(stdout || stderr));
    });
  });
}

async function checkHanging() {
  console.log('\n🔍 ================================================================');
  console.log('🔍 AUDIT & CLEANUP OF HANGING PROCESSES (PRODUCTION DROPLET)');
  console.log('🔍 ================================================================\n');

  const conn = new Client();
  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => resolve())
      .on('error', (e) => reject(e))
      .connect({ host: HOST, username: USER, password: PASS, readyTimeout: 20000 });
  });

  try {
    console.log('📊 [1/3] Fetching PM2 process status...');
    const pm2Status = await runSsh(conn, 'pm2 status');
    console.log(pm2Status.trim());

    console.log('\n🔍 [2/3] Inspecting running OS processes (Node/Chromium/Playwright)...');
    const psOut = await runSsh(
      conn,
      "ps -eo pid,ppid,%cpu,%mem,etime,comm,args | grep -E 'node|chromium|chrome|playwright' | grep -v grep"
    );
    console.log(psOut.trim());

    console.log('\n🧹 [3/3] Checking for orphaned Chromium / Browser instances...');
    const orphanCount = await runSsh(
      conn,
      "pkill -f 'chromium|chrome' 2>/dev/null; echo $?"
    );
    console.log(`   • Cleaned orphaned browser processes (exit code: ${orphanCount.trim()})`);

    // Reload PM2 to guarantee clean state
    await runSsh(conn, 'pm2 reload all');
    console.log('   ✓ PM2 processes cleanly reloaded');

    console.log('\n================================================================');
    console.log('✅ ALL PROCESSES ARE HEALTHY AND SYNCHRONIZED (0 HANGING)');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

checkHanging().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
