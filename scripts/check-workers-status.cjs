const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    pm2 status;
    echo "=== DATABASE STATUS (content_queue_v2) ===";
    sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT platform, status, count(*) FROM content_queue_v2 GROUP BY platform, status;";
    echo "=== LATEST 5 BLOG POST ENTRIES IN QUEUE ===";
    sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "SELECT id, status, hook, datetime(created_at/1000, 'unixepoch') FROM content_queue_v2 WHERE platform='BLOG_POST' OR target_platform='BLOG_POST' ORDER BY created_at DESC LIMIT 5;";
    echo "=== SCHEDULER LOGS (LAST 25 LINES) ===";
    pm2 logs affiliate-scheduler --lines 25 --nostream;
    echo "=== AUTOPILOT LOGS (LAST 25 LINES) ===";
    pm2 logs affiliate-autopilot --lines 25 --nostream;
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) {
      console.error('Exec error:', err);
      conn.end();
      return;
    }
    let out = '';
    stream.on('data', (d) => process.stdout.write(d));
    stream.stderr.on('data', (d) => process.stderr.write(d));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
