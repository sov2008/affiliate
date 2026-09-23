import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || '';

function runSsh(conn: Client, cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      stream.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.stderr.on('data', (d: Buffer) => (stdout += d.toString()));
      stream.on('close', () => resolve(stdout.trim()));
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise<void>((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect({
      host: HOST,
      username: USER,
      password: PASS,
      readyTimeout: 15000,
    });
  });

  console.log('=== 1. Проверка системной памяти и нагрузки (RAM / CPU) ===');
  const freeRes = await runSsh(conn, 'free -m; uptime');
  console.log(freeRes);

  console.log('\n=== 2. Поиск процессов Chromium / Playwright / Defunct ===');
  const chromeRes = await runSsh(conn, 'ps aux | grep -iE "chrome|scout|defunct" | grep -v grep || echo "Ни одного процесса Chromium или Defunct не обнаружено"');
  console.log(chromeRes);

  console.log('\n=== 3. Топ-15 процессов по потреблению CPU / RAM ===');
  const psRes = await runSsh(conn, 'ps aux --sort=-%cpu | head -n 16');
  console.log(psRes);

  console.log('\n=== 4. Состояние PM2 сервисов ===');
  const pm2Res = await runSsh(conn, 'pm2 status');
  console.log(pm2Res);

  conn.end();
}

main().catch(console.error);
