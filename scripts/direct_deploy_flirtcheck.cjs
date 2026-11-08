const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Client } = require('ssh2');

const distDir = path.resolve(__dirname, '../blog/dist');
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ blog/dist/index.html does not exist! Please run npm run build inside blog/ first.');
  process.exit(1);
}

const releaseId = 'rel_' + Date.now();
const remoteReleasePath = `/var/www/flirtcheck.site/releases/${releaseId}`;
const remoteCurrentSymlink = '/var/www/flirtcheck.site/current';

console.log(`🚀 Starting FlirtCheck Direct Production Deploy: ${releaseId}`);
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

conn.on('ready', async () => {
  try {
    console.log('✅ SSH Connected to 178.128.199.28');

    // 1. Tar local dist for ultra-fast single file streaming upload
    const tarPath = path.resolve(__dirname, '../blog/dist.tar.gz');
    console.log('📦 Archiving blog dist to tar.gz...');
    execSync(`tar -czf "${tarPath}" -C "${distDir}" .`, { stdio: 'inherit' });

    console.log('📤 Uploading tar.gz to server...');
    const sftp = await new Promise((res, rej) => conn.sftp((err, s) => err ? rej(err) : res(s)));

    const remoteTar = `/tmp/blog_dist_${releaseId}.tar.gz`;
    await new Promise((res, rej) => sftp.fastPut(tarPath, remoteTar, (err) => err ? rej(err) : res()));
    console.log('✅ Archive uploaded successfully.');

    // 2. Unpack and configure remote release
    console.log('🔨 Unpacking release on server...');
    await runCmd(`
      set -e
      mkdir -p "${remoteReleasePath}"
      mkdir -p /var/www/flirtcheck.site/releases
      tar -xzf "${remoteTar}" -C "${remoteReleasePath}"
      rm -f "${remoteTar}"

      # Also sync to /var/www/affiliate/blog/dist for backward compatibility
      mkdir -p /var/www/affiliate/blog/dist
      cp -rf "${remoteReleasePath}/"* /var/www/affiliate/blog/dist/

      # Atomic symlink switch
      ln -sfn "${remoteReleasePath}" "${remoteCurrentSymlink}"

      # Prune older releases (keep 5 newest)
      cd /var/www/flirtcheck.site/releases && ls -1dt * | tail -n +6 | xargs -r rm -rf

      # Test and reload nginx
      nginx -t
      systemctl reload nginx
    `);
    console.log('✅ Symlink switched to current release and Nginx reloaded!');

    // Cleanup local tar
    if (fs.existsSync(tarPath)) fs.unlinkSync(tarPath);

    conn.end();
    console.log('🎉 FLIRTCHECK DIRECT DEPLOY COMPLETED SUCCESSFULLY!');
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

