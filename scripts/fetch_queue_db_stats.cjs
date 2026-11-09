const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
echo "=== CONTENT_QUEUE_V2 STATS ==="
sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT status, count(*) FROM content_queue_v2 GROUP BY status;"

echo "=== BLOG CONVERSIONS STATS ==="
sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT count(*) FROM blog_conversions;"

echo "=== CASE SUBMISSIONS STATS ==="
sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT count(*) FROM case_submissions;"

echo "=== AUTONOMOUS AGENT ACTIVE TIMELINE ==="
pm2 describe affiliate-autonomous-agent | grep -E "status|uptime|restarts|created_at"
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

