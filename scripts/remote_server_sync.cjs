const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connection established');

  // 1. Upload ops/nginx-promoradar.conf to /etc/nginx/sites-available/promoradar.store
  const localNginxConf = path.resolve(__dirname, '../ops/nginx-promoradar.conf');
  
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err);
      conn.end();
      return;
    }

    const remoteNginxPath = '/etc/nginx/sites-available/promoradar.store';
    const readStream = fs.createReadStream(localNginxConf);
    const writeStream = sftp.createWriteStream(remoteNginxPath);

    writeStream.on('close', () => {
      console.log('✅ Nginx config uploaded to /etc/nginx/sites-available/promoradar.store');

      // 2. Upload clean_twitter_markdown.py to /var/www/affiliate/scripts/
      const localPy = path.resolve(__dirname, 'clean_twitter_markdown.py');
      const remotePy = '/var/www/affiliate/scripts/clean_twitter_markdown.py';
      const pyRead = fs.createReadStream(localPy);
      const pyWrite = sftp.createWriteStream(remotePy);

      pyWrite.on('close', () => {
        console.log('✅ clean_twitter_markdown.py uploaded to server');

        // 3. Execute remote commands
        const cmd = [
          'nginx -t',
          'systemctl reload nginx',
          'python3 /var/www/affiliate/scripts/clean_twitter_markdown.py',
          'git -C /var/www/affiliate pull origin promoradar-portal'
        ].join(' && ');

        conn.exec(cmd, (err, stream) => {
          if (err) throw err;
          stream.on('close', (code) => {
            console.log('Remote execution finished with code:', code);
            conn.end();
          }).on('data', (data) => {
            process.stdout.write(data);
          }).stderr.on('data', (data) => {
            process.stderr.write(data);
          });
        });
      });

      pyRead.pipe(pyWrite);
    });

    readStream.pipe(writeStream);
  });
}).connect({
  host: '178.128.199.28',
  port: 22,
  username: 'root',
  password: process.env.SSH_PASSWORD || 'AffOps_Root_Secure_2026!k9P2w8'
});
