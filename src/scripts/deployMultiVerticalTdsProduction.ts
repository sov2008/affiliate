import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_PATH = '/var/www/affiliate';

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const MATRIX_ENV = {
  LOSPOLLOS_DATING_URL: 'https://yex2brk.chemistrydrivensmile.org/rp1pd38',
  LOSPOLLOS_CASUAL_URL: 'https://yex2brk.engagingdating.org/rpupd31',
  LOSPOLLOS_CAMS_URL: 'https://yex2brk.yearningcompanion.org/rpvpd31',
  LOSPOLLOS_GAMES_URL: 'https://yex2brk.realmessaging.org/rpqpd3w',
  LOSPOLLOS_TIKTOK_URL: 'https://yex2brk.honestpairing.org/rpvpd3t',
};

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

async function deployMultiVerticalTds() {
  console.log('\n🧭 ================================================================');
  console.log('🧭 DEPLOY MULTI-VERTICAL TDS ROUTING MATRIX TO PRODUCTION');
  console.log('🧭 ================================================================\n');

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
    // 1. Update Remote .env Files with TDS Matrix
    console.log('\n📝 [1/4] Injecting Multi-Vertical TDS URLs into remote .env files...');
    const matrixJson = JSON.stringify(MATRIX_ENV);
    const injectScript = `
node -e '
const fs = require("fs");
const files = ["${REMOTE_PATH}/core/.env", "${REMOTE_PATH}/.env"];
const matrix = ${matrixJson};

files.forEach(f => {
  if (fs.existsSync(f)) {
    let lines = fs.readFileSync(f, "utf8").split("\\n");
    const keys = Object.keys(matrix);
    lines = lines.filter(l => !keys.some(k => l.startsWith(k + "=")));
    for (const [k, v] of Object.entries(matrix)) {
      lines.push(k + "=\\"" + v + "\\"");
    }
    fs.writeFileSync(f, lines.join("\\n"), "utf8");
    console.log("Updated TDS Matrix in: " + f);
  }
});
'
chmod 600 ${REMOTE_PATH}/core/.env ${REMOTE_PATH}/.env
ls -la ${REMOTE_PATH}/core/.env
`;
    const resInject = await runSsh(conn, injectScript);
    console.log(resInject.stdout.trim());

    // 2. Restart PM2 processes with updated environment
    console.log('\n🔄 [2/4] Restarting affiliate-telegram-bot and affiliate-scheduler...');
    const resRestart = await runSsh(
      conn,
      'pm2 restart affiliate-telegram-bot affiliate-scheduler --update-env'
    );
    console.log(resRestart.stdout.trim());

    // 3. Dispatch Telegram Confirmation Alert to Admin
    console.log('\n📨 [3/4] Dispatching TDS Matrix activation alert to Telegram Admin...');
    const alertMessage = `
🧭 <b>Multi-Vertical TDS Matrix Activated!</b>
━━━━━━━━━━━━━━━━━━
⚙️ <b>Services Updated:</b> affiliate-telegram-bot, affiliate-scheduler
🌐 <b>Host:</b> 178.128.199.28 (PM2 cluster)

📋 <b>Active TDS Vertical Matrix:</b>
• <b>TikTok Tag (tt_*):</b> <code>${MATRIX_ENV.LOSPOLLOS_TIKTOK_URL}</code>
• <b>Cams / Virtual:</b> <code>${MATRIX_ENV.LOSPOLLOS_CAMS_URL}</code>
• <b>Interactive Fun / Games (18-25):</b> <code>${MATRIX_ENV.LOSPOLLOS_GAMES_URL}</code>
• <b>Casual Flirt:</b> <code>${MATRIX_ENV.LOSPOLLOS_CASUAL_URL}</code>
• <b>Serious / Default Dating:</b> <code>${MATRIX_ENV.LOSPOLLOS_DATING_URL}</code>

🔗 <b>Uniform Tracking Param Scheme:</b>
<code>{targetUrl}?sub1={source}&sub2={tg_user_id}&cid={clickId}</code>

🔘 <b>Quiz Funnel:</b>
• Q1: Age range (18-25, 26-35, 36+)
• Q2: Intent (Serious, Casual Flirt, Virtual / Cams, Interactive Fun)
• CTA: "🔥 View Matches Now 👈"
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
    console.log('✅ MULTI-VERTICAL TDS MATRIX DEPLOYMENT COMPLETE!');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

deployMultiVerticalTds().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
