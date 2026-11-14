import sqlite3

db_path = 'core/data/content_queue.sqlite'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Inspect rows before update
cur.execute("SELECT id, hook, body FROM content_queue_v2 WHERE platform = 'TWITTER' AND (hook LIKE '%**%' OR body LIKE '%**%')")
rows = cur.fetchall()
print(f"Found {len(rows)} TWITTER rows with '**'")

# 2. Update rows
cur.execute("""
    UPDATE content_queue_v2 
    SET hook = REPLACE(hook, '**', ''),
        body = REPLACE(body, '**', '')
    WHERE platform = 'TWITTER'
""")
conn.commit()

# 3. Verify
cur.execute("SELECT count(id) FROM content_queue_v2 WHERE platform = 'TWITTER' AND (hook LIKE '%**%' OR body LIKE '%**%')")
remaining = cur.fetchone()[0]
print(f"Update completed. Remaining TWITTER rows with '**': {remaining}")

conn.close()

