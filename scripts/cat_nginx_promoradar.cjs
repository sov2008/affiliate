const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('cat /etc/nginx/sites-enabled/promoradar.store', (err, stream) => {
    if (err) throw err;
    stream.on('data', (d) => process.stdout.write(d));
    stream.stderr.on('data', (d) => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).on('error', (e) => console.error(e)).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: 'AffOps_Root_Secure_2026!k9P2w8',
  readyTimeout: 10000
});

