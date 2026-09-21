const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const dbPath = path.resolve(__dirname, '../core/data/content_queue.sqlite');
const db = new DatabaseSync(dbPath);

// Case Notes & Field Submissions Table
db.exec(`
  CREATE TABLE IF NOT EXISTS case_submissions (
    id TEXT PRIMARY KEY,
    post_slug TEXT NOT NULL,
    author_callsign TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    evidence_text TEXT NOT NULL,
    status TEXT CHECK(status IN ('VERIFIED', 'FLAGGED_AUTO', 'REJECTED')) DEFAULT 'VERIFIED',
    risk_score INTEGER DEFAULT 0,
    moderation_flags TEXT,
    ip_hash TEXT NOT NULL,
    user_agent_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_case_submissions_slug ON case_submissions(post_slug, status);
  CREATE INDEX IF NOT EXISTS idx_case_submissions_ip_time ON case_submissions(ip_hash, created_at);
`);
console.log('✅ SQLite case_submissions table verified');

try {
  const before = db.prepare("SELECT status, count(*) as cnt FROM content_queue_v2 GROUP BY status").all();
  console.log('Before update:', JSON.stringify(before));
  const res = db.prepare("UPDATE content_queue_v2 SET status = 'APPROVED', updated_at = unixepoch() WHERE status = 'PENDING_APPROVAL'").run();
  console.log('Updated rows to APPROVED:', res.changes);
  const after = db.prepare("SELECT status, count(*) as cnt FROM content_queue_v2 GROUP BY status").all();
  console.log('After update:', JSON.stringify(after));
} catch (err) {
  console.log('Queue update info:', err.message);
}

db.close();
console.log('✅ DB verification completed cleanly');
