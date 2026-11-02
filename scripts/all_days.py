import gzip, glob, re
from collections import Counter

files = sorted(glob.glob("/var/log/nginx/access.log*"))
print(f"All access log files found: {len(files)}")
by_day = Counter()
ips_by_day = {}

for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                m = re.search(r'\[([^:]+):', line)
                if m:
                    d = m.group(1)
                    by_day[d] += 1
    except Exception as e:
        pass

for d in sorted(by_day.keys(), key=lambda x: str(x)):
    print(f"  {d}: {by_day[d]} requests")
