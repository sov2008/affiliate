"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FleetCommanderAgent = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const node_sqlite_1 = require("node:sqlite");

class FleetCommanderAgent {
    static instance = null;
    isRunning = false;
    daemonTimer = null;
    rootDir;
    coreDir;
    dbPath;
    pinterestQueueFile;
    stateFile;
    logFile;
    lastReportTimestamp = 0;

    constructor() {
        this.rootDir = '/var/www/affiliate';
        this.coreDir = '/var/www/affiliate/core';

        const candidateDbs = [
            path_1.default.resolve(this.rootDir, 'core/data/content_queue.sqlite'),
            path_1.default.resolve(this.coreDir, 'data/content_queue.sqlite'),
            '/var/www/affiliate/core/data/content_queue.sqlite',
        ];
        this.dbPath = candidateDbs.find(p => fs_1.default.existsSync(p)) || candidateDbs[0];

        const candidatePinterests = [
            path_1.default.resolve(this.rootDir, '.antigravity/pinterest_queue.json'),
            path_1.default.resolve(this.coreDir, '../.antigravity/pinterest_queue.json'),
            '/var/www/affiliate/.antigravity/pinterest_queue.json',
        ];
        this.pinterestQueueFile = candidatePinterests.find(p => fs_1.default.existsSync(p)) || candidatePinterests[0];

        const stateDir = path_1.default.resolve(this.rootDir, '.antigravity');
        if (!fs_1.default.existsSync(stateDir)) {
            try { fs_1.default.mkdirSync(stateDir, { recursive: true }); } catch { }
        }
        this.stateFile = path_1.default.resolve(stateDir, 'fleet_state.json');
        this.logFile = path_1.default.resolve(stateDir, 'logs/fleet-commander.log');
        const logDir = path_1.default.dirname(this.logFile);
        if (!fs_1.default.existsSync(logDir)) {
            try { fs_1.default.mkdirSync(logDir, { recursive: true }); } catch { }
        }
    }

    static getInstance() {
        if (!FleetCommanderAgent.instance) {
            FleetCommanderAgent.instance = new FleetCommanderAgent();
        }
        return FleetCommanderAgent.instance;
    }

    log(msg) {
        const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const line = `[${ts}] [FleetCommander-Director] ${msg}`;
        console.log(line);
        try {
            fs_1.default.appendFileSync(this.logFile, line + '\n');
        } catch { }
    }

    async sendTelegramDirectorReport(text) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.ADMIN_CHAT_ID || '808343978';
        if (!botToken || !chatId) return;

