const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve('core/data/content_queue.sqlite');
console.log('Opening DB at:', dbPath);

const db = new DatabaseSync(dbPath);

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables);

if (tables.some(t => t.name === 'content_queue_v2')) {
  const stats = db.prepare('SELECT platform, status, count(*) as count FROM content_queue_v2 GROUP BY platform, status').all();
  console.log('Queue Stats:', stats);

  const twitterSamples = db.prepare("SELECT id, hook, body, target_url, status FROM content_queue_v2 WHERE platform = 'TWITTER' LIMIT 3").all();
  console.log('Sample Twitter records:', twitterSamples);
}
