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

  console.log('\n=== 2. Поиск зависших процессов tsc, tsx, npm, playwright, chrome, zombie/defunct ===');
  const psRes = await runSsh(conn, 'ps aux --sort=-%cpu | head -n 25');
  console.log(psRes);

  console.log('=== Завершение зависших процессов Chromium/Playwright и старых esbuild/scout ===');
  const killRes = await runSsh(conn, `
    pkill -9 -f "chrome-headless-shell" 2>/dev/null || true
    pkill -9 -f "smart-offer-scout" 2>/dev/null || true
    pkill -9 -f "esbuild" 2>/dev/null || true
    echo "Зависшие процессы успешно завершены."
  `);
  console.log(killRes);

  console.log('\n=== Повторная проверка активных процессов ===');
  const checkAfter = await runSsh(conn, 'pgrep -f "chrome-headless-shell|smart-offer-scout|esbuild" || echo "Чисто: зависших процессов нет"');
  console.log(checkAfter);

  console.log('\n=== Итоговая системная память и нагрузка на сервере ===');
  const finalSys = await runSsh(conn, 'free -m; uptime');
  console.log(finalSys);

  console.log('\n=== 5. Состояние всех PM2 процессов ===');
  const pm2Res = await runSsh(conn, 'pm2 status');
  console.log(pm2Res);

  conn.end();
}

main().catch(console.error);
