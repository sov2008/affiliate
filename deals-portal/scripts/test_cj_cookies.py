import subprocess
import sys

script = """
import json
with open('/var/www/affiliate/artifacts_admitad/cj_auth_state.json') as f:
    data = json.load(f)
cookies = [c['name'] for c in data.get('cookies', []) if 'cj.com' in c.get('domain', '')]
print('CJ cookies found on server:', len(cookies), set(cookies))
"""

cmd = f"python3 -c \"{script}\""
res = subprocess.run(['ssh', '-i', 'do_key.pem', '-o', 'StrictHostKeyChecking=no', 'root@178.128.199.28', cmd], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

