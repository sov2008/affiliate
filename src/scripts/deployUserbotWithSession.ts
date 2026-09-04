import { Client } from 'ssh2';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'core/.env') });

const HOST = process.env.DEPLOY_HOST || '178.128.199.28';
const USER = process.env.DEPLOY_USER || 'root';
const PASS = process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8';
const REMOTE_PATH = '/var/www/affiliate';

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '808343978';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const USER_SESSION = process.env.TELEGRAM_USER_SESSION || '';

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

function uploadFile(conn: Client, localPath: string, remotePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => resolve());
      writeStream.on('error', (e) => reject(e));
      readStream.pipe(writeStream);
    });
  });
}

async function main() {
  console.log('\n🚀 ================================================================');
  console.log('🚀 SYNC TELEGRAM MTPROTO SESSION & DEPLOY USERBOT SERVICE');
  console.log('🚀 ================================================================\n');

  if (!USER_SESSION) {
    console.error('❌ TELEGRAM_USER_SESSION not found in local .env!');
    process.exit(1);
  }

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
    // 1. Sync TELEGRAM_USER_SESSION to remote .env files
    console.log('\n📝 [1/5] Injecting TELEGRAM_USER_SESSION into remote .env files...');
    const sessionPayload = JSON.stringify(USER_SESSION);
    const injectScript = `
node -e '
const fs = require("fs");
const files = ["${REMOTE_PATH}/core/.env", "${REMOTE_PATH}/.env"];
const session = ${sessionPayload};

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, "utf8");
    const regex = /^TELEGRAM_USER_SESSION=.*$/m;
    const newLine = "TELEGRAM_USER_SESSION=\\"" + session + "\\"";
    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content = content.trimEnd() + "\\n" + newLine + "\\n";
    }
    fs.writeFileSync(f, content, "utf8");
    console.log("Injected session into: " + f);
  }
});
'
chmod 600 ${REMOTE_PATH}/core/.env ${REMOTE_PATH}/.env
ls -la ${REMOTE_PATH}/core/.env
`;
    const resInject = await runSsh(conn, injectScript);
    console.log(resInject.stdout.trim());

    // 2. Upload latest compiled userbot files
    console.log('\n📤 [2/5] Uploading compiled userbot service to VPS...');
    const localDist = path.resolve(process.cwd(), 'core/dist/services/telegram-userbot.service.js');
    const remoteDist = `${REMOTE_PATH}/core/dist/services/telegram-userbot.service.js`;
    await uploadFile(conn, localDist, remoteDist);
    console.log(`   ✓ Uploaded: ${remoteDist}`);

    const localSrc = path.resolve(process.cwd(), 'core/src/services/telegram-userbot.service.ts');
    const remoteSrc = `${REMOTE_PATH}/core/src/services/telegram-userbot.service.ts`;
    await uploadFile(conn, localSrc, remoteSrc);
    console.log(`   ✓ Uploaded: ${remoteSrc}`);

    // 3. Restart PM2 with updated environment
    console.log('\n🔄 [3/5] Starting / Restarting affiliate-telegram-userbot in PM2...');
    const resPm2 = await runSsh(
      conn,
      `cd ${REMOTE_PATH} && pm2 restart affiliate-telegram-userbot --update-env 2>&1 || pm2 start core/dist/services/telegram-userbot.service.js --name "affiliate-telegram-userbot" --max-memory-restart 100M --update-env`
    );
    console.log(resPm2.stdout.trim());

    await runSsh(conn, 'pm2 save');
    console.log('   ✓ PM2 state persisted (pm2 save)');

    // 4. Verify PM2 status of userbot
    console.log('\n📊 [4/5] Inspecting PM2 status for affiliate-telegram-userbot...');
    const resStatus = await runSsh(conn, 'pm2 describe affiliate-telegram-userbot');
    console.log(resStatus.stdout.trim());

    // 5. Send Telegram confirmation alert
    console.log('\n📨 [5/5] Sending completion notification to Admin Telegram...');
    const alertMessage = `
🤖 <b>Telegram MTProto Userbot Activated!</b>
━━━━━━━━━━━━━━━━━━
⚙️ <b>Service:</b> <code>affiliate-telegram-userbot</code> (PM2)
👤 <b>Client Account:</b> @RealJastInCase (User ID: <code>808343978</code>)
🛡️ <b>Defensive Filters:</b> Ignore bots, channels, self-messages
⏱️ <b>Flood Protection:</b> 120s cooldown per peer ID
🔗 <b>Traffic Routing:</b> Dynamic SubID link via OfferRoutingService
⚡ <b>Status:</b> ONLINE
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
    console.log('✅ USERBOT SYNC AND ACTIVATION COMPLETE!');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
