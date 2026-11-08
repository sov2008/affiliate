const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Writing updated crontab to server...');
  const newCrontab = `NODE_PATH=/var/www/affiliate/node_modules
# PromoRadar Continuous Autonomous Stream Pipeline

# 1. CJ Affiliate Live API Ingestion (Every 30 mins: :00, :30)
0,30 * * * * cd /var/www/affiliate && node scripts/test_cj_v3.cjs >> /var/log/cj_api_run.log 2>&1

# 2. Admitad Auto-Applier (Every 30 mins: :10, :40)
10,40 * * * * cd /var/www/affiliate && node scripts/admitad_auto_applier.cjs >> /var/log/admitad_auto_applier.log 2>&1

# 3. Awin Continuous 50-Store Stream Expander & Direct Deploy (Every 30 mins: :15, :45)
15,45 * * * * cd /var/www/affiliate && node scripts/awin_continuous_expander.cjs >> /var/log/awin_expansion.log 2>&1

# 4. Core Database Backup (Daily at 03:00)
0 3 * * * cd /var/www/affiliate/core && npm run db:backup >> /var/log/affiliate_backup.log 2>&1
`;

  conn.exec(`cat << 'EOF' | crontab -\n${newCrontab}\nEOF`, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => {
      conn.exec('crontab -l', (err2, stream2) => {
        let list = '';
        stream2.on('data', d => list += d);
        stream2.on('close', () => {
          console.log('Updated Crontab on Server:\n' + list);
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_ROOT_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});

