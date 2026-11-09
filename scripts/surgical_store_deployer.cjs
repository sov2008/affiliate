/**
 * Surgical Fast Publisher for PromoRadar
 * Recompiles ONLY the specified store and its /go/ redirect,
 * then uploads directly to the live production server via SFTP in seconds.
 * 
 * Usage:
 *   node scripts/surgical_store_deployer.cjs <store-slug>
 * Example:
 *   node scripts/surgical_store_deployer.cjs surfshark
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const SSH_CONFIG = {
  host: process.env.PROD_SERVER_IP || '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.PROD_SERVER_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8',
  readyTimeout: 30000
};

const STORE_SLUG = process.argv[2]?.trim().toLowerCase();

if (!STORE_SLUG) {
  console.error('❌ Error: Please provide store slug. Example: node scripts/surgical_store_deployer.cjs surfshark');
  process.exit(1);
}

async function runSurgicalDeploy() {
  console.log(`\n⚡ [Surgical Deployer] Starting fast build for store: [${STORE_SLUG}]...`);
  const startTime = Date.now();

  // 1. Run surgical Astro build
  try {
    execSync('npx astro build', {
      cwd: path.resolve(__dirname, '../deals-portal'),
      env: { ...process.env, SURGICAL_STORE: STORE_SLUG },
      stdio: 'inherit'
    });
  } catch (err) {
    console.error('❌ Surgical Astro build failed:', err.message);
    process.exit(1);
  }

  // 2. Post-build CSS injection for newly generated HTML files
  try {
    execSync(`node ../scripts/postbuild_inject_css.cjs .`, {
      cwd: path.resolve(__dirname, '../deals-portal'),
      stdio: 'pipe'
    });
  } catch (cssErr) {
    console.warn('⚠️ CSS injection warning:', cssErr.message);
  }

  const storeHtmlPath = path.resolve(__dirname, `../deals-portal/dist/stores/${STORE_SLUG}/index.html`);
  const storeLegacyHtmlPath = path.resolve(__dirname, `../deals-portal/dist/store/${STORE_SLUG}/index.html`);
  const goHtmlPath = path.resolve(__dirname, `../deals-portal/dist/go/${STORE_SLUG}/index.html`);

  if (!fs.existsSync(storeHtmlPath)) {
    console.error(`❌ Store HTML was not generated at: ${storeHtmlPath}`);
    process.exit(1);
  }

  console.log(`\n📦 [Surgical Deployer] Generated artifacts:`);
  console.log(`   - /stores/${STORE_SLUG}/index.html (${fs.statSync(storeHtmlPath).size} bytes)`);
  if (fs.existsSync(goHtmlPath)) {
    console.log(`   - /go/${STORE_SLUG}/index.html (${fs.statSync(goHtmlPath).size} bytes)`);
  }

  // 3. Connect via SSH/SFTP and upload files to the live release
  console.log(`\n📡 [Surgical Deployer] Connecting to production (${SSH_CONFIG.host})...`);
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject).connect(SSH_CONFIG);
  });

  const sftp = await new Promise((resolve, reject) => {
    conn.sftp((err, sftpInstance) => {
      if (err) reject(err);
      else resolve(sftpInstance);
    });
  });

  // Ensure remote directories exist
  const remoteStoreDir = `/var/www/promoradar.store/current/stores/${STORE_SLUG}`;
  const remoteStoreLegacyDir = `/var/www/promoradar.store/current/store/${STORE_SLUG}`;
  const remoteGoDir = `/var/www/promoradar.store/current/go/${STORE_SLUG}`;

  await new Promise(res => conn.exec(`mkdir -p ${remoteStoreDir} ${remoteStoreLegacyDir} ${remoteGoDir}`, () => res()));

  // Fast upload files
  console.log(`🚀 [Surgical Deployer] Uploading updated HTML files to live server...`);
  await fastUpload(sftp, storeHtmlPath, `${remoteStoreDir}/index.html`);
  if (fs.existsSync(storeLegacyHtmlPath)) {
    await fastUpload(sftp, storeLegacyHtmlPath, `${remoteStoreLegacyDir}/index.html`);
  }
  if (fs.existsSync(goHtmlPath)) {
    await fastUpload(sftp, goHtmlPath, `${remoteGoDir}/index.html`);
  }

  console.log(`✅ [Surgical Deployer] Live HTML files updated on production!`);

  // 4. Ping IndexNow for the specific new/updated store
  try {
    const { pingIndexNow } = require('./seo_index_pinger.cjs');
    console.log(`📡 [Surgical Deployer] Notifying search engines via IndexNow...`);
    const https = require('https');
    const data = JSON.stringify({
      host: 'promoradar.store',
      key: 'e2d6b384a51e44f8b03046f890cf51a2',
      keyLocation: 'https://promoradar.store/e2d6b384a51e44f8b03046f890cf51a2.txt',
      urlList: [
        `https://promoradar.store/stores/${STORE_SLUG}/`,
        `https://promoradar.store/store/${STORE_SLUG}/`
      ]
    });
    const req = https.request('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      console.log(`✅ [IndexNow] Single store ping status: ${res.statusCode}`);
    });
    req.on('error', err => console.warn('IndexNow note:', err.message));
    req.write(data);
    req.end();
  } catch (err) {
    console.warn('⚠️ IndexNow ping note:', err.message);
  }

  conn.end();
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 [Surgical Deployer] Store [${STORE_SLUG}] successfully deployed in ${totalDuration}s!\n`);
}

function fastUpload(sftp, localFile, remoteFile) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(localFile, remoteFile, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

runSurgicalDeploy().catch(err => {
  console.error('❌ Fatal surgical deployment error:', err);
  process.exit(1);
});
