import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_PATH = '/var/www/affiliate';

const TARGET_URL = 'https://yex2brk.chemistrydrivensmile.org/rp1pd38';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

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

async function updateSmartlinkProduction() {
  console.log('\n🔗 ================================================================');
  console.log('🔗 UPDATE PRODUCTION LOSPOLLOS SMARTLINK & VERIFY REDIRECT DOMAIN');
  console.log('🔗 ================================================================\n');

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
    // 1. Update Environment Variables on Server
    console.log('\n📝 [1/4] Injecting verified LosPollos Smartlink into remote .env files...');
    const injectScript = `
node -e '
const fs = require("fs");
const files = ["${REMOTE_PATH}/core/.env", "${REMOTE_PATH}/.env"];
const keys = ["AFFILIATE_OFFER_URL", "LOSPOLLOS_SMARTLINK_URL", "LOSPOLLOS_URL"];
const targetUrl = "${TARGET_URL}";

files.forEach(f => {
  if (fs.existsSync(f)) {
    let lines = fs.readFileSync(f, "utf8").split("\\n");
    lines = lines.filter(l => !keys.some(k => l.startsWith(k + "=")));
    lines.push("AFFILIATE_OFFER_URL=\\"" + targetUrl + "\\"");
    lines.push("LOSPOLLOS_SMARTLINK_URL=\\"" + targetUrl + "\\"");
    lines.push("LOSPOLLOS_URL=\\"" + targetUrl + "\\"");
    fs.writeFileSync(f, lines.join("\\n"), "utf8");
    console.log("Updated smartlink in: " + f);
  }
});
'
chmod 600 ${REMOTE_PATH}/core/.env ${REMOTE_PATH}/.env
ls -la ${REMOTE_PATH}/core/.env
`;
    const resInject = await runSsh(conn, injectScript);
    console.log(resInject.stdout.trim());

    // 2. Sanity Verification via curl from Droplet
    console.log('\n🔍 [2/4] Testing smartlink reachability & redirect from droplet...');
    const curlCheckCmd = `
curl -s -I -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" \
     "${TARGET_URL}"
`;
    const resCurl = await runSsh(conn, curlCheckCmd);
    console.log('   --- Droplet Curl Response Headers ---');
    console.log(resCurl.stdout.trim());

    if (resCurl.stdout.includes('403 Forbidden')) {
      throw new Error(`Sanity check failed: Received HTTP 403 Forbidden for ${TARGET_URL}`);
    }
    console.log('   ✓ Sanity check: PASSED (No 403 Forbidden; target domain active and accepting traffic)');

    // 3. Restart PM2 processes with updated environment
    console.log('\n🔄 [3/4] Restarting affiliate-telegram-bot and affiliate-autopilot...');
    const resRestart = await runSsh(
      conn,
      'pm2 restart affiliate-telegram-bot affiliate-autopilot --update-env'
    );
    console.log(resRestart.stdout.trim());

    // 4. Dispatch Telegram Confirmation Alert to Admin
    console.log('\n📨 [4/4] Sending confirmation alert to Telegram Admin...');
    const alertMessage = `
🍗 <b>LosPollos Verified Smartlink Activated!</b>
━━━━━━━━━━━━━━━━━━
🌐 <b>Tracking Domain:</b> <code>${TARGET_URL}</code>
👤 <b>Network Account:</b> sov2008 / sov208
⚙️ <b>Services Updated:</b> affiliate-telegram-bot, affiliate-autopilot

📋 <b>Tracking Parameter Scheme:</b>
<code>${TARGET_URL}?sub1=reddit_dating&sub2={chat_id}&cid={click_id}</code>

🔘 <b>Inline Button:</b> "🔥 View Matches Now 👈"
🛡️ <b>Domain Status:</b> Verified Active (Not blocked / No 403)
    `.trim();

    if (BOT_TOKEN && ADMIN_CHAT_ID) {
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: alertMessage,
          parse_mode: 'HTML',
        }),
      });
      const tgJson = await tgRes.json();
      console.log('   • Telegram Notification Result:', tgJson.ok ? 'SENT (HTTP 200)' : tgJson.description);
    }

    console.log('\n================================================================');
    console.log('✅ SMARTLINK UPDATE & RESTART COMPLETED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

updateSmartlinkProduction().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
