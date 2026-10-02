import os
import glob
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

dir_path = r"D:\WEB\antigravity\affiliate\blog\src\content\posts"
files = sorted(glob.glob(os.path.join(dir_path, "*.md")))

print(f"Total articles: {len(files)}\n")

categories = {}
all_titles = []

for idx, fpath in enumerate(files, 1):
    fname = os.path.basename(fpath)
    title = ""
    category = "uncategorized"
    with open(fpath, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            if line.startswith("title:"):
                title = line.split(":", 1)[1].strip().strip('"').strip("'")
            elif line.startswith("category:"):
                category = line.split(":", 1)[1].strip().strip('"').strip("'")
            if line.startswith("---") and idx > 1: # already past frontmatter
                pass
    all_titles.append((fname, title, category))

# Sort by title
all_titles.sort(key=lambda x: x[1].lower())

for fname, title, category in all_titles:
    print(f"[{category[:15]:15}] {title[:65]:65} ({fname})")
