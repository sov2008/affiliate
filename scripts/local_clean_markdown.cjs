const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

if (fs.existsSync('core/data/content_queue.sqlite')) {
  const db = new DatabaseSync('core/data/content_queue.sqlite');
  const rows = db.prepare("SELECT id, hook, body FROM content_queue_v2 WHERE hook LIKE '%**%' OR body LIKE '%**%'").all();
  console.log(`Local rows with **: ${rows.length}`);
  const updateStmt = db.prepare("UPDATE content_queue_v2 SET hook = ?, body = ? WHERE id = ?");
  rows.forEach(r => {
    updateStmt.run(r.hook ? r.hook.replace(/\*\*/g, '') : r.hook, r.body ? r.body.replace(/\*\*/g, '') : r.body, r.id);
  });
  console.log('Cleaned local rows successfully.');
}
