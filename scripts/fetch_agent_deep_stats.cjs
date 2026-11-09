const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
echo "=== POSTS COUNT ON BLOG ==="
ls -1 /var/www/affiliate/blog/src/content/posts/*.md 2>/dev/null | wc -l

echo "=== LAST 10 POSTS CREATED BY AUTONOMOUS AGENT ==="
ls -lt /var/www/affiliate/blog/src/content/posts/*.md 2>/dev/null | head -n 10

echo "=== CONTENT QUEUE SQLITE TABLES ==="
sqlite3 /var/www/affiliate/core/data/content_queue.sqlite ".tables"
echo "=== TOTAL ITEMS IN QUEUE ==="
sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT count(*) FROM content_items;" 2>/dev/null || sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT count(*) FROM queue;" 2>/dev/null || echo "Check table schema"

echo "=== TELEGRAM DISPATCH LOGS ==="
grep -E "Successfully dispatched snippet" /var/www/affiliate/.antigravity/logs/pm2-affiliate-autonomous-agent-out.log | tail -n 10 | wc -l
grep -c "Successfully dispatched snippet" /var/www/affiliate/.antigravity/logs/pm2-affiliate-autonomous-agent-out.log
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

