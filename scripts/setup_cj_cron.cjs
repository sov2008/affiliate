const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const line = '*/20 * * * * cd /var/www/affiliate && node scripts/cj_autonomous_applier.cjs >> /var/log/cj_applier.log 2>&1';
  const cmd = `(crontab -l 2>/dev/null | grep -v 'cj_autonomous_applier'; echo "${line}") | crontab - && crontab -l`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log('✅ Active Crontab on Server:\n' + out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
