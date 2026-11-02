import subprocess

fix = """
python3 -c "
with open('/etc/nginx/sites-available/promoradar.store', 'r') as f:
    text = f.read()
import re
text = re.sub(r'try_files\\s+\\$uri[^;]+;', 'try_files $uri $uri/index.html /index.html =404;', text)
with open('/etc/nginx/sites-available/promoradar.store', 'w') as f:
    f.write(text)
"
nginx -t && systemctl reload nginx
"""

res = subprocess.run(['ssh', '-i', 'do_key.pem', '-o', 'StrictHostKeyChecking=no', 'root@178.128.199.28', fix], capture_output=True, text=True)
print(res.stdout)
print(res.stderr)
