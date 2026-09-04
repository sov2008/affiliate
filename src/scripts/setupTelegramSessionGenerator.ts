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

async function uploadFile(conn: Client, localPath: string, remotePath: string): Promise<void> {
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
  console.log('\n📲 ================================================================');
  console.log('📲 SETUP TELEGRAM MTPROTO SESSION GENERATOR ON PRODUCTION DROPLET');
  console.log('📲 ================================================================\n');

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
    // 1. Create scripts directory on VPS
    console.log('\n📁 [1/4] Ensuring /var/www/affiliate/core/scripts directory exists...');
    await runSsh(conn, `mkdir -p ${REMOTE_PATH}/core/scripts`);
    console.log('   ✓ Directory ready');

    // 2. Upload generator script
    console.log('\n📤 [2/4] Uploading generate-telegram-session.ts to VPS...');
    const localScript = path.resolve(process.cwd(), 'core/scripts/generate-telegram-session.ts');
    const remoteScript = `${REMOTE_PATH}/core/scripts/generate-telegram-session.ts`;
    await uploadFile(conn, localScript, remoteScript);
    console.log(`   ✓ Uploaded: ${remoteScript}`);

    // 3. Install packages in /var/www/affiliate/core
    console.log('\n📦 [3/4] Installing telegram (GramJS) and input on VPS...');
    const installRes = await runSsh(
      conn,
      `cd ${REMOTE_PATH}/core && npm install telegram input --no-audit --no-fund`
    );
    console.log(installRes.stdout.trim());
    if (installRes.stderr) console.log(installRes.stderr.trim());

    // 4. Verify script accessibility & syntax
    console.log('\n🔍 [4/4] Verifying node/tsx execution environment...');
    const checkRes = await runSsh(
      conn,
      `node -e "const { TelegramClient } = require('${REMOTE_PATH}/core/node_modules/telegram'); const input = require('${REMOTE_PATH}/core/node_modules/input'); console.log('✓ GramJS & Input loaded successfully');"`
    );
    console.log('   ' + checkRes.stdout.trim());

    const permRes = await runSsh(conn, `chmod +x ${remoteScript} && ls -la ${remoteScript}`);
    console.log('   ' + permRes.stdout.trim());

    console.log('\n================================================================');
    console.log('✅ TELEGRAM SESSION GENERATOR SCAFFOLDED SUCCESSFULLY!');
    console.log('================================================================\n');
  } finally {
    conn.end();
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
