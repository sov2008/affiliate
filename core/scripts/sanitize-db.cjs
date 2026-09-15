const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const candidates = [
  path.resolve('/var/www/affiliate/core/core/data/tg_leads.db'),
  path.resolve('/var/www/affiliate/core/data/tg_leads.db'),
  path.resolve(__dirname, '../data/tg_leads.db'),
];

for (const p of candidates) {
  if (!fs.existsSync(p)) continue;
  try {
    const db = new DatabaseSync(p);
    db.exec(`
      CREATE TABLE IF NOT EXISTS mab_arms (
        offer_id TEXT PRIMARY KEY,
        network TEXT NOT NULL,
        impressions INTEGER DEFAULT 0,
        conversions INTEGER DEFAULT 0,
        revenue REAL DEFAULT 0,
        updated_at INTEGER NOT NULL
      );
    `);
    const res = db.prepare('UPDATE mab_arms SET impressions = conversions WHERE conversions > impressions').run();
    console.log(`[Sanitize] ${p} -> Changes: ${res.changes}`);
    const rows = db.prepare('SELECT * FROM mab_arms').all();
    console.table(rows);
  } catch (err) {
    console.error(`[Sanitize Error] ${p}: ${err.message}`);
  }
}
