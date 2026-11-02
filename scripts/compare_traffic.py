import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('178.128.199.28', username='root', key_filename='d:/WEB/antigravity/affiliate/do_key.pem')

remote_script = """
import glob, re, json
from collections import Counter

today_str = "02/Nov/2026"
yesterday_str = "01/Nov/2026"

stats = {
    today_str: {"hits": 0, "go_clicks": 0, "pages": Counter(), "stores": Counter(), "referrers": Counter(), "ips": set(), "clean_ips": set()},
    yesterday_str: {"hits": 0, "go_clicks": 0, "pages": Counter(), "stores": Counter(), "referrers": Counter(), "ips": set(), "clean_ips": set()}
}

files = ['/var/log/nginx/access.log', '/var/log/nginx/access.log.1']

for f in files:
    try:
        with open(f, 'rt', errors='ignore') as fh:
            for line in fh:
                for day in [today_str, yesterday_str]:
                    if day in line:
                        m = re.search(r'^(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "([A-Z]+) (\\S+) HTTP[^"]*" (\\d+) \\d+ "([^"]*)" "([^"]*)"', line)
                        if m:
                            ip, dt, method, path, status, ref, ua = m.groups()
                            ua_l = ua.lower()
                            is_bot = any(b in ua_l for b in ['bot', 'spider', 'crawler', 'curl', 'wget', 'python', 'headless', 'censys', 'semrush', 'bytespider'])
                            
                            st = stats[day]
                            st["hits"] += 1
                            st["ips"].add(ip)
                            if not is_bot:
                                st["clean_ips"].add(ip)
                                
                            if '/go/' in path or path.startswith('/go'):
                                st["go_clicks"] += 1
                                
                            if not path.endswith(('.png', '.jpg', '.css', '.js', '.ico', '.svg', '.woff2')):
                                st["pages"][path] += 1
                                
                            if '/stores/' in path or '/store/' in path:
                                store = path.split('/store')[1].replace('s/', '').replace('/', '').split('?')[0]
                                if store:
                                    st["stores"][store] += 1
                                    
                            if ref and ref != '-' and 'promoradar' not in ref and '178.128.199.28' not in ref:
                                st["referrers"][ref[:70]] += 1
    except Exception as e:
        print('Error:', e)

out = {}
for day, d in stats.items():
    out[day] = {
        "total_requests": d["hits"],
        "unique_ips": len(d["ips"]),
        "clean_human_ips": len(d["clean_ips"]),
        "go_affiliate_clicks": d["go_clicks"],
        "top_pages": d["pages"].most_common(8),
        "top_stores": d["stores"].most_common(8),
        "top_referrers": d["referrers"].most_common(6)
    }

print(json.dumps(out, indent=2))
"""

stdin, stdout, stderr = ssh.exec_command('python3 -c "' + remote_script.replace('"', '\\"') + '"')
res = stdout.read().decode()
err = stderr.read().decode()
if err:
    print("ERR:", err)
print(res)
ssh.close()

