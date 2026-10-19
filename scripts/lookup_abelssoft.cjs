const https = require('https');

const options = {
  hostname: 'advertiser-lookup.api.cj.com',
  port: 443,
  path: '/v2/advertiser-lookup?requestor-cid=8102806&advertiser-ids=6260179',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer iTOZ5YSaULmdycZWAbA4ce0N1w'
  }
};

https.get(options, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Advertiser 6260179 Details:\n', d));
});
