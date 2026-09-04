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
  console.log(`\n🚀 [WARMUP DEPLOY] Подключение к DigitalOcean: ${USER}@${HOST}...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('   ✅ SSH-сессия установлена\n');
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
    // 1. Git pull / reset hard
    console.log('📥 [1/5] Синхронизация репозитория на сервере (origin/main)...');
    const gitRes = await runSsh(conn, `cd ${REMOTE_DIR} && git fetch origin && git reset --hard origin/main`);
    console.log(gitRes.stdout.trim() || gitRes.stderr.trim());

    // 2. Build core TypeScript
    console.log('\n🔨 [2/5] Сборка TypeScript в core (npm run build)...');
    const buildRes = await runSsh(conn, `cd ${REMOTE_DIR}/core && npm run build`);
    console.log(buildRes.stdout.trim() || buildRes.stderr.trim());

    // 3. Restart scout-reddit-worker in PM2
    console.log('\n🔄 [3/5] Перезапуск scout-reddit-worker в PM2 (--update-env)...');
    const restartRes = await runSsh(conn, `pm2 restart scout-reddit-worker --update-env`);
    console.log(restartRes.stdout.trim() || restartRes.stderr.trim());

    // 4. Check PM2 status
    console.log('\n📊 [4/5] Статус процессов PM2:');
    const statusRes = await runSsh(conn, `pm2 status`);
    console.log(statusRes.stdout.trim());

    // 5. Wait 12 seconds and capture logs
    console.log('\n⏳ [5/5] Ожидание 12 секунд для инициализации цикла сканирования...');
    await new Promise((r) => setTimeout(r, 12000));

    console.log('\n📋 [LOGS] Логи запуска scout-reddit-worker:');
    const logsRes = await runSsh(conn, `pm2 logs scout-reddit-worker --lines 45 --nostream`);
    console.log(logsRes.stdout.trim() || logsRes.stderr.trim());

    console.log('\n✨ [DONE] Деплой и запуск режима Karma Warmup успешно завершены!');
  } catch (err) {
    console.error('❌ Ошибка при деплое:', err);
    process.exit(1);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
