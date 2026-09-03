import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_PATH = '/var/www/affiliate';

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

async function purgeAndVerifyProduction() {
  console.log('\n🧹 ================================================================');
  console.log('🧹 PURGE SYNTHETIC DATA & VERIFY ZERO DEMO STATE (PRODUCTION)');
  console.log('🧹 ================================================================\n');

  console.log(`📡 Connecting to SSH: ${USER}@${HOST}...`);
  const conn = new Client();

  await new Promise<void>((resolve, reject) => {
    conn
      .on('ready', () => {
        console.log('   ✓ SSH connection established');
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
    // 1. Purge DB
    console.log('\n🗑️  [1/4] Purging synthetic tables in SQLite tg_leads.db...');
    const purgeScript = `
cd ${REMOTE_PATH}/core && node -e '
const fs = require("fs");
const path = require("path");
let sqlite;
try { sqlite = require("node:sqlite"); } catch(e) { sqlite = null; }

const dbPath = path.resolve("${REMOTE_PATH}/core/data/tg_leads.db");
console.log("Checking DB at: " + dbPath);

if (fs.existsSync(dbPath) && sqlite) {
  try {
    const db = new sqlite.DatabaseSync(dbPath);
    db.exec("DELETE FROM mab_arms;");
    db.exec("DELETE FROM click_attributions;");
    db.exec("DELETE FROM tg_leads;");
    db.exec("DELETE FROM bridge_clicks;");
    db.exec("VACUUM;");
    console.log("✓ Successfully purged mab_arms, click_attributions, tg_leads, bridge_clicks.");
  } catch (err) {
    console.error("DB Purge error:", err);
  }
} else if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("✓ Unlinked existing SQLite db file for fresh zero-state recreation.");
} else {
  console.log("○ DB file does not exist yet (already zero).");
}

// Check memory.json if exists
const memPath = path.resolve("${REMOTE_PATH}/.antigravity/memory.json");
if (fs.existsSync(memPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(memPath, "utf8"));
    if (data.campaigns) data.campaigns = {};
    if (data.bundles) data.bundles = {};
    if (data.events) data.events = [];
    fs.writeFileSync(memPath, JSON.stringify(data, null, 2), "utf8");
    console.log("✓ Reset memory.json telemetry to zero.");
  } catch (e) {}
}

// Reset financial_telemetry.json
const telemetryPaths = [
  path.resolve("${REMOTE_PATH}/core/data/financial_telemetry.json"),
  path.resolve("${REMOTE_PATH}/data/financial_telemetry.json"),
];
for (const tp of telemetryPaths) {
  if (fs.existsSync(tp)) {
    try {
      fs.writeFileSync(tp, JSON.stringify({
        version: "1.0.0",
        updatedAt: new Date().toISOString(),
        dedupKeys: [],
        campaigns: {},
        bundles: {},
        recentEvents: []
      }, null, 2), "utf8");
      console.log("✓ Reset financial_telemetry file to zero: " + tp);
    } catch (e) {
      console.error("Failed to reset " + tp, e);
    }
  }
}
'
`;
    const resPurge = await runSsh(conn, purgeScript);
    console.log(resPurge.stdout.trim());

    // 2. Restart PM2 processes
    console.log('\n🔄 [2/4] Restarting PM2 processes...');
    const resRestart = await runSsh(
      conn,
      `pm2 restart all --update-env`
    );
    console.log(resRestart.stdout.trim());

    // Wait 3s
    await new Promise((r) => setTimeout(r, 3000));

    // 3. Execute /stats command inside TelegramControlBot on production
    console.log('\n📊 [3/4] Evaluating /stats command on production droplet...');
    const statsScript = `
cd ${REMOTE_PATH}/core && node -e '
const dotenv = require("dotenv");
dotenv.config({ path: "/var/www/affiliate/.env" });
dotenv.config({ path: "/var/www/affiliate/core/.env" });

const { TelegramControlBot } = require("./dist/services/telegram-control-bot.service.js");
const bot = TelegramControlBot.getInstance();

const adminId = Number(process.env.ADMIN_CHAT_ID || "808343978");

bot.handleCommand({
  message_id: 999,
  chat: { id: adminId, type: "private" },
  from: { id: adminId, is_bot: false, first_name: "Admin" },
  date: Date.now(),
  text: "/stats"
}).then(res => {
  console.log("\\n--- BEGIN /stats OUTPUT ---");
  console.log(res);
  console.log("--- END /stats OUTPUT ---\\n");
}).catch(err => {
  console.error("Failed to run /stats:", err);
});
'
`;
    const resStats = await runSsh(conn, statsScript);
    console.log(resStats.stdout.trim());

    // 4. Verification Check
    const out = resStats.stdout;
    const isZeroRev = out.includes('$0.00 USD');
    const isZeroClicks = out.includes('Всего кликов:</b> 0') || out.includes('Всего кликов: 0');
    const isZeroConversions = out.includes('Конверсий:</b> 0') || out.includes('Конверсий: 0');
    const hasDashboard = out.includes('affiliate-dashboard');
    const hasScheduler = out.includes('affiliate-scheduler');
    const hasHealth = out.includes('affiliate-health-monitor');
    const hasBot = out.includes('affiliate-telegram-bot');
    const hasAutopilot = out.includes('affiliate-autopilot');

    console.log('\n🔎 [4/4] Verification Summary:');
    console.log(`   • Revenue is $0.00: ${isZeroRev ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Clicks count is 0: ${isZeroClicks ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Conversions count is 0: ${isZeroConversions ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Process affiliate-dashboard: ${hasDashboard ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Process affiliate-scheduler: ${hasScheduler ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Process affiliate-health-monitor: ${hasHealth ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Process affiliate-telegram-bot: ${hasBot ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   • Process affiliate-autopilot: ${hasAutopilot ? '✅ PASS' : '❌ FAIL'}`);

    if (
      isZeroRev &&
      isZeroClicks &&
      isZeroConversions &&
      hasDashboard &&
      hasScheduler &&
      hasHealth &&
      hasBot &&
      hasAutopilot
    ) {
      console.log('\n🎉 ALL CHECKS PASSED: Production is in 100% clean zero-demo-data state with all 5 PM2 processes!');
    } else {
      console.warn('\n⚠️ Some assertions need attention.');
    }
  } finally {
    conn.end();
  }
}

purgeAndVerifyProduction().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
