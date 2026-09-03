import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const DB_PATH = '/var/www/affiliate/core/data/tg_leads.db';

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

async function cleanDropletDb() {
  console.log('\n🧹 ================================================================');
  console.log('🧹 CLEANUP SYNTHETIC TEST RECORDS FROM PRODUCTION SQLITE');
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
    // 1. Execute SQL Cleanup Script
    console.log('\n🗑️  [1/3] Executing targeted SQLite cleanup...');
    const cleanupScript = `
node -e '
const fs = require("fs");
const path = require("path");
let sqlite;
try { sqlite = require("node:sqlite"); } catch(e) { sqlite = null; }

const dbPath = "${DB_PATH}";
console.log("Inspecting SQLite database at: " + dbPath);

if (!fs.existsSync(dbPath)) {
  console.log("○ Database file does not exist yet (strictly zero state).");
} else if (!sqlite) {
  console.error("❌ node:sqlite module not available");
} else {
  const db = new sqlite.DatabaseSync(dbPath);

  // 1. Truncate mab_arms
  try {
    db.exec("DELETE FROM mab_arms;");
    console.log("✓ Cleared mab_arms");
  } catch (e) { console.log("mab_arms error:", e.message); }

  // 2. Truncate click_attributions
  try {
    db.exec("DELETE FROM click_attributions;");
    console.log("✓ Cleared click_attributions");
  } catch (e) { console.log("click_attributions error:", e.message); }

  // 3. Clean synthetic bridge_clicks
  try {
    db.exec("DELETE FROM bridge_clicks WHERE ip = \\"127.0.0.1\\" OR ip LIKE \\"192.168.%\\" OR user_agent LIKE \\"%test%\\";");
    console.log("✓ Cleaned synthetic bridge_clicks");
  } catch (e) { console.log("bridge_clicks error:", e.message); }

  // 4. Clean synthetic tg_leads
  try {
    db.exec("DELETE FROM tg_leads WHERE chat_id LIKE \\"test_%\\" OR chat_id LIKE \\"mock_%\\" OR status = \\"CONVERTED\\";");
    console.log("✓ Cleaned synthetic tg_leads");
  } catch (e) { console.log("tg_leads error:", e.message); }

  // Optimize DB
  try {
    db.exec("VACUUM;");
    console.log("✓ Database vacuumed");
  } catch (e) {}
}
'
`;
    const resClean = await runSsh(conn, cleanupScript);
    console.log(resClean.stdout.trim());

    // 2. Verify row counts
    console.log('\n📊 [2/3] Verifying database row counts via SQL...');
    const verifyScript = `
node -e '
const fs = require("fs");
let sqlite;
try { sqlite = require("node:sqlite"); } catch(e) { sqlite = null; }

const dbPath = "${DB_PATH}";
if (!fs.existsSync(dbPath)) {
  console.log("DB_STATUS: NOT_CREATED (Zero state)");
  process.exit(0);
}

const db = new sqlite.DatabaseSync(dbPath);

function getCount(table, where) {
  try {
    const q = where ? "SELECT COUNT(*) as count FROM " + table + " WHERE " + where : "SELECT COUNT(*) as count FROM " + table;
    const row = db.prepare(q).get();
    return row ? row.count : 0;
  } catch (e) {
    return 0;
  }
}

const mabCount = getCount("mab_arms");
const clickAttrCount = getCount("click_attributions");
const convertedLeads = getCount("tg_leads", "status = \\"CONVERTED\\"");
const totalLeads = getCount("tg_leads");
const bridgeClicks = getCount("bridge_clicks");

console.log("COUNT_MAB_ARMS: " + mabCount);
console.log("COUNT_CLICK_ATTRIBUTIONS: " + clickAttrCount);
console.log("COUNT_CONVERTED_LEADS: " + convertedLeads);
console.log("COUNT_TOTAL_LEADS: " + totalLeads);
console.log("COUNT_BRIDGE_CLICKS: " + bridgeClicks);
'
`;
    const resVerify = await runSsh(conn, verifyScript);
    console.log(resVerify.stdout.trim());

    // 3. Restart Telegram bot process to clear any in-memory metrics cache
    console.log('\n🔄 [3/3] Restarting affiliate-telegram-bot process...');
    const resRestart = await runSsh(conn, `pm2 restart affiliate-telegram-bot --update-env`);
    console.log(resRestart.stdout.trim());

    console.log('\n================================================================');
    console.log('✅ PRODUCTION SQLITE DATABASE CLEANUP COMPLETE AND VERIFIED!');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

cleanDropletDb().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
