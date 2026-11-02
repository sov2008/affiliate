import sqlite3
import json

db_path = '/var/www/affiliate/core/data/content_queue.sqlite'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=== RECENT TWITTER POSTS IN QUEUE ===")
cursor.execute("SELECT id, hook, body, target_url, tracking_url, status FROM content_queue_v2 WHERE platform = 'TWITTER' ORDER BY id DESC LIMIT 4")
rows = cursor.fetchall()
for r in rows:
    print(f"ID: {r[0]} [{r[5]}]")
    print(f"Hook: {r[1]}")
    print(f"Text:\n{r[2]}")
    print(f"Target URL: {r[3]}")
    print(f"Tracking/Deep link: {r[4]}")
    print("-" * 70)

print("\n=== RECENT PINTEREST PINS ===")
p_file = '/var/www/affiliate/.antigravity/pinterest_queue.json'
try:
    with open(p_file, 'r', encoding='utf-8') as f:
        pins = json.load(f)
    for p in pins[-3:]:
        print(f"Title: {p.get('title')}")
        print(f"Description: {p.get('description')}")
        print(f"Link: {p.get('link')}")
        print(f"Status: {p.get('status')}")
        print("-" * 70)
except Exception as e:
    print("Error reading Pinterest queue:", e)

