import gzip, glob, re
from collections import Counter

files = sorted(glob.glob("/var/log/nginx/access.log*"))
stores = Counter()
pages = Counter()
ref_sources = Counter()

for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                m = re.search(r'"[A-Z]+ (\S+) HTTP[^\"]*" (\d+) \d+ "([^"]*)" "([^"]*)"', line)
                if m:
                    path, status, ref, ua = m.groups()
                    if status in ('200', '301', '302'):
                        pages[path] += 1
                        if '/stores/' in path:
                            store = path.split('/stores/')[1].strip('/')
                            if store:
                                stores[store] += 1
                        if ref and ref != '-' and 'promoradar' not in ref and '178.128.199.28' not in ref:
                            ref_sources[ref[:80]] += 1
    except Exception as e:
        pass

print("=== PROMORADAR.STORE TOP STORES / COUPONS ===")
for s, c in stores.most_common(15):
    print(f"  {s}: {c} hits")

print("\n=== TOP EXTERNAL REFERRERS ===")
for r, c in ref_sources.most_common(10):
    print(f"  {r}: {c}")
