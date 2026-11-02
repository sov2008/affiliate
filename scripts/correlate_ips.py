import gzip, glob, re
from collections import Counter

files = sorted(glob.glob("/var/log/nginx/auth_debug.log*"))
go_ips = set()
for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                if "GET /go" in line:
                    m = re.match(r'^(\S+)', line)
                    if m:
                        go_ips.add(m.group(1))
    except:
        pass

print(f"Total unique IPs hitting /go: {len(go_ips)}")

# Now check how many pageviews these IPs had in auth_debug.log
ip_pageviews = Counter()
for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                m = re.match(r'^(\S+) - \S+ \[([^:]+):.*\] "GET (\S+) HTTP', line)
                if m:
                    ip, dt, path = m.groups()
                    if ip in go_ips and not path.startswith('/go'):
                        ip_pageviews[ip] += 1
    except:
        pass

print(f"IPs that visited pages BEFORE/AFTER hitting /go: {len(ip_pageviews)}")
print("Sample IPs and their pageview counts:", ip_pageviews.most_common(10))
