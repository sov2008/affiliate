const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const releaseId = 'rel_' + Date.now();
  const releaseDir = '/var/www/promoradar.store/releases/' + releaseId;
  const currentLink = '/var/www/promoradar.store/current';
  const buildCmd = [
    'cd /var/www/affiliate',
    'git fetch origin promoradar-portal',
    'git reset --hard origin/promoradar-portal',
    'cd /var/www/affiliate/deals-portal',
    'npm run build',
    'mkdir -p ' + releaseDir,
    'cp -r dist/* ' + releaseDir + '/',
    'ln -sfn ' + releaseDir + ' ' + currentLink,
    'systemctl reload nginx',
    'echo DEPLOY_SUCCESS_' + releaseId
  ].join(' && ');

  console.log('Starting remote pull, build and deploy:', releaseId);
  conn.exec(buildCmd, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => {
      const s = d.toString();
      if (s.includes('building') || s.includes('complete') || s.includes('DEPLOY') || s.includes('HEAD is now at')) {
        console.log(s.trim());
      }
    });
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', (code) => {
      console.log('\nBuild closed with code:', code);
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});
