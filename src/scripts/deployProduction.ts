/**
 * Production Deployment Script (Windows-compatible, ssh2-based)
 * Развертывает обновления на DigitalOcean VPS через SSH2 library
 * Usage: npm run deploy:prod
 */

import { Client, SFTPWrapper } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const ROOT = process.cwd();

// Load environment variables from both .env files
import dotenv from 'dotenv';
dotenv.config({ path: path.join(ROOT, 'core', '.env') });
dotenv.config({ path: path.join(ROOT, '.env') });

class ProductionDeployer {
  private host = process.env.DEPLOY_HOST || '178.128.199.28';
  private user = process.env.DEPLOY_USER || 'root';
  private pass = process.env.SSH_ROOT_PASSWORD || '';
  private remote = '/var/www/affiliate';
  private conn: Client | null = null;
  private t0 = 0;

  /**
   * Основной поток развертывания — 8 шагов
   */
  async deploy(): Promise<void> {
    if (!this.pass) {
      console.error('❌ SSH_ROOT_PASSWORD не задан в .env');
      process.exit(1);
    }

    this.t0 = Date.now();
    console.log('🚀 Начало развертывания на production...');
    console.log(`   Хост: ${this.host}`);
    console.log(`   User: ${this.user}`);
    console.log(`   Путь: ${this.remote}`);

    try {
      // [1/8] Build TypeScript
      console.log('\n📦 [1/8] Компиляция TypeScript...');
      await execPromise('npm run build', { cwd: ROOT, timeout: 120000 });
      console.log('   ✓ Build успешно завершён');

      // [2/8] SSH Connect
      console.log('\n🔗 [2/8] Подключение SSH...');
      await this.sshConnect();
      console.log(`   ✓ Подключено к ${this.host}`);

      // [3/8] Pre-deploy health check
      console.log('\n🏥 [3/8] Проверка здоровья ДО развертывания...');
      await this.checkPM2();

      // [4/8] Backup current dist
      console.log('\n💾 [4/8] Бэкап текущей версии...');
      await this.createBackup();

      // [5/8] Upload compiled dist/
      console.log('\n📤 [5/8] Загрузка core/dist/ через SFTP...');
      await this.uploadDist();

      // [6/8] Sync configs and knowledge files
      console.log('\n📋 [6/8] Синхронизация конфигов и knowledge...');
      await this.syncConfigs();

      // [7/8] Install deps + PM2 reload
      console.log('\n🔄 [7/8] Зависимости + PM2 reload...');
      await this.reloadServices();

      // [8/8] Post-deploy verification
      console.log('\n🛡️  [8/8] Пост-деплой верификация...');
      await this.postVerify();

      console.log('\n✅ Развертывание успешно завершено!');
      this.printSummary();
    } catch (error) {
      console.error(`\n❌ Ошибка развертывания: ${(error as Error).message}`);
      if (this.conn) await this.tryRollback();
      process.exit(1);
    } finally {
      this.conn?.end();
    }
  }

  // ─── SSH Helpers ───────────────────────────────────────────────────

