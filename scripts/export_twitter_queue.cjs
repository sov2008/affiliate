const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const localDb = new DatabaseSync('core/data/content_queue.sqlite');
const rows = localDb.prepare("SELECT * FROM content_queue_v2 WHERE platform = 'TWITTER' AND status = 'APPROVED'").all();

console.log(`Found ${rows.length} approved Twitter items locally.`);
fs.writeFileSync('scripts/twitter_queue_export.json', JSON.stringify(rows));
console.log('Saved to scripts/twitter_queue_export.json');
