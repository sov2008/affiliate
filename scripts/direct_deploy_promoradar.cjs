const fs = require('fs');
const path = require('path');
const { Client } = require('ssh2');

const distDir = path.resolve(__dirname, '../deals-portal/dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ deals-portal/dist/index.html does not exist! Please run npm run build first.');
  process.exit(1);
}

const releaseId = 'rel_' + Date.now();
const remoteReleasePath = `/var/www/promoradar.store/releases/${releaseId}`;
const remoteCurrentSymlink = '/var/www/promoradar.store/current';

console.log(`🚀 Starting Direct Production Deploy: ${releaseId}`);
console.log(`📁 Source: ${distDir}`);
console.log(`🌐 Target: ${remoteReleasePath}`);

const conn = new Client();

function runCmd(cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let out = '';
      stream.on('data', (d) => { out += d.toString(); });
      stream.stderr.on('data', (d) => { out += d.toString(); });
      stream.on('close', (code) => {
        if (code !== 0) return reject(new Error(`Command exited with ${code}: ${out}`));
        resolve(out.trim());
      });
    });
  });
}

function uploadDirectory(sftp, localDir, remoteDir) {
  return new Promise(async (resolve, reject) => {
    try {
      await runCmd(`mkdir -p "${remoteDir}"`);
      const entries = fs.readdirSync(localDir, { withFileTypes: true });
      for (const entry of entries) {
        const localPath = path.join(localDir, entry.name);
        const remotePath = `${remoteDir}/${entry.name}`;
        if (entry.isDirectory()) {
          await uploadDirectory(sftp, localPath, remotePath);
        } else {
          await new Promise((resFile, rejFile) => {
            sftp.fastPut(localPath, remotePath, (err) => {
              if (err) return rejFile(err);
              resFile();
            });
          });
        }
      }
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

conn.on('ready', async () => {
  try {
    console.log('✅ SSH Connected to 178.128.199.28');
    
    // 1. Tar local dist for ultra-fast single file streaming upload
    const tarPath = path.resolve(__dirname, '../deals-portal/dist.tar.gz');
    console.log('📦 Archiving local dist to tar.gz...');
    const { execSync } = require('child_process');
    execSync(`tar -czf "${tarPath}" -C "${distDir}" .`, { stdio: 'inherit' });

    console.log('📤 Uploading tar.gz to server...');
    const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));
    
    const remoteTar = `/tmp/dist_${releaseId}.tar.gz`;
    await new Promise((res, rej) => sftp.fastPut(tarPath, remoteTar, (err) => err ? rej(err) : res()));
    console.log('✅ Archive uploaded successfully.');

    // 2. Unpack and configure remote release
    console.log('🔨 Unpacking release on server...');
    await runCmd(`
      set -e
      mkdir -p "${remoteReleasePath}"
      tar -xzf "${remoteTar}" -C "${remoteReleasePath}"
      rm -f "${remoteTar}"
      
      # Verification tokens
      echo "dcaf1a95-f2a7-42c8-b67f-4a463294ee43" > "${remoteReleasePath}/dcaf1a95-f2a7-42c8-b67f-4a463294ee43.txt"
      echo "fa9e3fd878" > "${remoteReleasePath}/admitad-verification.txt"

      # Also sync to /var/www/affiliate/deals-portal/dist for legacy vhosts
      mkdir -p /var/www/affiliate/deals-portal/dist
      cp -rf "${remoteReleasePath}/"* /var/www/affiliate/deals-portal/dist/

      # Atomic symlink switch
      ln -sfn "${remoteReleasePath}" "${remoteCurrentSymlink}"
      
      # Prune older releases (keep 5 newest)
      cd /var/www/promoradar.store/releases && ls -1dt * | tail -n +6 | xargs -r rm -rf
      
      # Test and reload nginx
      nginx -t
      systemctl reload nginx
    `);
    console.log('✅ Symlink switched to current release and Nginx reloaded!');

    // Cleanup local tar
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

    conn.end();
    console.log('🎉 DIRECT DEPLOY COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Deploy failed:', err);
    conn.end();
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('SSH Connection Error:', err);
  process.exit(1);
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: 'AffOps_Root_Secure_2026!k9P2w8',
  readyTimeout: 30000
});

