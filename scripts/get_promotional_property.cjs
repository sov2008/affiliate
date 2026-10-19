const https = require('https');

const query = JSON.stringify({
  query: `
    {
      promotionalProperties(publisherId: "8102806") {
        totalCount
        resultList {
          id
          name
          isPrimary
        }
      }
    }
  `
});

const req = https.request('https://accounts.api.cj.com/graphql', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer iTOZ5YSaULmdycZWAbA4ce0N1w',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query),
    'User-Agent': 'PromoRadar/1.0'
  }

}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Contracts & Property:\n', d));
});
req.write(query);
req.end();
