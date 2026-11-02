import gzip, glob, re
from collections import Counter

files = sorted(glob.glob("/var/log/nginx/auth_debug.log*"))
clicks_by_day = Counter()
offers_by_day = Counter()
sources_by_day = Counter()

for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                if "GET /go" in line:
                    m = re.search(r'\[([^:]+):.*GET /go\?([^ ]+) HTTP', line)
                    if m:
                        day = m.group(1)
                        query = m.group(2)
                        clicks_by_day[day] += 1
                        
                        # extract offer
                        mo = re.search(r'offer=([^&]+)', query)
                        if mo:
                            offers_by_day[mo.group(1)] += 1
                        else:
                            offers_by_day['default/smartlink'] += 1
                            
                        # extract source
                        ms = re.search(r'source=([^&]+)', query)
                        if ms:
                            sources_by_day[ms.group(1)] += 1
    except Exception as e:
        pass

print("=== OUTBOUND /GO CLICKS BY DAY (flirtcheck.site) ===")
for d in sorted(clicks_by_day.keys(), key=lambda x: str(x)):
    print(f"  {d}: {clicks_by_day[d]} clicks")

print("\n=== TOP OFFERS TRIGGERED ===")
for o, c in offers_by_day.most_common(10):
    print(f"  {o}: {c}")

print("\n=== TOP CONVERSION SOURCES/WIDGETS ===")
for s, c in sources_by_day.most_common(10):
    print(f"  {s}: {c}")
