/**
 * Production Health Audit Script (Windows-compatible, ssh2-based)
 * Проверяет здоровье всех компонентов на production
 * Usage: npm run audit:prod
 */

import { Client } from 'ssh2';
import * as path from 'path';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(process.cwd(), 'core', '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

interface ServiceHealth {
  name: string;
  status: 'online' | 'offline' | 'error';
  uptime: string;
  restarts: number;
  memory: string;
  cpu: string;
}

interface EndpointHealth {
  name: string;
  status: number;
  latency: number;
}

interface AuditResult {
  timestamp: string;
  host: string;
  services: ServiceHealth[];
  endpoints: EndpointHealth[];
  alerts: string[];
  haltFlag: string;
  verdict: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
}

class ProductionHealthAudit {
  private host = process.env.DEPLOY_HOST || '178.128.199.28';
  private user = process.env.DEPLOY_USER || 'root';
  private pass = process.env.SSH_ROOT_PASSWORD || '';
  private remote = '/var/www/affiliate';
  private conn: Client | null = null;

  async audit(): Promise<AuditResult> {
    if (!this.pass) {
      console.error('❌ SSH_ROOT_PASSWORD не задан в .env');
      process.exit(1);
    }

    console.log('🔍 Начало аудита production здоровья...');
    console.log(`   Хост: ${this.host}`);
    console.log(`   Время: ${new Date().toISOString()}\n`);

    const result: AuditResult = {
      timestamp: new Date().toISOString(),
      host: this.host,
      services: [],
      endpoints: [],
      alerts: [],
      haltFlag: 'unknown',
      verdict: 'HEALTHY',
    };

    try {
      // Connect
      await this.sshConnect();
      console.log(`   ✓ SSH подключение установлено\n`);

      // Check PM2 services
      result.services = await this.checkServices();

      // Check endpoints
      result.endpoints = await this.checkEndpoints();

      // Check halt.flag
      result.haltFlag = await this.checkHaltFlag();

      // Check SQLite queue
      await this.checkSQLiteQueue();

      // Generate alerts
      result.alerts = this.generateAlerts(result);

      // Determine verdict
      result.verdict = this.determineVerdict(result);

      // Print report
      this.printReport(result);
    } catch (error) {
      console.error('❌ Ошибка аудита:', (error as Error).message);
      result.verdict = 'CRITICAL';
      result.alerts.push(`Audit error: ${(error as Error).message}`);
    } finally {
      this.conn?.end();
    }

    return result;
  }

  // ─── SSH Helpers ──────────────────────────────────────────────────

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
        stream.on('data', (d: Buffer) => {
          stdout += d.toString();
        });
        stream.stderr.on('data', () => {}); // suppress stderr
        stream.on('close', () => {
          clearTimeout(timer);
          resolve(stdout.trim());
        });
      });
    });
  }

  // ─── Audit Checks ─────────────────────────────────────────────────

  private async checkServices(): Promise<ServiceHealth[]> {
    console.log('📊 Проверка PM2 сервисов...');
    const services: ServiceHealth[] = [];

    const expectedServices = [
      'affiliate-dashboard',
      'affiliate-scheduler',
      'affiliate-health-monitor',
      'affiliate-telegram-bot',
      'affiliate-autopilot',
    ];

    try {
      const output = await this.ssh('pm2 jlist 2>/dev/null || echo "[]"', 15000);
      let procs: any[] = [];

      try {
        procs = JSON.parse(output);
      } catch {
        procs = [];
      }

      for (const expectedName of expectedServices) {
        const proc = procs.find((p: any) => p.name === expectedName);

        if (proc) {
          const status = proc.pm2_env?.status || 'unknown';
          const restarts = proc.pm2_env?.restart_time || 0;
          const memBytes = proc.monit?.memory || 0;
          const memMB = (memBytes / 1024 / 1024).toFixed(0);
          const cpu = `${proc.monit?.cpu || 0}%`;
          const uptimeMs = Date.now() - (proc.pm2_env?.pm_uptime || Date.now());
          const uptimeStr = this.formatUptime(uptimeMs);

          const svc: ServiceHealth = {
            name: expectedName,
            status: status === 'online' ? 'online' : 'offline',
            uptime: uptimeStr,
            restarts,
            memory: `${memMB}MB`,
            cpu,
          };

          services.push(svc);
          const icon = svc.status === 'online' ? '✓' : '✗';
          console.log(
            `   ${icon} ${expectedName.padEnd(30)} ${svc.status.toUpperCase().padEnd(10)} mem: ${memMB}MB  restarts: ${restarts}  uptime: ${uptimeStr}`
          );

          // Memory alert check
          if (memBytes > 450 * 1024 * 1024) {
            console.log(`     ⚠ MEMORY WARNING: ${memMB}MB > 450MB limit`);
          }
        } else {
          services.push({
            name: expectedName,
            status: 'offline',
            uptime: 'N/A',
            restarts: 0,
            memory: 'N/A',
            cpu: 'N/A',
          });
          console.log(`   ✗ ${expectedName.padEnd(30)} NOT FOUND`);
        }
      }
    } catch (e) {
      console.error(
        '   ❌ Не удалось получить PM2 статус:',
        (e as Error).message
      );
      for (const name of expectedServices) {
        services.push({
          name,
          status: 'error',
          uptime: 'N/A',
          restarts: 0,
          memory: 'N/A',
          cpu: 'N/A',
        });
      }
    }

    return services;
  }

  private async checkEndpoints(): Promise<EndpointHealth[]> {
    console.log('\n🌐 Проверка endpoints...');
    const results: EndpointHealth[] = [];

    const endpoints = [
      { path: '/', name: 'Dashboard' },
      { path: '/api/test/bot-shield', name: 'Bot Shield' },
      { path: '/api/credits/status', name: 'Credits Monitor' },
      { path: '/api/telemetry/stream?probe=1', name: 'Telemetry SSE' },
    ];

    for (const ep of endpoints) {
      try {
        const output = await this.ssh(
          `curl -s -m 3 -o /dev/null -w "%{http_code}|%{time_total}" "http://localhost:5000${ep.path}" 2>/dev/null || echo "0|0"`,
          10000
        );

        const parts = output.split('|');
        const statusCode = parseInt(parts[0]) || 0;
        const latency = Math.round(parseFloat(parts[1] || '0') * 1000);

        results.push({
          name: ep.name,
          status: statusCode,
          latency,
        });

        const icon =
          statusCode >= 200 && statusCode < 400
            ? '✓'
            : statusCode >= 500
              ? '✗'
              : '⚠';
        console.log(
          `   ${icon} ${ep.name.padEnd(25)} HTTP ${statusCode}   (${latency}ms)`
        );
      } catch {
        results.push({ name: ep.name, status: 0, latency: 9999 });
        console.log(`   ✗ ${ep.name.padEnd(25)} UNREACHABLE`);
      }
    }

    return results;
  }

  private async checkHaltFlag(): Promise<string> {
    console.log('\n🚦 Проверка halt.flag...');
    try {
      const result = await this.ssh(
        `[ -f ${this.remote}/.antigravity/halt.flag ] && echo "HALTED" || echo "CLEAR"`
      );
      const icon = result === 'CLEAR' ? '✓' : '⚠';
      console.log(`   ${icon} halt.flag: ${result}`);
      return result;
    } catch {
      console.warn('   ⚠ Не удалось проверить halt.flag');
      return 'unknown';
    }
  }

  private async checkSQLiteQueue(): Promise<void> {
    console.log('\n🗃️  Проверка SQLite queue...');
    try {
      // Check if queue DB exists and is not locked
      const dbCheck = await this.ssh(
        `ls -la ${this.remote}/core/*.db 2>/dev/null || echo "no-db-files"`,
        5000
      );
      console.log(`   ${dbCheck.includes('.db') ? '✓' : '○'} Queue DB: ${dbCheck.includes('.db') ? 'exists' : 'not found (will be created on first use)'}`);

      // Check for lock files
      const lockCheck = await this.ssh(
        `ls ${this.remote}/core/*.db-wal ${this.remote}/core/*.db-shm 2>/dev/null | wc -l`,
        5000
      );
      const lockCount = parseInt(lockCheck) || 0;
      if (lockCount > 0) {
        console.log(`   ⚠ WAL/SHM lock files detected: ${lockCount}`);
      } else {
        console.log('   ✓ No stale locks');
      }
    } catch {
      console.log('   ○ SQLite check skipped');
    }
  }

  // ─── Analysis ─────────────────────────────────────────────────────

  private generateAlerts(result: AuditResult): string[] {
    const alerts: string[] = [];

    // Offline services
    const offline = result.services.filter((s) => s.status !== 'online');
    if (offline.length > 0) {
      alerts.push(
        `🔴 Offline services: ${offline.map((s) => s.name).join(', ')}`
      );
    }

    // High-restart services
    const highRestart = result.services.filter((s) => s.restarts > 10);
    if (highRestart.length > 0) {
      alerts.push(
        `🟡 High restart count: ${highRestart.map((s) => `${s.name}(${s.restarts})`).join(', ')}`
      );
    }

    // Failed endpoints
    const failedEP = result.endpoints.filter(
      (e) => e.status === 0 || e.status >= 500
    );
    if (failedEP.length > 0) {
      alerts.push(
        `🔴 Failed endpoints: ${failedEP.map((e) => e.name).join(', ')}`
      );
    }

    // High latency endpoints
    const slowEP = result.endpoints.filter(
      (e) => e.latency > 2500 && e.status > 0
    );
    if (slowEP.length > 0) {
      alerts.push(
        `🟡 Slow endpoints (>2.5s): ${slowEP.map((e) => `${e.name}(${e.latency}ms)`).join(', ')}`
      );
    }

    // Halt flag
    if (result.haltFlag === 'HALTED') {
      alerts.push('🔴 E-STOP: halt.flag is set — all agents halted');
    }

    // Memory over limit
    const highMem = result.services.filter((s) => {
      const mb = parseInt(s.memory) || 0;
      return mb > 450;
    });
    if (highMem.length > 0) {
      alerts.push(
        `🟡 Memory over 450MB: ${highMem.map((s) => `${s.name}(${s.memory})`).join(', ')}`
      );
    }

    return alerts;
  }

  private determineVerdict(result: AuditResult): 'HEALTHY' | 'DEGRADED' | 'CRITICAL' {
    const onlineCount = result.services.filter(
      (s) => s.status === 'online'
    ).length;
    const totalCount = result.services.length;
    const criticalAlerts = result.alerts.filter((a) => a.includes('🔴')).length;

    if (onlineCount === totalCount && criticalAlerts === 0) {
      return 'HEALTHY';
    } else if (onlineCount >= Math.ceil(totalCount * 0.6) && criticalAlerts <= 1) {
      return 'DEGRADED';
    } else {
      return 'CRITICAL';
    }
  }

  // ─── Report ───────────────────────────────────────────────────────

  private printReport(result: AuditResult): void {
    const verdictEmoji =
      result.verdict === 'HEALTHY'
        ? '✅'
        : result.verdict === 'DEGRADED'
          ? '⚠️'
          : '❌';

    console.log(`\n${'═'.repeat(64)}`);
    console.log(`${verdictEmoji} PRODUCTION HEALTH AUDIT REPORT`);
    console.log(`${'═'.repeat(64)}`);
    console.log(`Timestamp:  ${result.timestamp}`);
    console.log(`Host:       ${result.host}`);
    console.log(`Verdict:    ${result.verdict}`);

    // Services table
    const onlineCount = result.services.filter(
      (s) => s.status === 'online'
    ).length;
    console.log(
      `\n📊 Services (${onlineCount}/${result.services.length} online):`
    );
    console.log(
      `   ${'Name'.padEnd(32)} ${'Status'.padEnd(10)} ${'Memory'.padEnd(10)} ${'Restarts'.padEnd(10)} Uptime`
    );
    console.log(`   ${'─'.repeat(75)}`);
    for (const svc of result.services) {
      const icon =
        svc.status === 'online'
          ? '✓'
          : svc.status === 'offline'
            ? '✗'
            : '⚠';
      console.log(
        `   ${icon} ${svc.name.padEnd(30)} ${svc.status.toUpperCase().padEnd(10)} ${svc.memory.padEnd(10)} ${String(svc.restarts).padEnd(10)} ${svc.uptime}`
      );
    }

    // Endpoints table
    console.log(`\n🌐 Endpoints:`);
    console.log(
      `   ${'Name'.padEnd(28)} ${'Status'.padEnd(10)} Latency`
    );
    console.log(`   ${'─'.repeat(50)}`);
    for (const ep of result.endpoints) {
      const icon =
        ep.status >= 200 && ep.status < 400
          ? '✓'
          : ep.status === 0
            ? '✗'
            : '⚠';
      console.log(
        `   ${icon} ${ep.name.padEnd(26)} ${(ep.status || 'ERROR').toString().padEnd(10)} ${ep.latency}ms`
      );
    }

    // Halt flag
    console.log(`\n🚦 E-STOP:    halt.flag = ${result.haltFlag}`);

    // Alerts
    if (result.alerts.length > 0) {
      console.log(`\n🚨 Alerts (${result.alerts.length}):`);
      for (const alert of result.alerts) {
        console.log(`   ${alert}`);
      }
    } else {
      console.log('\n✨ No alerts. System healthy.');
    }

    console.log(`${'═'.repeat(64)}\n`);
  }

  // ─── Utilities ────────────────────────────────────────────────────

  private formatUptime(ms: number): string {
    if (ms < 0) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// ─── Entry Point ──────────────────────────────────────────────────
const audit = new ProductionHealthAudit();
audit.audit().then((result) => {
  const exitCode =
    result.verdict === 'HEALTHY' ? 0 : result.verdict === 'DEGRADED' ? 1 : 2;
  process.exit(exitCode);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
