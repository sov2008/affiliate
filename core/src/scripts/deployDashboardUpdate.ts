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
        'echo "[1/6] Синхронизация кода из GitHub..."',
        'git fetch origin && git reset --hard origin/main',
        'echo "[2/6] Сборка TypeScript и копирование dashboard.html..."',
        'npm --prefix core run build',
        'echo "[3/6] Перезапуск сервисов в PM2..."',
        'pm2 reload ecosystem.config.cjs --update-env && pm2 save',
        'echo "[4/6] Закрытие публичного порта 5000 в UFW..."',
        'ufw delete allow 5000/tcp 2>/dev/null || true',
        'ufw delete allow 5000 2>/dev/null || true',
        'ufw reload',
        'echo "[5/6] Проверка прослушиваемого сокета (должен быть 127.0.0.1:5000)..."',
        'ss -tlpn | grep 5000 || true',
        'echo "[6/6] Проверка статусов PM2 процессов..."',
        'pm2 list',
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
