const https = require('https');
const options = {
  hostname: 'link-search.api.cj.com',
  port: 443,
  path: '/v2/link-search?website-id=101907236&advertiser-ids=722009,4347407&link-type=Text+Link&page-number=1&records-per-page=5',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer iTOZ5YSaULmdycZWAbA4ce0N1w'
  }
};
https.get(options, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log(d));
});
