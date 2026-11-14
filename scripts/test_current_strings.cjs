const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`python3 -c "
import sys
try:
    with open('/var/www/promoradar.store/current/index.html', 'r', encoding='utf-8') as f:
        data = f.read()
    print('Length of current index.html:', len(data))
    print('Contains Live Search Results:', 'Live Search Results' in data)
    print('Contains Search Suggestions:', 'Search Suggestions' in data)
    print('Contains Recommended Products:', 'Recommended Products' in data)
    print('Contains Verified Feeds:', 'Verified Feeds' in data)
except Exception as e:
    print('Error:', e)
"`, (err, stream) => {
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

