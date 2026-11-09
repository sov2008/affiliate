const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Resolving server git conflict...');
  const cmd = `cd /var/www/affiliate && git checkout --theirs deals-portal/src/data/couponsData.ts && git add deals-portal/src/data/couponsData.ts && git commit -m 'fix(server): sync latest catalog' || git reset --hard origin/promoradar-portal`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Result:\n' + out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

