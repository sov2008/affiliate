import glob, gzip, re
from collections import Counter

ips = Counter()
uas = Counter()

files = sorted(glob.glob("/var/log/nginx/auth_debug.log*"))
for f in files:
    opener = gzip.open if f.endswith(".gz") else open
    try:
        with opener(f, "rt", errors="ignore") as fh:
            for line in fh:
                if "GET /go" in line:
                    parts = line.split()
                    if parts:
                        ips[parts[0]] += 1
                    matches = re.findall(r'"([^"]*)"', line)
                    if len(matches) >= 3:
                        uas[matches[-1][:70]] += 1
    except Exception as e:
        pass

print("=== TOP 10 IPs on /go ===")
for ip, c in ips.most_common(10):
    print(f"  {ip}: {c}")

print("\n=== TOP 10 User-Agents on /go ===")
for ua, c in uas.most_common(10):
    print(f"  {c}x {ua}")

