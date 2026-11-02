import glob, gzip, re, json
from collections import Counter

print("=== NGINX LOG ANALYSIS (PROD SITES) ===")
files_flirt = ["/var/log/nginx/auth_debug.log", "/var/log/nginx/auth_debug.log.1"]
files_access = ["/var/log/nginx/access.log", "/var/log/nginx/access.log.1"]

def analyze_logs(files, is_flirt=True):
    total = 0
    statuses = Counter()
    paths = Counter()
    ips = Counter()
    dates = Counter()
    user_agents = Counter()
    bots = Counter()
    for f in files:
        try:
            with open(f, "r", errors="ignore") as fh:
                for line in fh:
                    total += 1
                    if is_flirt:
                        m = re.search(r'^(\S+) - \S+ \[([^:]+):.*\] "[A-Z]+ (\S+) HTTP[^\"]*" (\d+)', line)
                    else:
                        m = re.search(r'^(\S+) - \S+ \[([^:]+):.*\] "[A-Z]+ (\S+) HTTP[^\"]*" (\d+) \d+ "[^\"]*" "([^\"]*)"', line)
                    if m:
                        ip = m.group(1)
                        dt = m.group(2)
                        path = m.group(3)
                        st = m.group(4)
                        statuses[st] += 1
                        paths[path] += 1
                        ips[ip] += 1
                        dates[dt] += 1
                        if not is_flirt and len(m.groups()) >= 5:
                            ua = m.group(5)
                            user_agents[ua] += 1
                            if any(b in ua.lower() for b in ['bot', 'crawler', 'spider', 'google', 'bing', 'yandex', 'amazon']):
                                bots['bot'] += 1
                            else:
                                bots['human_or_other'] += 1
        except Exception as e:
            print("Err:", e)
    return total, statuses, paths, ips, dates, user_agents, bots

t_f, s_f, p_f, ip_f, d_f, _, _ = analyze_logs(files_flirt, is_flirt=True)
print(f"\n--- flirtcheck.site (auth_debug.log + .1) ---")
print(f"Total requests: {t_f}, Unique IPs: {len(ip_f)}")
print("By Date:", dict(d_f.most_common(5)))
print("Statuses:", dict(s_f.most_common(5)))
print("Top 10 URLs:")
for p, c in p_f.most_common(10):
    print(f"  {p}: {c}")

t_a, s_a, p_a, ip_a, d_a, ua_a, bots_a = analyze_logs(files_access, is_flirt=False)
print(f"\n--- promoradar.store & other vhosts (access.log + .1) ---")
print(f"Total requests: {t_a}, Unique IPs: {len(ip_a)}")
print("By Date:", dict(d_a.most_common(5)))
print("Statuses:", dict(s_a.most_common(5)))
print("Traffic split (Bots vs Others):", dict(bots_a))
print("Top 10 URLs:")
for p, c in p_a.most_common(10):
    print(f"  {p}: {c}")
print("Top 5 User Agents:")
for u, c in ua_a.most_common(5):
    print(f"  {u[:80]}: {c}")
