import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('178.128.199.28', username='root', key_filename='d:/WEB/antigravity/affiliate/do_key.pem')

remote_code = '''
import re

lines_yesterday = []
lines_today = []

with open('/var/log/nginx/access.log.1', 'r', errors='ignore') as f:
    for line in f:
        if '01/Nov/2026' in line:
            lines_yesterday.append(line)

with open('/var/log/nginx/access.log', 'r', errors='ignore') as f:
    for line in f:
        if '02/Nov/2026' in line:
            lines_today.append(line)

def analyze(lines, label):
    human_hits = 0
    human_ips = set()
    bot_hits = 0
    top_human_pages = {}
    top_human_stores = {}
    hours = {}
    for line in lines:
        m = re.search(r'^(\\S+) \\S+ \\S+ \\[([^:]+):(\\d+):[^\\]]+\\] "([A-Z]+) (\\S+) HTTP[^"]*" (\\d+) \\d+ "([^"]*)" "([^"]*)"', line)
        if not m:
            continue
        ip, date, hour, method, path, status, ref, ua = m.groups()
        is_bot = any(b in ua.lower() for b in ['bot', 'spider', 'crawler', 'headless', 'censys', 'semrush', 'bytespider', 'python', 'curl', 'wget'])
        if is_bot:
            bot_hits += 1
            continue
        
        if path.endswith(('.png', '.jpg', '.css', '.js', '.ico', '.svg', '.woff2')):
            continue
            
        human_hits += 1
        human_ips.add(ip)
        hours[hour] = hours.get(hour, 0) + 1
        top_human_pages[path] = top_human_pages.get(path, 0) + 1
        if '/stores/' in path or '/store/' in path:
            store = path.split('/store')[1].replace('s/', '').replace('/', '').split('?')[0]
            if store:
                top_human_stores[store] = top_human_stores.get(store, 0) + 1

    print("=== " + label + " ===")
    print("Чистых просмотров страниц (люди):", human_hits)
    print("Уникальных человеческих IP:", len(human_ips))
    print("Боты / краулеры (запросов):", bot_hits)
    print("Топ страниц:")
    for p, c in sorted(top_human_pages.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {p}: {c}")
    print("Топ магазинов:")
    for s, c in sorted(top_human_stores.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"  {s}: {c}")
    print("Распределение по часам (UTC):")
    for h in sorted(hours.keys()):
        print(f"  {h}:00 -> {hours[h]}")
    print()

analyze(lines_yesterday, "YESTERDAY (01 Nov 2026, 24h)")
analyze(lines_today, "TODAY (02 Nov 2026, 00:00 - 05:45 UTC)")
'''

stdin, stdout, stderr = ssh.exec_command('python3 -c "' + remote_code.replace('"', '\\"') + '"')
print(stdout.read().decode())
print(stderr.read().decode())
ssh.close()

