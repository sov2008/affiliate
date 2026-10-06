const fs = require('fs');
const { NodeSSH } = require('node-ssh');

async function deploy() {
  const ssh = new NodeSSH();
  
  const env = fs.readFileSync('.env', 'utf8');
  const host = env.match(/DROPLET_IP=["']?([^"'\r\n]+)/)?.[1] || '178.128.199.28';
  const username = env.match(/DROPLET_USER=["']?([^"'\r\n]+)/)?.[1] || 'root';
  
  // Look for SSH key
  let privateKeyPath = env.match(/SSH_KEY_PATH=["']?([^"'\r\n]+)/)?.[1];
  if (!privateKeyPath || !fs.existsSync(privateKeyPath)) {
    const defaultKey = `${process.env.USERPROFILE || process.env.HOME}/.ssh/id_rsa`;
    if (fs.existsSync(defaultKey)) privateKeyPath = defaultKey;
  }

  console.log(`Connecting to ${username}@${host}...`);
  await ssh.connect({
    host,
    username,
    privateKeyPath
  });
  console.log('SSH Connected.');

  // 1. Upload twitter_cookies.json
  console.log('Uploading twitter_cookies.json...');
  await ssh.putFile('twitter_cookies.json', '/var/www/affiliate/twitter_cookies.json');
  await ssh.putFile('twitter_cookies.json', '/var/www/affiliate/core/twitter_cookies.json');

  // 2. Upload compiled worker
  console.log('Uploading twitter-publisher.worker.js...');
  await ssh.putFile('core/dist/workers/twitter-publisher.worker.js', '/var/www/affiliate/core/dist/workers/twitter-publisher.worker.js');

  // 3. Upload ecosystem.config.cjs
  console.log('Uploading ecosystem.config.cjs...');
  await ssh.putFile('ecosystem.config.cjs', '/var/www/affiliate/ecosystem.config.cjs');

  // 4. Remove stale locks
  console.log('Clearing stale lock files...');
  await ssh.execCommand('rm -f /var/www/affiliate/.antigravity/twitter_publisher.lock');
  await ssh.execCommand('rm -f /var/www/affiliate/core/.antigravity/twitter_publisher.lock');

  // 5. PM2 Reload / Start
  console.log('Reloading PM2 with affiliate-twitter-publisher...');
  const pm2Res = await ssh.execCommand('cd /var/www/affiliate && pm2 start ecosystem.config.cjs && pm2 save');
  console.log(pm2Res.stdout);

  // 6. Verify status
  const statusRes = await ssh.execCommand('pm2 list');
  console.log(statusRes.stdout);

  ssh.dispose();
  console.log('Deployment complete!');
}

deploy().catch(console.error);
