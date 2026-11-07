const https = require('https');
const options = {
  hostname: '178.128.199.28',
  port: 443,
  path: '/',
  headers: { 'Host': 'promoradar.store' },
  rejectUnauthorized: false
};
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const regex = /<script[^>]*src="([^"]*)"/g;
    let m;
    while ((m = regex.exec(data)) !== null) {
      console.log('Live script:', m[1]);
    }
  });
});
req.end();

