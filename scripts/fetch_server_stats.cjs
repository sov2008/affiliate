const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected. Gathering server synchronization & traffic stats...');
  const commands = [
    'echo "=== NGINX PROMORADAR ACCESS LOG (LAST 24 HOURS REQUESTS) ==="',
    'grep -c "$(date +\'%d/%b/%Y\')" /var/log/nginx/access.log 2>/dev/null || wc -l /var/log/nginx/access.log',
    'echo "=== NGINX STATUS CODES TODAY ==="',
    'awk \'{print $9}\' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10',
    'echo "=== TOP REQUESTED URLS ON PROMORADAR ==="',
    'awk \'{print $7}\' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 15',
    'echo "=== CRON SYNC LOGS STATUS ==="',
    'ls -lh /var/log/multi_network_stream.log /var/log/admitad_sync.log /var/log/cj_api_run.log 2>/dev/null',
    'echo "=== LAST LINES OF MULTI-NETWORK STREAM LOG ==="',
    'tail -n 25 /var/log/multi_network_stream.log 2>/dev/null || echo "No stream log yet"'
  ].join(' && ');

  conn.exec(commands, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      console.log(out);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

