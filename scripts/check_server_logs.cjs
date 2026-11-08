const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('tail -n 25 /var/log/awin_sync.log; echo "--- ADMITAD LOG ---"; tail -n 25 /var/log/promoradar_sync.log; echo "--- CJ LOG ---"; tail -n 25 /var/log/cj_mass_run.log', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: 'AffOps_Root_Secure_2026!k9P2w8'
});

