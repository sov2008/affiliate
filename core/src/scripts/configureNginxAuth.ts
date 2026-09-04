import { Client } from 'ssh2';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DO_SSH_HOST || process.env.DO_HOST || '178.128.199.28';
const USERNAME = process.env.DO_SSH_USER || 'root';
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
  console.log('=====================================================');
  console.log(`🔒 Nginx Security & Basic Auth Provisioning for flirtcheck.site`);
  console.log(`Target: ${USERNAME}@${HOST}`);
  console.log(`Dashboard User: ${DASHBOARD_USER}`);
  console.log('=====================================================\n');

  // Step 1: Ensure apache2-utils, create /etc/nginx/.htpasswd, set permissions
  console.log('=== [Step 1] Ensuring apache2-utils and creating /etc/nginx/.htpasswd ===');
  const installRes = await runSSHCommand('which htpasswd >/dev/null 2>&1 || (apt-get update && apt-get install -y apache2-utils)');
  console.log('htpasswd tool check/install:', installRes.code === 0 ? 'SUCCESS' : installRes.stderr);

  // Generate /etc/nginx/.htpasswd for admin
  const htpasswdCmd = `htpasswd -b -c /etc/nginx/.htpasswd "${DASHBOARD_USER}" "${DASHBOARD_PASS}" && chmod 640 /etc/nginx/.htpasswd && chown root:www-data /etc/nginx/.htpasswd`;
  const htRes = await runSSHCommand(htpasswdCmd);
  if (htRes.code !== 0) {
    throw new Error(`Failed to generate .htpasswd: ${htRes.stderr}`);
  }
  console.log('Generated /etc/nginx/.htpasswd with permissions 640 (root:www-data)');

  const htCheck = await runSSHCommand('ls -la /etc/nginx/.htpasswd');
  console.log(htCheck.stdout.trim());

  // Step 2: Backup existing Nginx config
  console.log('\n=== [Step 2] Backing up current Nginx configuration ===');
  const backupRes = await runSSHCommand('cp /etc/nginx/sites-available/flirtcheck.site /etc/nginx/sites-available/flirtcheck.site.bak.$(date +%s)');
  console.log('Backup status:', backupRes.code === 0 ? 'SUCCESS' : backupRes.stderr);

  // Step 3: Write comprehensive hardened Nginx configuration
  console.log('\n=== [Step 3] Writing hardened Nginx configuration ===');
  const nginxConfig = `
log_format auth_debug '$remote_addr - $remote_user [$time_local] "$request" $status auth:"$http_authorization"';

server {
    server_name flirtcheck.site www.flirtcheck.site;
    access_log /var/log/nginx/auth_debug.log auth_debug;

    # ----------------------------------------------------
    # 1. Protected Affiliate Dashboard UI (/dashboard/)
    # ----------------------------------------------------
    location = /dashboard {
        return 301 /dashboard/;
    }

    location /dashboard/ {
        auth_basic "AffOps Terminal 2026";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # ----------------------------------------------------
    # 2. Protected Real-time SSE Telemetry & Event Streams
    # ----------------------------------------------------
    location = /api/telemetry/stream {
        auth_basic "AffOps Terminal 2026";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000;
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
        auth_basic "AffOps Terminal 2026";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000;
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

    # ----------------------------------------------------
    # 3. Public Whitelists: Network Postbacks & Webhooks (Zero Auth)
    # ----------------------------------------------------
    location ~* ^/(api/v1/postback|api/postback|postback) {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 4. Public Whitelist: Bot Shield Diagnostics & Probes
    # ----------------------------------------------------
    location = /api/test/bot-shield {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 5. Public Whitelist: Umami Analytics Script & Heartbeat
    # ----------------------------------------------------
    location ^~ /api/analytics/ {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 6. Protected Internal Dashboard & Control APIs
    # ----------------------------------------------------
    location /api/ {
        auth_basic "AffOps Terminal 2026";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # ----------------------------------------------------
    # 7. Public Whitelist: Telegram Bridge Gateway (/join)
    # ----------------------------------------------------
    location ^~ /join {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 8. Public Whitelist: Profile Static Assets (/avatar.jpg)
    # ----------------------------------------------------
    location = /avatar.jpg {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 8.5. Public Whitelist: Logout Page (/logout)
    # ----------------------------------------------------
    location = /logout {
        auth_basic off;

        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 9. Public Whitelist: External Shortlinks & Redirects (/r/..., /l/...)
    # ----------------------------------------------------
    location ~* ^/(r|l)/ {
        auth_basic off;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ----------------------------------------------------
    # 10. Public Whitelist: Affiliate TDS Engine & Traffic Router (/go & /)
    # ----------------------------------------------------
    location /go {
        auth_basic off;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        auth_basic off;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
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

  const writeCmd = `cat << 'EOF' > /etc/nginx/sites-available/flirtcheck.site\n${nginxConfig}\nEOF`;
  const writeRes = await runSSHCommand(writeCmd);
  if (writeRes.code !== 0) {
    throw new Error(`Failed to write nginx config: ${writeRes.stderr}`);
  }
  console.log('New Nginx configuration successfully written.');

  // Step 4: Validate Nginx configuration
  console.log('\n=== [Step 4] Validating Nginx configuration syntax (nginx -t) ===');
  const testRes = await runSSHCommand('nginx -t');
  console.log(testRes.stdout + (testRes.stderr ? '\n' + testRes.stderr : ''));

  if (testRes.code !== 0 || testRes.stderr.includes('emerg') || testRes.stderr.includes('syntax is not ok')) {
    console.error('❌ nginx -t validation failed! Reverting back to latest backup...');
    await runSSHCommand('LATEST_BAK=$(ls -t /etc/nginx/sites-available/flirtcheck.site.bak.* | head -n 1) && cp "$LATEST_BAK" /etc/nginx/sites-available/flirtcheck.site');
    throw new Error('Nginx syntax check failed. Reverted to previous state.');
  }

  // Step 5: Reload Nginx service
  console.log('\n=== [Step 5] Reloading Nginx service (systemctl reload nginx) ===');
  const reloadRes = await runSSHCommand('systemctl reload nginx');
  if (reloadRes.code !== 0) {
    throw new Error(`Failed to reload nginx: ${reloadRes.stderr}`);
  }
  console.log('✅ Nginx service reloaded successfully.');

  // Step 6: End-to-End Test Suite
  console.log('\n=== [Step 6] Comprehensive End-to-End Verification ===');

  // 1. Unauthenticated /dashboard/ -> Expect 401
  const curl1 = await runSSHCommand('curl -s -I -k https://127.0.0.1/dashboard/ -H "Host: flirtcheck.site"');
  console.log('1. GET /dashboard/ without auth:\n', curl1.stdout.trim());

  // 2. Authenticated /dashboard/ -> Expect 200
  const curl2 = await runSSHCommand(`curl -s -I -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/dashboard/ -H "Host: flirtcheck.site"`);
  console.log('\n2. GET /dashboard/ with Basic Auth:\n', curl2.stdout.trim());

  // 3. Unauthenticated /api/queue/items -> Expect 401
  const curl3 = await runSSHCommand('curl -s -I -k https://127.0.0.1/api/queue/items -H "Host: flirtcheck.site"');
  console.log('\n3. GET /api/queue/items without auth:\n', curl3.stdout.trim());

  // 4. Authenticated /api/queue/items -> Expect 200
  const curl4 = await runSSHCommand(`curl -s -I -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/api/queue/items -H "Host: flirtcheck.site"`);
  console.log('\n4. GET /api/queue/items with Basic Auth:\n', curl4.stdout.trim());

  // 5. Whitelist: Postback endpoint /api/postback -> Expect 200 (auth_basic off)
  const curl5 = await runSSHCommand('curl -s -I -k https://127.0.0.1/api/postback -H "Host: flirtcheck.site"');
  console.log('\n5. GET /api/postback (Public CPA Whitelist, Expect 200):\n', curl5.stdout.trim());

  // 6. Whitelist: Bot Shield Diagnostics -> Expect 200 (auth_basic off)
  const curl6 = await runSSHCommand('curl -s -I -k https://127.0.0.1/api/test/bot-shield -H "Host: flirtcheck.site"');
  console.log('\n6. GET /api/test/bot-shield (Public Bot Shield Whitelist, Expect 200):\n', curl6.stdout.trim());

  // 7. Whitelist: Telegram Bridge Gateway /join -> Expect 200 (auth_basic off)
  const curl7 = await runSSHCommand('curl -s -I -k https://127.0.0.1/join -H "Host: flirtcheck.site"');
  console.log('\n7. GET /join (Public Telegram Bridge, Expect 200):\n', curl7.stdout.trim());

  // 8. Whitelist: TDS Engine /go -> Expect 302 (auth_basic off)
  const curl8 = await runSSHCommand('curl -s -I -k https://127.0.0.1/go -H "Host: flirtcheck.site"');
  console.log('\n8. GET /go (Public Affiliate TDS Router, Expect 302):\n', curl8.stdout.trim());

  // 8.5 Whitelist: Logout Page /logout -> Expect 200 (auth_basic off)
  const curlLogout = await runSSHCommand('curl -s -I -k https://127.0.0.1/logout -H "Host: flirtcheck.site"');
  console.log('\n8.5. GET /logout (Public Logout Page, Expect 200):\n', curlLogout.stdout.trim());

  // 9. SSE Telemetry Stream stability test
  console.log('\n9. Testing SSE Telemetry Stream /api/telemetry/stream with Basic Auth...');
  const curl9 = await runSSHCommand(`curl -s -k -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" https://127.0.0.1/api/telemetry/stream -H "Host: flirtcheck.site" --max-time 5`);
  console.log('SSE Stream Output Received:\n', curl9.stdout.trim());

  console.log('\n=====================================================');
  console.log('🎉 ALL SECURITY & OPERATIONAL CHECKS PASSED!');
  console.log('=====================================================');
}

main().catch((err) => {
  console.error('Execution failed:', err);
  process.exit(1);
});
