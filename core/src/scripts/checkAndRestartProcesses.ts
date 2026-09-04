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
  console.log(`\n🔍 Подключение к боевому серверу DigitalOcean: ${USER}@${HOST}...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('   ✓ SSH-сессия успешно установлена\n');
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
    // 1. Проверяем системные ресурсы и нагрузку
    console.log('📊 [1/4] Системная память и нагрузка на сервере:');
    const freeRes = await runSsh(conn, 'free -m');
    console.log(freeRes.stdout.trim());

    // 2. Получаем список процессов PM2 в формате JSON
    console.log('\n⚙️ [2/4] Проверка состояния процессов PM2:');
    const pm2Res = await runSsh(conn, 'pm2 jlist');
    let pm2List: any[] = [];
    try {
      pm2List = JSON.parse(pm2Res.stdout);
    } catch {
      // fallback
      const statusRes = await runSsh(conn, 'pm2 status');
      console.log(statusRes.stdout);
    }

    const problemProcesses: string[] = [];

    if (pm2List.length > 0) {
      console.log('---------------------------------------------------------------------------------------------------------');
      console.log('| ID | Process Name              | Status   | PID    | Memory  | CPU  | Uptime  | Restarts |');
      console.log('---------------------------------------------------------------------------------------------------------');

      for (const p of pm2List) {
        const id = String(p.pm_id).padEnd(2);
        const name = (p.name || 'unknown').padEnd(25);
        const status = (p.pm2_env?.status || 'unknown').toUpperCase();
        const statusPadded = status.padEnd(8);
        const pid = String(p.pid || 0).padEnd(6);
        const memMb = `${((p.monit?.memory || 0) / 1024 / 1024).toFixed(1)} MB`.padEnd(7);
        const cpu = `${p.monit?.cpu || 0}%`.padEnd(4);
        const uptimeSec = Math.floor((Date.now() - (p.pm2_env?.pm_uptime || Date.now())) / 1000);
        const uptime = `${Math.floor(uptimeSec / 60)}m`.padEnd(7);
        const restarts = String(p.pm2_env?.restart_time || 0).padEnd(8);

        console.log(`| ${id} | ${name} | ${statusPadded} | ${pid} | ${memMb} | ${cpu} | ${uptime} | ${restarts} |`);

        if (status !== 'ONLINE') {
          problemProcesses.push(p.name);
        }
      }
      console.log('---------------------------------------------------------------------------------------------------------\n');
    }

    // 3. Синхронизируем код с GitHub и обновляем дашборд
    console.log('🔄 [3/4] Синхронизация репозитория и шаблона дашборда:');
    const syncRes = await runSsh(
      conn,
      `cd ${REMOTE_DIR} && git pull origin main && cp core/src/dashboard.html core/dist/dashboard.html`
    );
    console.log(syncRes.stdout.trim() || 'Код уже в актуальном состоянии');

    // 4. Перезапуск зависших или требующих обновления процессов
    console.log('\n🚀 [4/4] Перезапуск процессов при необходимости:');
    if (problemProcesses.length > 0) {
      for (const pName of problemProcesses) {
        console.log(`   ⚠️ Перезапуск упавшего/зависшего процесса: ${pName}...`);
        const rRes = await runSsh(conn, `pm2 restart ${pName}`);
        console.log(`   ✓ ${pName} перезапущен`);
      }
    } else {
      console.log('   ✓ Все существующие воркеры в статусе ONLINE, падений не обнаружено.');
    }

    // Всегда перезагружаем affiliate-dashboard, чтобы обновить UI
    console.log('   ⚡ Перезагрузка affiliate-dashboard для применения модернизированного UI...');
    await runSsh(conn, 'pm2 reload affiliate-dashboard');
    console.log('   ✓ affiliate-dashboard успешно перезагружен');

    // Итоговый срез pm2 status
    console.log('\n📋 Итоговое состояние демонов PM2:');
    const finalStatus = await runSsh(conn, 'pm2 status');
    console.log(finalStatus.stdout);

  } finally {
    conn.end();
  }
}

main().catch((err) => {
  console.error('❌ Ошибка выполнения:', err.message);
  process.exit(1);
});
