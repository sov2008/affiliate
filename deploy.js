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

    // 2. Build Core & Production Blog
    console.log('\n--- [STEP 2] Building Production Core & Blog (Astro) ---');
    await runCmd(conn, `cd ${APP_DIR} && npm --prefix core run build && npm run build:blog`);

    // 3. Reload PM2 Services with updated code
    console.log('\n--- [STEP 3] Reloading PM2 Microservices ---');
    await runCmd(conn, `cd ${APP_DIR} && (pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js)`);

    // 4. Check and Update Queue Status & Comments Schema in SQLite on Production
    console.log('\n--- [STEP 4] Updating & Verifying SQLite Schema & Queue on Production ---');
    await runCmd(conn, `cd ${APP_DIR} && node scripts/verify-server-schema.cjs`);

    // 4.1. Ensure Nginx configuration allows public /api/comments/ without basic auth
    console.log('\n--- [STEP 4.1] Ensuring Nginx Public Whitelist for /api/comments ---');
    await runCmd(conn, `
      if ! grep -q "location ^~ /api/comments/" /etc/nginx/sites-available/flirtcheck.site 2>/dev/null; then
        echo "Adding /api/comments/ to Nginx...";
        sed -i '/location \\/api\\/ {/i \\    location ^~ /api/comments/ {\\n        auth_basic off;\\n        proxy_pass http://127.0.0.1:5000;\\n        proxy_http_version 1.1;\\n        proxy_set_header Host $host;\\n        proxy_set_header X-Real-IP $remote_addr;\\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\\n        proxy_set_header X-Forwarded-Proto $scheme;\\n    }\\n\\n    location = /api/comments {\\n        auth_basic off;\\n        proxy_pass http://127.0.0.1:5000;\\n        proxy_http_version 1.1;\\n        proxy_set_header Host $host;\\n        proxy_set_header X-Real-IP $remote_addr;\\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\\n        proxy_set_header X-Forwarded-Proto $scheme;\\n    }\\n' /etc/nginx/sites-available/flirtcheck.site && nginx -t && systemctl reload nginx;
      else
        echo "✅ Nginx /api/comments location already configured.";
      fi
    `);

    // 5. Verify PM2 Services
    console.log('\n--- [STEP 5] Checking PM2 Microservices ---');
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
