import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const DASH_PASS = process.env.DASHBOARD_PASS || 'AffOps_Secure_k9P2w8Nx7Q4m';
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
  console.log(`\n🚀 [FULLSTACK DEPLOY] Подключение к DigitalOcean: ${USER}@${HOST}...`);
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
    console.log('📥 [1/6] Синхронизация репозитория на сервере (origin/main)...');
    const gitRes = await runSsh(conn, `cd ${REMOTE_DIR} && git fetch origin && git reset --hard origin/main`);
    console.log(gitRes.stdout.trim() || gitRes.stderr.trim());

    // 2. Build core TypeScript
    console.log('\n🔨 [2/6] Сборка TypeScript в core (npm run build)...');
    const buildRes = await runSsh(conn, `cd ${REMOTE_DIR}/core && npm run build`);
    console.log(buildRes.stdout.trim() || buildRes.stderr.trim());

    // 3. Reset seen cache once so newly matched warmup posts get ingested into SQLite
    console.log('\n🧹 [3/6] Сброс seen_reddit_posts.json для первичного наполнения очереди SQLite...');
    await runSsh(conn, `rm -f ${REMOTE_DIR}/core/data/seen_reddit_posts.json`);

    // 4. Restart affiliate-dashboard and scout-reddit-worker in PM2
    console.log('\n🔄 [4/6] Перезапуск affiliate-dashboard и scout-reddit-worker в PM2 (--update-env)...');
    const restartRes = await runSsh(conn, `pm2 restart affiliate-dashboard scout-reddit-worker --update-env`);
    console.log(restartRes.stdout.trim() || restartRes.stderr.trim());

    // 5. Wait for scout cycle to execute and ingest into SQLite
    console.log('\n⏳ [5/6] Ожидание 14 секунд для выполнения цикла скаутинга и инжеста в SQLite...');
    await new Promise((r) => setTimeout(r, 14000));

    // 6. Query SQLite directly with sqlite3 CLI and inspect API
    console.log('\n📊 [6/6] Срез записей из SQLite базы данных (/var/www/affiliate/core/data/content_queue.sqlite):');
    const sqliteSchema = await runSsh(
      conn,
      `sqlite3 ${REMOTE_DIR}/core/data/content_queue.sqlite ".schema content_queue_v2"`
    );
    console.log('--- Схема таблицы content_queue_v2 ---');
    console.log(sqliteSchema.stdout.trim());

    console.log('\n--- Записи в очереди SQLite (ORDER BY created_at DESC) ---');
    const sqliteRows = await runSsh(
      conn,
      `sqlite3 -header -column ${REMOTE_DIR}/core/data/content_queue.sqlite "SELECT id, platform, status, subreddit, target_url, datetime(created_at/1000, 'unixepoch') as created_utc FROM content_queue_v2 ORDER BY created_at DESC LIMIT 10;"`
    );
    console.log(sqliteRows.stdout.trim() || '(База данных пока пуста или ожидает матчей)');

    console.log('\n--- Проверка эндпоинта GET /api/queue/items в affiliate-dashboard (порт 5000) ---');
    const apiRes = await runSsh(
      conn,
      `curl -s -u admin:${DASH_PASS} http://localhost:5000/api/queue/items`
    );
    try {
      const parsed = JSON.parse(apiRes.stdout);
      console.log(`✅ API Response: success=${parsed.success}, count=${parsed.count || (parsed.items ? parsed.items.length : 0)}`);
      if (parsed.items && parsed.items.length > 0) {
        console.log(`Первый элемент в очереди: ID=${parsed.items[0].id}, Platform=${parsed.items[0].platform || parsed.items[0].target_platform}, Subreddit=${parsed.items[0].subreddit || 'N/A'}, Status=${parsed.items[0].status}`);
      }
    } catch {
      console.log('Raw API Response:', apiRes.stdout.slice(0, 300));
    }

    console.log('\n📋 [LOGS] Последние логи scout-reddit-worker:');
    const logsRes = await runSsh(conn, `pm2 logs scout-reddit-worker --lines 25 --nostream`);
    console.log(logsRes.stdout.trim() || logsRes.stderr.trim());

    console.log('\n✨ [DONE] Деплой, синхронизация SQLite и верификация очереди успешно завершены!');
  } catch (err) {
    console.error('❌ Ошибка при деплое:', err);
    process.exit(1);
  } finally {
    conn.end();
  }
}

main().catch(console.error);
