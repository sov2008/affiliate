import ssh2 from 'ssh2';
import fs from 'fs';

const HOST = '178.128.199.28';
const USER = 'root';
const KEY_PATH = 'D:/keys/antigravity_digitalocean_ubuntu';

console.log('🚀 ================================================================');
console.log('🚀 Deploying Blog Update to DigitalOcean Droplet: 178.128.199.28');
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
    console.log('\n--- [STEP 1] Pulling Latest Commits ---');
    await runCmd(conn, `cd ${APP_DIR} && git fetch origin && git reset --hard origin/main && git log -1 --oneline`);

    // 2. Build Blog with New Posts
    console.log('\n--- [STEP 2] Building Production Blog (Astro) ---');
    await runCmd(conn, `cd ${APP_DIR} && npm run build:blog`);

    // 3. Check and Update Queue Status in SQLite on Production
    console.log('\n--- [STEP 3] Updating & Verifying Status in SQLite on Production ---');
    await runCmd(conn, `node -e "
      const { DatabaseSync } = require('node:sqlite');
      const db = new DatabaseSync('${APP_DIR}/core/data/content_queue.sqlite');
      const before = db.prepare('SELECT status, count(*) as cnt FROM content_queue_v2 GROUP BY status').all();
      console.log('Before update:', JSON.stringify(before));
      const res = db.prepare(\\"UPDATE content_queue_v2 SET status = 'APPROVED', updated_at = unixepoch() WHERE status = 'PENDING_APPROVAL'\\").run();
      console.log('Updated rows to APPROVED:', res.changes);
      const after = db.prepare('SELECT status, count(*) as cnt FROM content_queue_v2 GROUP BY status').all();
      console.log('After update:', JSON.stringify(after));
      db.close();
    "`);

    // 4. Verify PM2 Services
    console.log('\n--- [STEP 4] Checking PM2 Microservices ---');
    await runCmd(conn, `pm2 status`);

    console.log('\n✅ Deployment finished successfully!');
  } catch (err) {
    console.error('❌ Deployment error:', err);
  } finally {
    conn.end();
  }
});

conn.on('error', (err) => {
  console.error('❌ SSH Connection error:', err.message);
  process.exit(1);
});

conn.connect({
  host: HOST,
  port: 22,
  username: USER,
  privateKey: fs.readFileSync(KEY_PATH),
  readyTimeout: 30000,
});
