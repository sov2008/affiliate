import subprocess

res = subprocess.run([
    'ssh', '-i', 'do_key.pem', '-o', 'StrictHostKeyChecking=no', 'root@178.128.199.28',
    'cd /var/www/affiliate && node verify_cj_auth.js'
], capture_output=True, text=True)

print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)

