const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "=== INDEXNOW KEY ON SERVER ==="
    ls -l /var/www/promoradar.store/current/*.txt
    cat /var/www/promoradar.store/current/*.txt 2>/dev/null || echo "No key file found"
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

