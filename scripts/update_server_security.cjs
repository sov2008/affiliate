const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connecting to server to pull security fix and update server .env...');
  const cmd = `cd /var/www/affiliate && git pull origin promoradar-portal && grep -q 'ADMITAD_PASSWORD' .env || printf '\\nADMITAD_LOGIN="sov7@i.ua"\\nADMITAD_PASSWORD="1hi4PTyUPthkr1QzqrPY"\\n' >> .env`;
  
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('Server execution output:\n' + out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

