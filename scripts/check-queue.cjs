const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const sql = "SELECT status, count(*) FROM content_queue_v2 GROUP BY status;";
  const cmd = `sqlite3 /var/www/affiliate/core/data/content_queue.sqlite "${sql}"`;
  conn.exec(cmd, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log('--- Content Queue SQLite Status ---');
      console.log(out.trim());
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
