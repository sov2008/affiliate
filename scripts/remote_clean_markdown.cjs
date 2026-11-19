const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const pyScript = `
import sqlite3

db_path = '/var/www/affiliate/core/data/content_queue.sqlite'
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute("SELECT id, hook, body FROM content_queue_v2 WHERE hook LIKE '%**%' OR body LIKE '%**%'")
rows = c.fetchall()
print(f"Found {len(rows)} rows with ** in remote DB")

updated = 0
for r in rows:
    row_id, hook, body = r
    new_hook = hook.replace('**', '') if hook else hook
    new_body = body.replace('**', '') if body else body
    c.execute("UPDATE content_queue_v2 SET hook = ?, body = ? WHERE id = ?", (new_hook, new_body, row_id))
    updated += 1

conn.commit()
print(f"Sanitized {updated} rows successfully.")

c.execute("SELECT status, platform, count(*) FROM content_queue_v2 GROUP BY status, platform")
for s in c.fetchall():
    print(s)
`;

  conn.exec(`python3 -c "${pyScript.replace(/"/g, '\\"').replace(/\n/g, '\n')}"`, (err, stream) => {
    let out = '';
    let errOut = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => errOut += d);
    stream.on('close', (code) => {
      console.log('OUTPUT:', out);
      if (errOut) console.error('STDERR:', errOut);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  password: process.env.SSH_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

