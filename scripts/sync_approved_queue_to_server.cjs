const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ssh2 = require('ssh2');

dotenv.config();

const localDbPath = path.resolve(__dirname, '../core/data/content_queue.sqlite');
const localDb = new DatabaseSync(localDbPath);

const approvedRows = localDb.prepare("SELECT * FROM content_queue_v2 WHERE status = 'APPROVED'").all();
console.log(`📦 Найдено ${approvedRows.length} записей со статусом APPROVED в локальной базе.`);

if (approvedRows.length === 0) {
  console.log('Нет записей для переноса.');
  process.exit(0);
}

const DO_HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || process.env.DROPLET_IP || '178.128.199.28';
const DO_USER = process.env.DO_SSH_USER || process.env.DO_USER || 'root';
const KEY_PATH = path.resolve(__dirname, '../do_key.pem');

let privateKey;
if (fs.existsSync(KEY_PATH)) {
  privateKey = fs.readFileSync(KEY_PATH);
}

const conn = new ssh2.Client();

conn.on('ready', () => {
  console.log(`✅ SSH подключение к Droplet (${DO_HOST}) установлено.`);

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('❌ Ошибка SFTP:', err);
      conn.end();
      return;
    }

    const remoteJsonPath = '/tmp/approved_queue_import.json';
    const jsonBuffer = Buffer.from(JSON.stringify(approvedRows), 'utf8');

    const writeStream = sftp.createWriteStream(remoteJsonPath);
    writeStream.write(jsonBuffer);
    writeStream.end();

    writeStream.on('close', () => {
      console.log(`📤 ${approvedRows.length} записей успешно загружены в ${remoteJsonPath} на сервере.`);

      const remoteImportScript = `
node -e "
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const dbPath = '/var/www/affiliate/core/data/content_queue.sqlite';
const db = new DatabaseSync(dbPath);
const items = JSON.parse(fs.readFileSync('/tmp/approved_queue_import.json', 'utf8'));

let inserted = 0;
let skipped = 0;

const insertStmt = db.prepare(\\\`
  INSERT OR IGNORE INTO content_queue_v2 (
    id, campaign_id, network, target_platform, platform, subreddit,
    target_url, hook, body, payload, stealth_cta, tracking_url,
    image_path, risk_score, status, published_url, health_status,
    live_upvotes, last_health_check_at, created_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?
  )
\\\`);

for (const it of items) {
  const res = insertStmt.run(
    it.id, it.campaign_id, it.network || 'organic', it.target_platform, it.platform, it.subreddit || '',
    it.target_url || '', it.hook, it.body, it.payload || '', it.stealth_cta || '', it.tracking_url || '',
    it.image_path || '', it.risk_score || 0, it.status, it.published_url || null, it.health_status || null,
    it.live_upvotes || 0, it.last_health_check_at || null, it.created_at, it.updated_at
  );
  if (res.changes > 0) inserted++;
  else skipped++;
}

console.log(\\\`ИМПОРТ ЗАВЕРШЕН: Добавлено: \\\${inserted}, Пропущено (уже существуют): \\\${skipped}\\\`);

const stats = db.prepare('SELECT status, platform, count(*) as cnt FROM content_queue_v2 GROUP BY status, platform').all();
console.log('ТЕКУЩАЯ СТАТИСТИКА НА СЕРВЕРЕ:', JSON.stringify(stats));
"
`;

      conn.exec(remoteImportScript, (execErr, stream) => {
        if (execErr) {
          console.error('❌ Ошибка выполнения импорта:', execErr);
          conn.end();
          return;
        }

        stream.on('data', (d) => process.stdout.write(d.toString()));
        stream.stderr.on('data', (d) => process.stderr.write(d.toString()));
        stream.on('close', () => {
          conn.exec('rm -f /tmp/approved_queue_import.json', () => {
            console.log('🧹 Временные файлы удалены.');
            conn.end();
          });
        });
      });
    });
  });
});

conn.on('error', (err) => {
  console.error('❌ Ошибка SSH подключения:', err.message);
});

conn.connect({
  host: DO_HOST,
  port: 22,
  username: DO_USER,
  privateKey: privateKey
});