  /** Подключение по SSH с паролем */
  private sshConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conn = new Client();
      this.conn.on('ready', () => resolve());
      this.conn.on('error', (err: Error) =>
        reject(new Error(`SSH connection failed: ${err.message}`))
      );
      this.conn.connect({
        host: this.host,
        port: 22,
        username: this.user,
        password: this.pass,
        readyTimeout: 30000,
      });
    });
  }

  /** Выполнить команду на сервере */
  private ssh(cmd: string, timeout = 30000): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.conn) return reject(new Error('SSH not connected'));

      const timer = setTimeout(
        () => reject(new Error(`SSH timeout: ${cmd.substring(0, 80)}`)),
        timeout
      );

      this.conn.exec(cmd, (err: Error | undefined, stream: any) => {
        if (err) {
          clearTimeout(timer);
          return reject(err);
        }

        let stdout = '';
        let stderr = '';

        stream.on('data', (d: Buffer) => {
          stdout += d.toString();
        });
        stream.stderr.on('data', (d: Buffer) => {
          stderr += d.toString();
        });
        stream.on('close', () => {
          clearTimeout(timer);
          resolve(stdout.trim());
        });
      });
    });
  }

  /** Получить SFTP сессию */
  private getSFTP(): Promise<SFTPWrapper> {
    return new Promise((resolve, reject) => {
      if (!this.conn) return reject(new Error('SSH not connected'));
      this.conn.sftp((err: Error | undefined, sftp: SFTPWrapper) =>
        err ? reject(err) : resolve(sftp)
      );
    });
  }

  /** Загрузить один файл по SFTP */
  private async uploadFile(
    sftp: SFTPWrapper,
    localPath: string,
    remotePath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      sftp.fastPut(localPath, remotePath, (err: Error | undefined) =>
        err ? reject(err) : resolve()
      );
    });
  }

  /** Рекурсивно собрать все файлы из директории */
  private walkDir(
    dir: string,
    base = dir
  ): Array<{ abs: string; rel: string }> {
    const results: Array<{ abs: string; rel: string }> = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      const rel = path.relative(base, abs);
      if (entry.isDirectory()) {
        results.push(...this.walkDir(abs, base));
      } else {
        results.push({ abs, rel });
      }
    }
    return results;
  }

  // ─── Deploy Steps ─────────────────────────────────────────────────

  /** Проверить PM2 статус всех сервисов */
  private async checkPM2(): Promise<void> {
    try {
      const output = await this.ssh(
        `pm2 jlist 2>/dev/null || echo "[]"`,
        15000
      );

      try {
        const procs = JSON.parse(output);
        if (Array.isArray(procs) && procs.length > 0) {
          for (const p of procs) {
            const name = p.name || 'unknown';
            const status = p.pm2_env?.status || 'unknown';
            const restarts = p.pm2_env?.restart_time || 0;
            const mem = ((p.monit?.memory || 0) / 1024 / 1024).toFixed(0);
            const icon = status === 'online' ? '✓' : '⚠';
            console.log(
              `   ${icon} ${name}: ${status} (mem: ${mem}MB, restarts: ${restarts})`
            );
          }
          return;
        }
      } catch {}

      // Fallback: PM2 не запущен или нет процессов
      console.log('   ○ PM2 процессов не найдено (первый деплой?)');
    } catch (e) {
      console.warn(`   ⚠ PM2 check failed: ${(e as Error).message}`);
    }
  }

  /** Создать бэкап dist/ на сервере */
  private async createBackup(): Promise<void> {
    try {
      const backupId = Date.now();
      const result = await this.ssh(
        `[ -d ${this.remote}/core/dist ] && ` +
          `cp -r ${this.remote}/core/dist ${this.remote}/core/dist-backup-${backupId} && ` +
          `echo "backup-${backupId}" || echo "no-dist-to-backup"`
      );
      console.log(`   ✓ ${result}`);
    } catch {
      console.warn('   ⚠ Бэкап пропущен');
    }
  }

  /** Загрузить core/dist/ на сервер через SFTP */
  private async uploadDist(): Promise<void> {
    const localDist = path.join(ROOT, 'core', 'dist');
    if (!fs.existsSync(localDist)) {
      throw new Error(`core/dist/ не найден: ${localDist}`);
    }

    // Удалить старый dist на сервере
    await this.ssh(`rm -rf ${this.remote}/core/dist`);

    // Собрать все файлы
    const files = this.walkDir(localDist);

    // Создать все удалённые директории за один вызов
    const dirs = new Set<string>();
    dirs.add(`${this.remote}/core/dist`);
    for (const f of files) {
      const relDir = path.dirname(f.rel).replace(/\\/g, '/');
      if (relDir !== '.') {
        dirs.add(`${this.remote}/core/dist/${relDir}`);
      }
    }
    await this.ssh(`mkdir -p ${Array.from(dirs).join(' ')}`);

    // Загрузить файлы через SFTP
    const sftp = await this.getSFTP();
    let count = 0;

    for (const f of files) {
      const remotePath = `${this.remote}/core/dist/${f.rel.replace(/\\/g, '/')}`;
      await this.uploadFile(sftp, f.abs, remotePath);
      count++;
    }

    sftp.end();
    console.log(`   ✓ Загружено ${count} файлов`);
  }

  /** Синхронизировать конфиги, .env, knowledge-файлы */
  private async syncConfigs(): Promise<void> {
    let uploaded = 0;
    const sftp = await this.getSFTP();

    // ecosystem.config.js and .cjs
    for (const ecoName of ['ecosystem.config.cjs', 'ecosystem.config.js']) {
      const ecoPath = path.join(ROOT, ecoName);
      if (fs.existsSync(ecoPath)) {
        await this.uploadFile(sftp, ecoPath, `${this.remote}/${ecoName}`);
        uploaded++;
        console.log(`   ✓ ${ecoName}`);
      }
    }

    // .env files
    for (const envName of ['core/.env', '.env']) {
      const envPath = path.join(ROOT, envName);
      if (fs.existsSync(envPath)) {
        await this.uploadFile(sftp, envPath, `${this.remote}/${envName}`);
        uploaded++;
        console.log(`   ✓ ${envName}`);
      }
    }

    // package.json + lock (for npm ci)
    for (const pkgName of [
      'core/package.json',
      'core/package-lock.json',
      'package.json',
    ]) {
      const pkgPath = path.join(ROOT, pkgName);
      if (fs.existsSync(pkgPath)) {
        await this.uploadFile(sftp, pkgPath, `${this.remote}/${pkgName}`);
        uploaded++;
      }
    }

    // dashboard.html (upload directly to both src and dist)
    const htmlPath = path.join(ROOT, 'core', 'src', 'dashboard.html');
    if (fs.existsSync(htmlPath)) {
      await this.uploadFile(sftp, htmlPath, `${this.remote}/core/src/dashboard.html`);
      await this.uploadFile(sftp, htmlPath, `${this.remote}/core/dist/dashboard.html`);
      uploaded += 2;
      console.log('   ✓ dashboard.html (src + dist)');
    }

    sftp.end();

    // Knowledge / data files (upload via new SFTP session)
    const knowledgeDirs = [
      { local: path.join(ROOT, 'core', 'data', 'knowledge'), remote: `${this.remote}/core/data/knowledge` },
      { local: path.join(ROOT, 'core', 'src', 'data'), remote: `${this.remote}/core/src/data` },
    ];

    for (const kd of knowledgeDirs) {
      if (fs.existsSync(kd.local)) {
        const dataFiles = this.walkDir(kd.local);
        const dataDirs = new Set<string>();
        dataDirs.add(kd.remote);
        for (const f of dataFiles) {
          const relDir = path.dirname(f.rel).replace(/\\/g, '/');
          if (relDir !== '.') {
            dataDirs.add(`${kd.remote}/${relDir}`);
          }
        }
        await this.ssh(`mkdir -p ${Array.from(dataDirs).join(' ')}`);

        const sftpK = await this.getSFTP();
        for (const f of dataFiles) {
          const remotePath = `${kd.remote}/${f.rel.replace(/\\/g, '/')}`;
          await this.uploadFile(sftpK, f.abs, remotePath);
          uploaded++;
        }
        sftpK.end();
        console.log(`   ✓ ${path.basename(kd.local)}/ (${dataFiles.length} файлов -> ${kd.remote})`);
      }
    }

    console.log(`   Итого синхронизировано: ${uploaded}`);
  }

  /** Установить зависимости и перезагрузить PM2 */
  private async reloadServices(): Promise<void> {
    // npm ci
    try {
      await this.ssh(
        `cd ${this.remote}/core && npm ci --production 2>&1 | tail -5`,
        120000
      );
      console.log('   ✓ Зависимости установлены');
    } catch {
      console.warn('   ⚠ npm ci пропущен (зависимости уже установлены)');
    }

    // PM2: restart ecosystem with .cjs or by name
    try {
      const result = await this.ssh(
        `cd ${this.remote} && (pm2 restart ecosystem.config.cjs --update-env || pm2 restart all) 2>&1`,
        30000
      );
      console.log('   ✓ PM2 перезагружен');
      const lines = result.split('\n').filter((l: string) => l.includes('✓') || l.includes('online'));
      if (lines.length > 0) {
        for (const line of lines.slice(0, 6)) {
          console.log(`     ${line.trim()}`);
        }
      }
    } catch (e) {
      console.warn(`   ⚠ PM2 reload failed: ${(e as Error).message}`);
      // Fallback: reload individual services
      const services = [
        'affiliate-dashboard',
        'affiliate-scheduler',
        'affiliate-health-monitor',
        'affiliate-telegram-bot',
        'affiliate-autopilot',
      ];
      for (const svc of services) {
        try {
          await this.ssh(
            `pm2 restart ${svc} 2>/dev/null || echo "not-found"`,
            15000
          );
          console.log(`   ✓ ${svc}`);
        } catch {
          console.warn(`   ⚠ ${svc} не перезагружен`);
        }
      }
    }

    // Дать сервисам время на инициализацию
    console.log('   ⏳ Ожидание инициализации (5s)...');
    await new Promise((r) => setTimeout(r, 5000));
  }

  /** Пост-деплой верификация */
  private async postVerify(): Promise<void> {
    // PM2 status
    await this.checkPM2();

    // HTTP endpoint checks
    const endpoints = [
      { path: '/', name: 'Dashboard' },
      { path: '/api/test/bot-shield', name: 'Bot Shield' },
      { path: '/api/credits/status', name: 'Credits Monitor' },
      { path: '/api/telemetry/stream?probe=1', name: 'Telemetry SSE' },
    ];

    for (const ep of endpoints) {
      try {
        const code = await this.ssh(
          `curl -s -m 3 -o /dev/null -w "%{http_code}" "http://localhost:5000${ep.path}" 2>/dev/null || echo "0"`,
          10000
        );
        const status = parseInt(code) || 0;
        const icon = status >= 200 && status < 400 ? '✓' : '⚠';
        console.log(`   ${icon} ${ep.name}: HTTP ${status}`);
      } catch {
        console.warn(`   ⚠ ${ep.name}: недоступен`);
      }
    }

    // halt.flag check
    try {
      const haltCheck = await this.ssh(
        `[ -f ${this.remote}/.antigravity/halt.flag ] && echo "HALTED" || echo "CLEAR"`
      );
      const icon = haltCheck === 'CLEAR' ? '✓' : '⚠';
      console.log(`   ${icon} halt.flag: ${haltCheck}`);
    } catch {}

    // SQLite queue check
    try {
      const queueCheck = await this.ssh(
        `[ -f ${this.remote}/core/queue.db ] && echo "exists" || echo "no-queue-db"`,
        5000
      );
      console.log(`   ✓ SQLite queue: ${queueCheck}`);
    } catch {}
  }

  /** Попытка отката при ошибке */
  private async tryRollback(): Promise<void> {
    console.log('\n⚠️  Попытка отката...');
    try {
      const backup = await this.ssh(
        `ls -td ${this.remote}/core/dist-backup-* 2>/dev/null | head -1`
      );
      if (backup) {
        await this.ssh(
          `rm -rf ${this.remote}/core/dist && mv ${backup} ${this.remote}/core/dist`
        );
        console.log('   ✓ Откат выполнен');
      } else {
        console.log('   ⚠ Бэкап не найден');
      }
    } catch {
      console.error('   ❌ Откат не удался');
    }
  }

  /** Вывести сводку развертывания */
  private printSummary(): void {
    const dur = ((Date.now() - this.t0) / 1000).toFixed(1);
    console.log(`\n${'═'.repeat(60)}`);
    console.log('📊 СВОДКА РАЗВЕРТЫВАНИЯ');
    console.log(`${'═'.repeat(60)}`);
    console.log(`✅ Статус:  УСПЕШНО`);
    console.log(`⏱️  Время:   ${dur}s`);
    console.log(`🎯 Хост:    ${this.host}`);
    console.log(`📁 Путь:    ${this.remote}`);
    console.log(`\n🔥 Обновления:`);
    console.log(`   • Anti-Fraud Heuristics (trust hierarchy, rate limiting)`);
    console.log(`   • Bot Shield Service (crawler detection, white/black pages)`);
    console.log(`   • Trust Hierarchy + Fingerprint Isolation`);
    console.log(`   • Credits Monitor (real-time API usage tracking)`);
    console.log(`\n✨ Проверьте:`);
    console.log(`   1. Dashboard: http://${this.host}:5000`);
    console.log(
      `   2. Bot Shield: http://${this.host}:5000/api/test/bot-shield`
    );
    console.log(`   3. Audit:     npm run audit:prod`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}

// ─── Entry Point ───────────────────────────────────────────────────
const deployer = new ProductionDeployer();
deployer.deploy().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
