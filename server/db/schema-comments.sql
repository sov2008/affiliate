-- Case Notes & Field Incident Submissions Schema
-- Cheltenham Bureau Forensic Desk Telemetry
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
