const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`python3 -c "
data = open('/var/www/promoradar.store/current/index.html', encoding='utf-8', errors='ignore').read()
print('Live Search Results in current:', 'Live Search Results' in data)
print('Search Suggestions in current:', 'Search Suggestions' in data)
print('Results for in current:', 'Results for \"' in data)
"`, (err, stream) => {
    if (err) throw err;
    stream.on('data', d => process.stdout.write(d));
    stream.on('close', () => {
      conn.exec(`curl -s -I https://promoradar.store/`, (err2, stream2) => {
        stream2.on('data', d => process.stdout.write(d));
        stream2.on('close', () => {
          conn.end();
        });
      });
    });
  });
}).connect({
  host: '178.128.199.28',
  username: 'root',
  privateKey: fs.readFileSync('./do_key.pem')
});

