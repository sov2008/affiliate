import { generateTechHudAvatar } from './generateAvatar.js';
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

async function main() {
  console.log('\n🎨 ================================================================');
  console.log('🎨 TECH HUD AVATAR GENERATION & PRODUCTION PUBLISH');
  console.log('🎨 ================================================================\n');

  const localPublicDir = path.resolve(process.cwd(), 'public');
  const localAvatarPath = path.join(localPublicDir, 'avatar.jpg');
  const coreSrcPublicAvatar = path.resolve(process.cwd(), 'core/src/public/avatar.jpg');
  const coreDistPublicAvatar = path.resolve(process.cwd(), 'core/dist/public/avatar.jpg');

  // 1. Generate Avatar
  console.log('🖼️  [1/4] Generating 400x400 Tech HUD Avatar...');
  const { sizeBytes, path: generatedPath } = await generateTechHudAvatar(localAvatarPath);
  const sizeKb = (sizeBytes / 1024).toFixed(2);
  console.log(`   ✓ Generated successfully: ${generatedPath}`);
  console.log(`   ✓ Image Size: ${sizeKb} KB (${sizeBytes} bytes)`);

  if (sizeBytes < 40 * 1024 || sizeBytes > 200 * 1024) {
    throw new Error(`Avatar size ${sizeKb} KB is outside required 40KB - 200KB bounds!`);
  }
  console.log('   ✓ Size validation: PASSED (strictly between 40KB and 200KB)');

  // Copy to core public paths
  for (const target of [coreSrcPublicAvatar, coreDistPublicAvatar]) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(localAvatarPath, target);
  }

  // 2. Connect to droplet via SSH/SFTP
  console.log('\n📡 [2/4] Uploading avatar to production droplet via SFTP...');
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
    const sftp = await new Promise<any>((resolve, reject) => {
      conn.sftp((err, s) => {
        if (err) return reject(err);
        resolve(s);
      });
    });

    // Ensure remote dirs exist
    const remoteDirs = [
      `${REMOTE_PATH}/dist/public`,
      `${REMOTE_PATH}/core/dist/public`,
      `${REMOTE_PATH}/core/src/public`,
    ];

    for (const rd of remoteDirs) {
      await new Promise<void>((res) => {
        conn.exec(`mkdir -p ${rd}`, () => res());
      });
    }

    // Upload to target locations
    const uploadTargets = [
      `${REMOTE_PATH}/dist/public/avatar.jpg`,
      `${REMOTE_PATH}/core/dist/public/avatar.jpg`,
      `${REMOTE_PATH}/core/src/public/avatar.jpg`,
    ];

    const buffer = fs.readFileSync(localAvatarPath);
    for (const target of uploadTargets) {
      await new Promise<void>((resolve, reject) => {
        const stream = sftp.createWriteStream(target);
        stream.on('close', () => {
          console.log(`   ✓ Uploaded: ${target}`);
          resolve();
        });
        stream.on('error', (err: any) => reject(err));
        stream.end(buffer);
      });
    }

    sftp.end();

    // 3. Restart PM2 dashboard
    console.log('\n🔄 [3/4] Reloading PM2 dashboard on server...');
    await new Promise<void>((resolve) => {
      conn.exec('pm2 restart affiliate-dashboard --update-env', (err, stream) => {
        stream.on('close', () => resolve());
      });
    });
    console.log('   ✓ affiliate-dashboard restarted');

    // Wait 3 seconds for server to be responsive
    await new Promise((r) => setTimeout(r, 3000));

    // 4. Verify Live HTTP Endpoint
    console.log('\n🌐 [4/4] Verifying live endpoint: http://178.128.199.28:5000/avatar.jpg ...');
    const avatarUrl = 'http://178.128.199.28:5000/avatar.jpg';
    const resp = await fetch(avatarUrl);
    console.log(`   ✓ HTTP Status: ${resp.status} ${resp.statusText}`);
    console.log(`   ✓ Content-Type: ${resp.headers.get('content-type')}`);
    const arrayBuffer = await resp.arrayBuffer();
    const downloadedSizeKb = (arrayBuffer.byteLength / 1024).toFixed(2);
    console.log(`   ✓ Downloaded Payload Size: ${downloadedSizeKb} KB (${arrayBuffer.byteLength} bytes)`);

    if (resp.status === 200 && arrayBuffer.byteLength >= 40 * 1024 && arrayBuffer.byteLength <= 200 * 1024) {
      console.log('\n================================================================');
      console.log('🎉 AVATAR GENERATION & DEPLOYMENT COMPLETE!');
      console.log(`📥 Direct Download URL: ${avatarUrl}`);
      console.log('================================================================\n');
    } else {
      throw new Error(`Endpoint verification failed: status=${resp.status}, size=${downloadedSizeKb}KB`);
    }
  } finally {
    conn.end();
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
