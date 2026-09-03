import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_PATH = '/var/www/affiliate';

const BOT_TOKEN = '8669077256:AAEm7FHXpxwwu30fizEKanERQpTM74xOsso';
const ADMIN_CHAT_ID = '808343978';
const BOT_USERNAME = 'local_match_filter_bot';

function runSshCommand(conn: Client, cmd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('data', (d: Buffer) => {
        stdout += d.toString();
      });
      stream.stderr.on('data', (d: Buffer) => {
        stderr += d.toString();
      });
      stream.on('close', (code: number) => {
        resolve({ stdout, stderr, code });
      });
    });
  });
}

async function bindTelegramProduction() {
  console.log('\n🚀 ================================================================');
  console.log('🚀 BIND TELEGRAM BOT TO PRODUCTION DROPLET');
  console.log('🚀 ================================================================\n');

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
    // 1. Update /var/www/affiliate/.env and /var/www/affiliate/core/.env on droplet
    console.log('\n📝 [1/4] Updating environment files on droplet...');
    const updateEnvScript = `
node -e '
const fs = require("fs");
const files = ["${REMOTE_PATH}/.env", "${REMOTE_PATH}/core/.env"];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, "utf8");
    // Strip existing telegram lines
    content = content.split("\\n").filter(l => !l.startsWith("TELEGRAM_") && !l.startsWith("ADMIN_CHAT_ID") && !l.startsWith("BOT_USERNAME")).join("\\n");
    content += "\\nTELEGRAM_BOT_TOKEN=\\"${BOT_TOKEN}\\"\\nADMIN_CHAT_ID=\\"${ADMIN_CHAT_ID}\\"\\nTELEGRAM_CHAT_ID=\\"${ADMIN_CHAT_ID}\\"\\nTELEGRAM_BOT_USERNAME=\\"${BOT_USERNAME}\\"\\nBOT_USERNAME=\\"${BOT_USERNAME}\\"\\n";
    fs.writeFileSync(f, content, "utf8");
    console.log("Updated: " + f);
  }
});
'
`;
    const resUpdate = await runSshCommand(conn, updateEnvScript);
    console.log(resUpdate.stdout.trim());

    // 2. Restart PM2 processes
    console.log('\n🔄 [2/4] Restarting PM2 processes (affiliate-telegram-bot, affiliate-scheduler)...');
    const resRestart = await runSshCommand(
      conn,
      `pm2 restart affiliate-telegram-bot affiliate-scheduler --update-env`
    );
    console.log(resRestart.stdout.trim());

    // Wait 3s for bot polling loop to initialize
    await new Promise((r) => setTimeout(r, 3000));

    // 3. Inspect PM2 logs
    console.log('\n📋 [3/4] Fetching latest PM2 logs for affiliate-telegram-bot...');
    const resLogs = await runSshCommand(conn, `pm2 logs affiliate-telegram-bot --lines 20 --nostream`);
    console.log(resLogs.stdout.trim());

    // 4. Dispatch Direct Verification Message
    console.log('\n📤 [4/4] Dispatching verification message via Telegram API...');
    const testMessage = `🚀 <b>Antigravity Affiliate Core Activated!</b>\n\nSystem online on droplet 178.128.199.28. Realtime Reddit/Quora alerts & quiz flow connected.`;
    
    // First verify getMe
    const getMeRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const getMeJson = await getMeRes.json();
    console.log('🤖 Telegram getMe Result:', JSON.stringify(getMeJson));

    // Send message to ADMIN_CHAT_ID
    const sendRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text: testMessage,
        parse_mode: 'HTML',
      }),
    });

    const sendJson = await sendRes.json();
    console.log('📨 Telegram sendMessage Result:', JSON.stringify(sendJson));

    console.log('\n================================================================');
    if (sendJson.ok) {
      console.log('✅ TELEGRAM PRODUCTION BINDING COMPLETE AND VERIFIED!');
    } else {
      console.error('❌ SEND MESSAGE FAILED:', sendJson.description);
    }
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

bindTelegramProduction().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
