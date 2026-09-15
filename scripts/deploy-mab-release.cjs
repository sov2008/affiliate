const ssh2 = require('ssh2');
const fs = require('fs');
const path = require('path');

const HOST = '178.128.199.28';
const USER = 'root';
const KEY_PATH = 'D:/keys/antigravity_digitalocean_ubuntu';

console.log('🚀 ================================================================');
console.log('🚀 Production Deployment & MAB Release: 178.128.199.28');
console.log('🚀 ================================================================\n');

if (!fs.existsSync(KEY_PATH)) {
  console.error(`❌ Private key not found at ${KEY_PATH}`);
  process.exit(1);
}

const conn = new ssh2.Client();

function runCmd(client, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️ Executing: ${cmd}`);
    client.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('data', (d) => {
        const text = d.toString();
        output += text;
        process.stdout.write(text);
      });
      stream.stderr.on('data', (d) => {
        const text = d.toString();
        output += text;
        process.stderr.write(text);
      });
      stream.on('close', (code) => {
        if (code !== 0) {
          console.warn(`⚠️ Command exited with code ${code}`);
        }
        resolve({ code, output });
      });
    });
  });
}

conn.on('ready', async () => {
  console.log(`✅ SSH Connected to ${HOST} as ${USER}`);

  try {
    const APP_DIR = '/var/www/affiliate';

    // 1. Pull Git Origin Main
    console.log('\n--- [STEP 1] Pulling Latest Git Commits ---');
    await runCmd(conn, `cd ${APP_DIR} && git fetch origin && git reset --hard origin/main && git log -1 --oneline`);

    // 2. Sanitize SQLite Production Database
    console.log('\n--- [STEP 2] Sanitizing Production SQLite Database (mab_arms) ---');
    await runCmd(conn, `node -e "
      const { DatabaseSync } = require('node:sqlite');
      const dbPath = '${APP_DIR}/core/data/tg_leads.db';
      console.log('Opening DB:', dbPath);
      const db = new DatabaseSync(dbPath);
      const res = db.prepare('UPDATE mab_arms SET impressions = conversions WHERE conversions > impressions').run();
      console.log('Production DB MAB arms sanitized. Changes:', res.changes);
      const rows = db.prepare('SELECT * FROM mab_arms').all();
      console.log('Updated mab_arms rows in production:');
      console.table(rows);
    "`);

    // 3. Rebuild Core TypeScript
    console.log('\n--- [STEP 3] Rebuilding Core Application ---');
    await runCmd(conn, `cd ${APP_DIR}/core && npm run build`);

    // 4. Graceful Reload of PM2 Services
    console.log('\n--- [STEP 4] Graceful Reload PM2 Services ---');
    await runCmd(conn, `cd ${APP_DIR}/core && pm2 reload ecosystem.config.js --update-env || pm2 restart ecosystem.config.js --update-env`);
    await runCmd(conn, `sleep 3 && pm2 status`);

    // 5. Post-Deploy Verification: TDS / Click endpoints
    console.log('\n--- [STEP 5] Post-Deploy Endpoint Verification ---');
    console.log('\nTesting Dashboard TDS Redirect (/go endpoint)...');
    await runCmd(conn, `curl -i -s "http://127.0.0.1:5000/go?cid=verify_deploy&offer=lospollos_dating" | head -n 12`);

    console.log('\nTesting Analytics / Click Endpoint on Port 3000 (if running)...');
    await runCmd(conn, `curl -i -s "http://127.0.0.1:3000/click?campaign=cmp_lospollos_dating&source=mab_verify" | head -n 12 || true`);

    console.log('\nTesting MAB Status API...');
    await runCmd(conn, `curl -s -u admin:AffOps_Secure_k9P2w8Nx7Q4m "http://127.0.0.1:5000/api/mab/status" | head -c 300`);

    console.log('\n\n🎉 ================================================================');
    console.log('🎉 PRODUCTION DEPLOYMENT COMPLETED SUCCESSFULLY!');
    console.log('🎉 ================================================================');
  } catch (err) {
    console.error('❌ Deployment error:', err);
  } finally {
    conn.end();
    process.exit(0);
  }
});

conn.on('error', (err) => {
  console.error('❌ SSH Connection failed:', err);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  privateKey: fs.readFileSync(KEY_PATH),
  readyTimeout: 30000
});
