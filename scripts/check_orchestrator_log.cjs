const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    tail -n 30 /var/log/multi_network_stream.log
  `, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      conn.end();
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

