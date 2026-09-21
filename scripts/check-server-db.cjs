const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const remoteScript = `
    const { DatabaseSync } = require('node:sqlite');
    const fs = require('fs');
    
    console.log('--- Data Directory Files ---');
    console.log(fs.readdirSync('/var/www/affiliate/core/data'));

    const dbPath = '/var/www/affiliate/core/data/content_queue.sqlite';
    if (fs.existsSync(dbPath)) {
      const db = new DatabaseSync(dbPath);
      console.log('--- SQLite Tables ---');
      console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
      
      console.log('--- Queue Status Counts ---');
      try {
        console.log(db.prepare("SELECT status, count(*) as count FROM content_queue_v2 GROUP BY status").all());
      } catch (e) {
        console.log('content_queue_v2 table error:', e.message);
      }

      console.log('--- Latest 5 Items in Queue ---');
      try {
        console.log(db.prepare("SELECT id, platform, status, hook, created_at FROM content_queue_v2 ORDER BY created_at DESC LIMIT 5").all());
      } catch (e) {
        console.log('error fetching items:', e.message);
      }
      
      console.log('--- Case Submissions Count ---');
      try {
        console.log(db.prepare("SELECT count(*) as total_comments FROM case_submissions").all());
      } catch (e) {
        console.log('case_submissions table error:', e.message);
      }
    } else {
      console.log('DB file not found at', dbPath);
    }
  `;

  conn.exec(`node -e "${remoteScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, (err, stream) => {
    if (err) {
      console.error(err);
      conn.end();
      return;
    }
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
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
