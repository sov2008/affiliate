const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const commands = [
    'df -h /',
    'echo "=== TOP DIRECTORIES IN /var/www ==="',
    'du -h -d 2 /var/www 2>/dev/null | sort -rh | head -n 20',
    'echo "=== CHECKING RELEASES ==="',
    'ls -ld /var/www/promoradar.store/releases/*',
    'ls -ld /var/www/flirtcheck.site/releases/*',
    'readlink -f /var/www/promoradar.store/current',
    'readlink -f /var/www/flirtcheck.site/current',
    'echo "=== CACHES & TMP ==="',
    'du -sh /tmp /var/tmp /root/.npm /root/.cache /var/log /var/lib/docker 2>/dev/null'
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  password: process.env.SSH_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});
