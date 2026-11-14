const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "=== 1. CURRENT RELEASES AND SYMLINK ==="
    ls -l /var/www/promoradar.store/current
    echo "=== 2. TOTAL PAGES AND STORES IN CURRENT RELEASE ==="
    find /var/www/promoradar.store/current/stores -mindepth 1 -maxdepth 1 -type d | wc -l
    echo "=== 3. SITEMAP ENTRIES COUNT ==="
    grep -o "<loc>" /var/www/promoradar.store/current/sitemap-0.xml | wc -l
    echo "=== 4. RECENT CRON ACTIVITY & TIMESTAMPS ==="
    ls -lt /var/log/multi_network_stream.log /var/log/admitad_sync.log /var/log/admitad_auto_applier.log
    echo "=== 5. LAST 15 LINES OF MULTI-NETWORK STREAM ==="
    tail -n 15 /var/log/multi_network_stream.log
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

