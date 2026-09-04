import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const host = '178.128.199.28';
const username = 'root';
const password = process.env.SSH_ROOT_PASSWORD || '';

async function runDeploy(): Promise<void> {
  const conn = new Client();

  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      console.log(`✓ Подключение по SSH к ${username}@${host} установлено.`);

      const commands = [
        'cd /var/www/affiliate',
        'echo "[1/5] Синхронизация кода из GitHub..."',
        'git pull origin main',
        'echo "[2/5] Сборка TypeScript и копирование dashboard.html..."',
        'npm --prefix core run build',
        'echo "[3/5] Перезапуск affiliate-dashboard в PM2..."',
        'pm2 restart affiliate-dashboard --update-env',
        'echo "[4/5] Проверка статусов PM2 процессов..."',
        'pm2 list',
        'echo "[5/5] Тест API: GET /api/workers/status..."',
        'curl -s http://localhost:3000/api/workers/status | jq . || curl -s http://localhost:3000/api/workers/status',
      ].join(' && ');

      conn.exec(commands, (err, stream) => {
        if (err) {
          conn.end();
          return reject(err);
        }

        stream.on('close', (code: number) => {
          conn.end();
          if (code === 0) {
            console.log('\n✓ Деплой успешно завершен (код выхода 0)');
            resolve();
          } else {
            reject(new Error(`Деплой завершился с ошибкой, код выхода: ${code}`));
          }
        });

        stream.on('data', (data: Buffer) => {
          process.stdout.write(data);
        });

        stream.stderr.on('data', (data: Buffer) => {
          process.stderr.write(data);
        });
      });
    });

    conn.on('error', (err) => {
      reject(err);
    });

    conn.connect({
      host,
      port: 22,
      username,
      password,
      readyTimeout: 30000,
    });
  });
}

runDeploy().catch((err) => {
  console.error('❌ Ошибка деплоя:', err.message);
  process.exit(1);
});
