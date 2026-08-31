require('dotenv').config({ path: __dirname + '/.env' });
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const DO_HOST = process.env.DO_SSH_HOST || '178.128.199.28';
const DO_USER = process.env.DO_SSH_USER || 'root';
const DO_PASS = process.env.DO_SSH_PASS || 'Aff1l1ate_Pr0d_2026!';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'AffOps_Secure_k9P2w8Nx7Q4m';

const KEY_PATH = path.resolve(__dirname, 'do_key.pem');
let privateKey;
if (fs.existsSync(KEY_PATH)) {
  try {
    privateKey = fs.readFileSync(KEY_PATH);
  } catch (e) {}
}

const conn = new Client();

function run(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', d => out += d.toString());
      stream.stderr.on('data', d => out += d.toString());
      stream.on('close', () => resolve(out.trim()));
    });
  });
}

conn.on('ready', async () => {
  console.log('✅ SSH Подключение к Droplet установлено.\n');

  try {
    console.log('=== [1] PM2 Статус Всех Процессов ===');
    const pm2Status = await run('pm2 status');
    console.log(pm2Status);

    console.log('\n=== [2] Состояние Organic Traffic Agent (/api/agent/organic/status) ===');
    const statusJson = await run(`curl -s -u admin:${DASHBOARD_PASS} http://127.0.0.1:5000/api/agent/organic/status`);
    console.log(JSON.stringify(JSON.parse(statusJson), null, 2));

    console.log('\n=== [3] Последние 15 строк системного лога (organic_daemon.log) ===');
    const logs = await run('tail -n 15 /var/www/affiliate/.antigravity/organic_daemon.log');
    console.log(logs || '[Лог формируется]');

    console.log('\n=== [4] Содержимое кэша обнаружения (organic_discovery.json) ===');
    const discCache = await run('node -e "const d=require(\'/var/www/affiliate/core/data/organic_discovery.json\'); console.log(\'Всего найденных возможностей:\', (d.engagements||[]).length, \'| Последний запуск:\', d.lastRun); console.log(\'Примеры последних сгенерированных ответов и ссылок:\'); (d.engagements||[]).slice(-2).forEach(e => console.log(\'• Кампания:\', e.campaignId, \'| Топик:\', e.topic, \'| Интент:\', e.intentScore+\'%\', \'| Ссылка:\', e.outboundUrl));"');
    console.log(discCache);

    console.log('\n=== [5] Тестовый запрос Single Dry-Run через API ===');
    const triggerRes = await run(`curl -s -X POST -H "Content-Type: application/json" -d "{\\"action\\":\\"dry_run\\"}" -u admin:${DASHBOARD_PASS} http://127.0.0.1:5000/api/agent/organic/toggle`);
    console.log(triggerRes);

  } catch (err) {
    console.error('Ошибка проверки:', err);
  }

  conn.end();
});

const sshConfig = {
  host: DO_HOST,
  port: 22,
  username: DO_USER,
  readyTimeout: 30000
};
if (privateKey) sshConfig.privateKey = privateKey;
if (DO_PASS) sshConfig.password = DO_PASS;

conn.connect(sshConfig);
