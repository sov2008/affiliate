import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

function runSsh(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d: Buffer) => (out += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (out += d.toString()));
      stream.on('close', () => resolve(out.trim()));
    });
  });
}

async function main() {
  console.log('🧹 Проверка и очистка зависших процессов на боевом сервере 178.128.199.28...');
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => resolve())
      .on('error', (err) => reject(err))
      .connect({
        host: HOST,
        username: USER,
        password: PASS,
      });
  });

  try {
    // 1. Check for orphaned chrome/chromium/playwright
    const pkillRes = await runSsh(conn, 'pkill -f -9 "chrome|chromium|playwright" 2>/dev/null || echo "No orphaned browsers found"');
    console.log('1. Очистка browser процессов:', pkillRes);

    // 2. Kill orphaned optimizer-agent or standalone tsx processes outside PM2
    const pkillAgent = await runSsh(conn, 'pkill -f -9 "optimizer-agent.ts|auto-evolve" 2>/dev/null || echo "No orphaned optimizer processes"');
    console.log('2. Очистка standalone optimizer-agent:', pkillAgent);

    // 3. Check for zombie / defunct processes
    const defunctCheck = await runSsh(conn, 'ps aux | grep -i defunct | grep -v grep || echo "No defunct processes"');
    console.log('3. Проверка зомби/defunct процессов:', defunctCheck);

    // 4. Check for any non-PM2 node processes
    const nonPm2Node = await runSsh(conn, 'pgrep -a node | grep -v -E "dist|PM2" || echo "No orphaned node processes"');
    console.log('4. Проверка лишних node процессов:', nonPm2Node);

    // 4. Memory and System Stats
    const memRes = await runSsh(conn, 'free -h && echo "---" && uptime');
    console.log('4. Память и Uptime:\n' + memRes);

    // 5. PM2 Status
    const pm2Res = await runSsh(conn, 'pm2 status');
    console.log('5. Статус PM2 процессов:\n' + pm2Res);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
