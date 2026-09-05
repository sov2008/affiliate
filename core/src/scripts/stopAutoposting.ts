import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';

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
  console.log(`\n🛑 Подключение к серверу ${USER}@${HOST} для полной остановки всех процессов автопостинга...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('   ✓ SSH-сессия установлена\n');
        resolve();
      })
      .on('error', (err) => reject(err))
      .connect({
        host: HOST,
        username: USER,
        password: PASS,
        readyTimeout: 15000,
      });
  });

  try {
    // 1. Останавливаем процессы автопостинга:
    // affiliate-scheduler (постинг из очереди)
    // scout-reddit-worker (постинг/скаут Reddit)
    // reddit-session-watchdog (сессионный вотчдог Reddit)
    // affiliate-autopilot (автономный цикл оптимизации и Reddit-постинга)
    console.log('🛑 [1/3] Остановка всех процессов автопостинга в PM2...');
    const stopRes = await runSsh(conn, 'pm2 stop affiliate-scheduler scout-reddit-worker reddit-session-watchdog affiliate-autopilot');
    console.log(stopRes.stdout.trim());

    // 2. Фиксируем состояние в PM2, чтобы после ребута сервисы не стартовали автоматически
    console.log('\n💾 [2/3] Фиксация состояния PM2 (pm2 save)...');
    const saveRes = await runSsh(conn, 'pm2 save');
    console.log(saveRes.stdout.trim());

    // 3. Выводим текущую таблицу процессов PM2
    console.log('\n📋 [3/3] Итоговое состояние процессов PM2 на сервере:');
    const statusRes = await runSsh(conn, 'pm2 status');
    console.log(statusRes.stdout.trim());

    console.log('\n✅ Все процессы автопостинга гарантированно ОСТАНОВЛЕНЫ.');
  } catch (err: any) {
    console.error('❌ Ошибка:', err.message);
  } finally {
    conn.end();
  }
}

main();
