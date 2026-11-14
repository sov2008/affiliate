const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "=== 1. MULTI-NETWORK EXPANSION LOG (Awin, CJ, Deploy) ==="
    tail -n 30 /var/log/multi_network_stream.log
    echo "=== 2. ADMITAD SYNC LOG ==="
    tail -n 30 /var/log/admitad_sync.log
    echo "=== 3. ADMITAD AUTO-APPLIER LOG ==="
    tail -n 30 /var/log/admitad_auto_applier.log
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

