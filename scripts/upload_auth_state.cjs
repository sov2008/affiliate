const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const localPath = 'artifacts_admitad/auth_state.json';
    const remotePath = '/var/www/affiliate/artifacts_admitad/auth_state.json';
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) {
        console.error('SFTP upload error:', err);
      } else {
        console.log('✅ Successfully uploaded auth_state.json to', remotePath);
      }
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

