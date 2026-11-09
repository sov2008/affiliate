const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
echo "=== PM2 LOGS: affiliate-autonomous-agent ==="
pm2 logs affiliate-autonomous-agent --lines 50 --nostream

echo "\n=== PM2 LOGS: affiliate-autopilot ==="
pm2 logs affiliate-autopilot --lines 50 --nostream

echo "\n=== AUTONOMOUS REPORTS DIRECTORIES ==="
ls -lha /var/www/affiliate/data /var/www/affiliate/core/data 2>/dev/null

echo "\n=== SQLITE DATABASE STATS ==="
sqlite3 /var/www/affiliate/core/data/tg_leads.db "SELECT count(*) AS total_leads FROM leads;" 2>/dev/null || echo "No tg_leads table"
sqlite3 /var/www/affiliate/core/data/content_queue.db "SELECT status, count(*) FROM items GROUP BY status;" 2>/dev/null || echo "No content_queue db"
`;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