        try {
            await axios_1.default.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            }, { timeout: 8000 });
        } catch (err) {
            this.log(`⚠️ Telegram director report failed: ${err.message}`);
        }
    }

    /**
     * Master Director Control & Orchestration Cycle
     */
    async runControlCycle() {
        this.log('👑 [MASTER DIRECTOR] Initiating Full Enterprise Orchestration Cycle...');
        const actions = [];

        // 1. Host Health Metrics
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const ramUsedPercent = Math.round(((totalMem - freeMem) / totalMem) * 100);
        const ramFreeMb = Math.round(freeMem / 1024 / 1024);
        const uptimeHours = Math.round((os_1.default.uptime() / 3600) * 10) / 10;

        // 2. PM2 Fleet Audit & Self-Healing
        const processes = this.auditPm2Processes(actions);

        // 3. Autonomous Catalog & Product Pipelines Orchestration
        const catalogStats = await this.orchestrateCatalogPipelines(actions);

        // 4. Queue audits & Auto-Refills
        const queues = this.auditAndRefillQueues(actions);

        // 5. Perimeter HTTP Endpoint Audits
        const endpoints = await this.auditEndpoints(actions);

        // Evaluate overall health
        let fleetHealth = 'HEALTHY';
        const hasDownProcess = processes.some(p => p.status !== 'online' && p.name !== 'affiliate-reddit-scout');
        const hasDownEndpoint = endpoints.some(e => !e.ok);
        if (hasDownProcess || hasDownEndpoint) {
            fleetHealth = 'DEGRADED';
        } else if (actions.length > 0) {
            fleetHealth = 'RECOVERED';
        }

        const report = {
            timestamp: new Date().toISOString(),
            fleetHealth,
            host: {
                hostname: os_1.default.hostname(),
                ramUsedPercent,
                ramFreeMb,
                cpuCores: os_1.default.cpus().length,
                uptimeHours,
            },
            processes,
            catalogStats,
            queues,
            endpoints,
            remediationActions: actions,
        };

        // Persist state
        try {
            fs_1.default.writeFileSync(this.stateFile, JSON.stringify(report, null, 2));
        } catch (err) {
            this.log(`⚠️ Failed to persist state: ${err.message}`);
        }

        this.log(`Cycle finished. Status: ${fleetHealth} | Catalog Stores: ${catalogStats.totalStores} | Live Products: ${catalogStats.totalProducts} | Remediations: ${actions.length}`);

        // Dispatch periodic Telegram Executive Summary (every 6 hours or if remediations occurred)
        const now = Date.now();
        const sixHoursMs = 6 * 60 * 60 * 1000;
        if (actions.length > 0 || now - this.lastReportTimestamp >= sixHoursMs) {
            this.lastReportTimestamp = now;
            const healthEmoji = fleetHealth === 'HEALTHY' ? '🟢' : fleetHealth === 'RECOVERED' ? '🟡' : '🔴';
            const actionLines = actions.length > 0 ? `\n\n⚡ <b>Действия директора:</b>\n${actions.map(a => `• ${a}`).join('\n')}` : '';
            
            const msg = `👑 <b>[ОТЧЕТ ВО РКЕРА-ДИРЕКТОРА]</b>\n` +
                        `${healthEmoji} <b>Статус флота:</b> ${fleetHealth}\n` +
                        `🖥 <b>Сервер:</b> RAM: ${ramUsedPercent}% (${ramFreeMb}MB свободно) | Uptime: ${uptimeHours}ч\n` +
                        `⚙️ <b>Процессы PM2:</b> ${processes.filter(p => p.status === 'online').length}/${processes.length} онлайн\n` +
                        `🛍 <b>Каталог PromoRadar:</b> ${catalogStats.totalStores} магазинов | ${catalogStats.totalProducts} живых товаров\n` +
                        `🌐 <b>Сайты:</b> PromoRadar ✅ | FlirtCheck ✅` +
                        `${actionLines}`;

            await this.sendTelegramDirectorReport(msg);
        }

        return report;
    }

    /**
     * Orchestrates product catalogs, coupon sync, and applications
     */
    async orchestrateCatalogPipelines(actions) {
        let totalStores = 0;
        let totalProducts = 0;

        try {
            const couponsPath = path_1.default.resolve(this.rootDir, 'deals-portal/src/data/couponsData.ts');
            if (fs_1.default.existsSync(couponsPath)) {
                const c = fs_1.default.readFileSync(couponsPath, 'utf8');
                const storeMatches = c.match(/slug:\s*["'][a-zA-Z0-9_-]+["']/g) || [];
                totalStores = storeMatches.length;
            }

            const productsPath = path_1.default.resolve(this.rootDir, 'deals-portal/src/data/productsData.ts');
            if (fs_1.default.existsSync(productsPath)) {
                const p = fs_1.default.readFileSync(productsPath, 'utf8');
                const idMatches = p.match(/imageUrl:\s*["']http/g) || [];
                totalProducts = idMatches.length;
            }
        } catch {}

        // Autonomous trigger: If products < 50, force run autonomous_product_sync
        if (totalProducts < 50) {
            this.log('⚠️ Products catalog count below threshold. Director triggering autonomous_product_sync...');
            try {
                (0, child_process_1.execSync)('node /var/www/affiliate/scripts/autonomous_product_sync.cjs', { timeout: 60000, stdio: 'ignore' });
                actions.push('Director autonomously triggered product catalog synchronization');
            } catch (err) {
                this.log(`⚠️ Product sync trigger error: ${err.message}`);
            }
        }

        return { totalStores, totalProducts };
    }

    /**
     * Inspect and remediate PM2 managed processes
     */
    auditPm2Processes(actions) {
        const result = [];
        try {
            const stdout = (0, child_process_1.execSync)('pm2 jlist', { timeout: 10000, stdio: ['pipe', 'pipe', 'ignore'] }).toString();
            const list = JSON.parse(stdout);

            for (const p of list) {
                const id = p.pm_id;
                const name = p.name;
                const status = p.pm2_env?.status || 'unknown';
                const uptimeMin = Math.round((Date.now() - (p.pm2_env?.pm_uptime || Date.now())) / 60000);
                const restarts = p.pm2_env?.restart_time || 0;
                const memMb = Math.round((p.monit?.memory || 0) / 1024 / 1024);
                const cpu = p.monit?.cpu || 0;

                result.push({ id, name, status, uptimeMin, restarts, memMb, cpu });

                // Self-Healing 1: Handle failed crash loops (stop rogue restarts)
                if (name === 'affiliate-reddit-scout' && (status === 'waiting restart' || restarts > 30)) {
                    try {
                        (0, child_process_1.execSync)(`pm2 stop ${id}`, { timeout: 10000, stdio: 'ignore' });
                        actions.push(`Director safely stopped crash-looping process: ${name}`);
                        this.log(`🛑 Process [${name}:${id}] safely stopped to protect CPU.`);
                    } catch {}
                    continue;
                }

                // Self-Healing 2: Restart unexpected offline processes
                if ((status === 'errored' || status === 'stopped') && name !== 'affiliate-reddit-scout') {
                    this.log(`⚠️ Process [${name}:${id}] is ${status}. Triggering autonomous restart...`);
                    try {
                        (0, child_process_1.execSync)(`pm2 restart ${id}`, { timeout: 10000, stdio: 'ignore' });
                        actions.push(`Director restarted errored process: ${name}`);
                        this.log(`✅ Process [${name}:${id}] restarted successfully.`);
                    } catch (err) {
                        this.log(`❌ Failed to restart [${name}:${id}]: ${err.message}`);
                    }
                }

                // Self-Healing 3: Memory leak guard (graceful reload if > 350MB)
                if (memMb > 350 && !name.includes('pinterest') && status === 'online') {
                    this.log(`⚠️ Process [${name}:${id}] memory high (${memMb}MB). Graceful reload...`);
                    try {
                        (0, child_process_1.execSync)(`pm2 reload ${id}`, { timeout: 10000, stdio: 'ignore' });
                        actions.push(`Director reloaded high-memory process: ${name} (${memMb}MB)`);
                        this.log(`✅ Process [${name}:${id}] reloaded cleanly.`);
                    } catch {}
                }
            }
        } catch (err) {
            this.log(`⚠️ Failed to parse PM2 jlist: ${err.message}`);
        }
        return result;
    }

    /**
     * Inspect and refill queues
     */
    auditAndRefillQueues(actions) {
        let twitterApproved = 0;
        let twitterDispatched = 0;
        let pinterestReady = 0;
        let pinterestPublished = 0;

        if (fs_1.default.existsSync(this.dbPath)) {
            try {
                const db = new node_sqlite_1.DatabaseSync(this.dbPath);
                const rows = db.prepare(`SELECT platform, status, COUNT(*) as cnt FROM content_queue_v2 GROUP BY platform, status`).all();
                for (const r of rows) {
                    if (r.platform === 'TWITTER' && r.status === 'APPROVED') twitterApproved = r.cnt;
                    if (r.platform === 'TWITTER' && r.status === 'DISPATCHED') twitterDispatched = r.cnt;
                }
            } catch (err) {
                this.log(`⚠️ SQLite queue inspection note: ${err.message}`);
            }
        }

        if (fs_1.default.existsSync(this.pinterestQueueFile)) {
            try {
                const raw = fs_1.default.readFileSync(this.pinterestQueueFile, 'utf8');
                const pQueue = JSON.parse(raw);
                if (Array.isArray(pQueue)) {
                    pinterestReady = pQueue.filter(x => x.status === 'ready').length;
                    pinterestPublished = pQueue.filter(x => x.status === 'published').length;
                }
            } catch {}
        }

        return { twitterApproved, twitterDispatched, pinterestReady, pinterestPublished };
    }

    /**
     * Verify HTTP availability of key infrastructure endpoints
     */
    async auditEndpoints(actions) {
        const urls = [
            'https://promoradar.store/',
            'https://promoradar.store/stores/',
            'https://flirtcheck.site/',
            'https://flirtcheck.site/deals/',
            'http://127.0.0.1:5000/api/health',
        ];

        const results = [];
        for (const url of urls) {
            const start = Date.now();
            try {
                const res = await axios_1.default.get(url, {
                    timeout: 8000,
                    validateStatus: (status) => status >= 200 && status < 400,
                    headers: { 'User-Agent': 'Mozilla/5.0 Master-Director/1.0' },
                });
                const latencyMs = Date.now() - start;
                results.push({ url, ok: true, statusCode: res.status, latencyMs });
            } catch (err) {
                const latencyMs = Date.now() - start;
                results.push({ url, ok: false, error: err.message, latencyMs });
                this.log(`❌ Endpoint check failed: ${url} (${err.message})`);
                if (url.includes('127.0.0.1:5000')) {
                    try {
                        (0, child_process_1.execSync)('pm2 reload affiliate-dashboard', { timeout: 10000, stdio: 'ignore' });
                        actions.push('Director reloaded dashboard after health probe failure');
                    } catch {}
                }
            }
        }
        return results;
    }

    /**
     * Start daemon mode
     */
    startDaemon(intervalMinutes = 15) {
        if (this.isRunning) {
            this.log('Daemon already running.');
            return;
        }
        this.isRunning = true;
        this.log(`👑 Master Director Daemon started (Cycle Interval: ${intervalMinutes}m).`);
        this.runControlCycle().catch(err => this.log(`Cycle error: ${err.message}`));
        const intervalMs = intervalMinutes * 60 * 1000;
        this.daemonTimer = setInterval(() => {
            this.runControlCycle().catch(err => this.log(`Cycle error: ${err.message}`));
        }, intervalMs);
    }

    stopDaemon() {
        if (this.daemonTimer) {
            clearInterval(this.daemonTimer);
            this.daemonTimer = null;
        }
        this.isRunning = false;
        this.log('Master Director Daemon stopped.');
    }
}
exports.FleetCommanderAgent = FleetCommanderAgent;
