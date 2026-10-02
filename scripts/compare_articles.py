import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

dir_path = r"D:\WEB\antigravity\affiliate\blog\src\content\posts"
files = [
    '2026-dating-safety-blueprint-verify-optimize-protect-your-online-.md',
    '2026-dating-safety-playbook-verify-optimize-and-protect-your-onli.md',
    '2026-ultimate-dating-safety-playbook-verify-optimize-outsmart-sca.md',
    'the-2026-ultimate-dating-safety-playbook-verify-optimize-thrive-o.md',
    '2026-ultimate-online-dating-safety-guide-verify-optimize-date-con.md',
    '2026-dating-safety-guide-optimize-your-profile-spot-scams-build-r.md'
]

for fname in files:
    fpath = os.path.join(dir_path, fname)
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        h2s = [l.strip() for l in lines if l.startswith('## ')]
        first_p = ""
        for line in lines:
            line_str = line.strip()
            if line_str and not line_str.startswith('#') and not line_str.startswith('---') and not line_str.startswith('title:') and not line_str.startswith('description:') and not line_str.startswith('category:') and not line_str.startswith('pubDate:'):
                first_p = line_str
                break
        word_count = len(''.join(lines).split())
        print(f"\n=======================================================")
        print(f"FILE: {fname}")
        print(f"WORDS: {word_count}")
        print(f"FIRST PARAGRAPH: {first_p[:120]}...")
        print(f"H2 HEADINGS:")
        for h in h2s:
            print(f"  • {h}")
