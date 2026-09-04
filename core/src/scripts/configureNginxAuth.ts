import { Client } from 'ssh2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = '178.128.199.28';
const USERNAME = 'root';
const PASSWORD = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const DASHBOARD_USER = process.env.DASHBOARD_USER || 'admin';
const DASHBOARD_PASS = process.env.DASHBOARD_PASS || 'AffOps_Secure_k9P2w8Nx7Q4m';

function runSSHCommand(cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn
      .on('ready', () => {
        conn.exec(cmd, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }
          let stdout = '';
          let stderr = '';
          stream
            .on('close', (code: number) => {
              conn.end();
              resolve({ stdout, stderr, code });
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString();
            });
        });
      })
      .on('error', (err) => reject(err))
      .connect({
        host: HOST,
        port: 22,
        username: USERNAME,
        password: PASSWORD,
      });
  });
}

async function main() {
  console.log('=== Step 1: Ensure apache2-utils and create /etc/nginx/.htpasswd ===');
  const installRes = await runSSHCommand('which htpasswd || apt-get update && apt-get install -y apache2-utils');
  console.log('htpasswd check/install:', installRes.stdout.slice(0, 150));

  // Generate /etc/nginx/.htpasswd
  // Use htpasswd -bc to create/overwrite
  const htpasswdCmd = `htpasswd -b -c /etc/nginx/.htpasswd "${DASHBOARD_USER}" "${DASHBOARD_PASS}" && chmod 640 /etc/nginx/.htpasswd && chown root:www-data /etc/nginx/.htpasswd`;
  const htRes = await runSSHCommand(htpasswdCmd);
  console.log('Created .htpasswd:', htRes.stderr || 'OK');

  const htCheck = await runSSHCommand('ls -la /etc/nginx/.htpasswd && cat /etc/nginx/.htpasswd');
  console.log('htpasswd info:\n', htCheck.stdout);

  console.log('=== Step 2: Backup existing Nginx config ===');
  await runSSHCommand('cp /etc/nginx/sites-available/flirtcheck.site /etc/nginx/sites-available/flirtcheck.site.bak.$(date +%s)');

  console.log('=== Step 3: Write hardened Nginx config ===');
  const newConfig = `server {
    server_name flirtcheck.site www.flirtcheck.site;

    # 1. Affiliate Dashboard UI (Protected by HTTP Basic Auth)
    location = /dashboard {
        return 301 /dashboard/;
    }

    location /dashboard/ {
        auth_basic "AffOps NOC Access Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 2. Public Whitelist: Bot Shield Diagnostics & Probes (auth_basic off)
    location = /api/test/bot-shield {
        auth_basic off;
        proxy_pass http://127.0.0.1:5000/api/test/bot-shield;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. Public Whitelist: Umami Analytics Script & Heartbeat (auth_basic off)
    location ^~ /api/analytics/ {
        auth_basic off;
        proxy_pass http://127.0.0.1:5000/api/analytics/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 4. SSE Telemetry Streams (Protected by HTTP Basic Auth, Buffering OFF, Keep-Alive 86400s)
    location = /api/telemetry/stream {
        auth_basic "AffOps NOC Access Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000/api/telemetry/stream;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    location = /events {
        auth_basic "AffOps NOC Access Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000/events;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 5. Protected Dashboard APIs (Requires Basic Auth)
    location /api/ {
        auth_basic "AffOps NOC Access Restricted";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # 6. Public Avatar & Assets
    location /avatar.jpg {
        auth_basic off;
        proxy_pass http://127.0.0.1:5000/avatar.jpg;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 7. Public Affiliate TDS Engine (Routing & Smartlink Redirects)
    location /go {
        auth_basic off;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 8. Public Root: traffic distribution through TDS
    location / {
        auth_basic off;
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/flirtcheck.site/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/flirtcheck.site/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.flirtcheck.site) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = flirtcheck.site) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name flirtcheck.site www.flirtcheck.site;
    return 404; # managed by Certbot
}
`;

  // Write new config to /tmp/flirtcheck.site and move to /etc/nginx/sites-available/flirtcheck.site
  const writeCmd = `cat << 'EOF' > /etc/nginx/sites-available/flirtcheck.site\n${newConfig}\nEOF`;
  const writeRes = await runSSHCommand(writeCmd);
  console.log('Config written:', writeRes.code === 0 ? 'SUCCESS' : writeRes.stderr);

  console.log('=== Step 4: Validate Nginx configuration ===');
  const testRes = await runSSHCommand('nginx -t');
  console.log('nginx -t result:\n', testRes.stdout, testRes.stderr);

  if (testRes.code !== 0) {
    console.error('❌ nginx -t failed! Reverting...');
    await runSSHCommand('cp /etc/nginx/sites-available/flirtcheck.site.bak.* /etc/nginx/sites-available/flirtcheck.site');
    return;
  }

  console.log('=== Step 5: Reload Nginx service ===');
  const reloadRes = await runSSHCommand('systemctl reload nginx');
  console.log('nginx reload:', reloadRes.code === 0 ? 'SUCCESS' : reloadRes.stderr);

  console.log('=== Step 6: Verify Endpoints ===');
  // 1. Unauthenticated /dashboard/ -> Expect 401
  const curlUnauth = await runSSHCommand('curl -s -I -k https://127.0.0.1/dashboard/ -H "Host: flirtcheck.site"');
  console.log('--- Unauth /dashboard/ (Expect 401) ---\n', curlUnauth.stdout);

  // 2. Authenticated /dashboard/ -> Expect 200
  const curlAuth = await runSSHCommand(`curl -s -I -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/dashboard/ -H "Host: flirtcheck.site"`);
  console.log('--- Auth /dashboard/ (Expect 200) ---\n', curlAuth.stdout);

  // 3. Unauth /api/queue/items -> Expect 401
  const curlApiUnauth = await runSSHCommand('curl -s -I -k https://127.0.0.1/api/queue/items -H "Host: flirtcheck.site"');
  console.log('--- Unauth /api/queue/items (Expect 401) ---\n', curlApiUnauth.stdout);

  // 4. Auth /api/queue/items -> Expect 200
  const curlApiAuth = await runSSHCommand(`curl -s -I -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/api/queue/items -H "Host: flirtcheck.site"`);
  console.log('--- Auth /api/queue/items (Expect 200) ---\n', curlApiAuth.stdout);

  // 5. Whitelist test: /api/test/bot-shield -> Expect 200 without auth
  const curlShield = await runSSHCommand('curl -s -I -k https://127.0.0.1/api/test/bot-shield -H "Host: flirtcheck.site"');
  console.log('--- Public Whitelist /api/test/bot-shield (Expect 200) ---\n', curlShield.stdout);

  // 6. Whitelist test: /go -> Expect TDS response without auth
  const curlTds = await runSSHCommand('curl -s -I -k https://127.0.0.1/go -H "Host: flirtcheck.site"');
  console.log('--- Public TDS /go (Expect 200/302) ---\n', curlTds.stdout);

  // 7. SSE Telemetry stream test
  console.log('--- Testing SSE /api/telemetry/stream connection ---');
  const sseTest = await runSSHCommand(`curl -s -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/api/telemetry/stream -H "Host: flirtcheck.site" --max-time 4`);
  console.log('SSE stream initial output:\n', sseTest.stdout);
}

main().catch(console.error);
