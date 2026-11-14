const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Starting sync, build and deploy...');
  conn.exec(`
    set -e
    cd /var/www/affiliate
    git fetch origin promoradar-portal
    git reset --hard origin/promoradar-portal
    echo "=== CURRENT SERVER COMMIT ==="
    git log -n 1 --oneline
    
    cd /var/www/affiliate/deals-portal
    npx astro build
    
    echo "=== COPYING TO PROD RELEASE ==="
    cp -rf dist/* /var/www/promoradar.store/releases/rel_1794499543034/
    ln -sfn /var/www/promoradar.store/releases/rel_1794499543034 /var/www/promoradar.store/current
    systemctl reload nginx
    echo "=== DEPLOY COMPLETE ==="
  `, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', (code) => {
      console.log('Stream closed with code ' + code);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

