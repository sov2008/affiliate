const ssh2 = require('ssh2');
const fs = require('fs');

const conn = new ssh2.Client();

function runCommand(client, cmd) {
  return new Promise((resolve) => {
    console.log(`\n======================================================`);
    console.log(`▶️ RUNNING: ${cmd}`);
    console.log(`======================================================`);
    client.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        return resolve({ code: 1, output: err.message });
      }
      let output = '';
      stream.on('data', (d) => {
        const text = d.toString();
        output += text;
        process.stdout.write(text);
      });
      stream.stderr.on('data', (d) => {
        const text = d.toString();
        output += text;
        process.stderr.write(text);
      });
      stream.on('close', (code) => {
        resolve({ code, output });
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('✅ Connected via SSH. Inspecting server processes...');

  // 1. PM2 Status
  await runCommand(conn, 'pm2 status');

  // 2. Top CPU consuming processes
  await runCommand(conn, 'ps aux --sort=-%cpu | head -n 12');

  // 3. Top Memory consuming processes
  await runCommand(conn, 'ps aux --sort=-%mem | head -n 12');

  // 4. Any zombie / defunct processes
  await runCommand(conn, "ps aux | grep -E 'defunct|<defunct>|\\bZ\\b' | grep -v grep || echo 'No defunct processes found'");

  // 5. Check if any duplicate node processes outside PM2
  await runCommand(conn, "ps -ef | grep node | grep -v 'grep node' | awk '{print $2, $3, $7, $8, $9, $10, $11}'");

  // 6. Recent PM2 error logs
  await runCommand(conn, 'pm2 logs --err --lines 8 --nostream');

  // 7. Check SQLite database lock / journal files
  await runCommand(conn, 'ls -la /var/www/affiliate/core/data/');

  // 8. Overall system load & uptime
  await runCommand(conn, 'uptime && free -h && df -h /');

  conn.end();
  process.exit(0);
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('D:/keys/antigravity_digitalocean_ubuntu')
});
