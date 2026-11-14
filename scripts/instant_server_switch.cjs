const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const releaseId = 'rel_' + Date.now();
  const remoteRelease = `/var/www/promoradar.store/releases/${releaseId}`;
  
  console.log('Copying built dist to', remoteRelease);
  conn.exec(`
    mkdir -p "${remoteRelease}"
    cp -r /var/www/affiliate/deals-portal/dist/* "${remoteRelease}/"
    ln -sfn "${remoteRelease}" /var/www/promoradar.store/current
    systemctl reload nginx
    echo "RELEASE_DEPLOYED_OK: ${releaseId}"
  `, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', (code) => {
      console.log('Finished deploy with code:', code);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

