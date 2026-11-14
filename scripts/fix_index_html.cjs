const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    ls -l /var/www/affiliate/deals-portal/dist/index.html
    ls -l /var/www/promoradar.store/releases/rel_1794499543034/index.html
    cp -f /var/www/affiliate/deals-portal/dist/index.html /var/www/promoradar.store/releases/rel_1794499543034/index.html
    ln -sfn /var/www/promoradar.store/releases/rel_1794499543034 /var/www/promoradar.store/current
    systemctl reload nginx
    ls -l /var/www/promoradar.store/current/index.html
  `, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

