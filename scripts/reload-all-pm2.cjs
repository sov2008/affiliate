const ssh2 = require('ssh2');
const fs = require('fs');

const conn = new ssh2.Client();
conn.on('ready', () => {
  console.log('Connected via SSH. Reloading PM2 processes...');
  conn.exec('pm2 reload all --update-env && pm2 status', (err, stream) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', code => {
      console.log('PM2 reload finished with code', code);
      conn.end();
      process.exit(code || 0);
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
