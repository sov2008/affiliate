const https = require('https');

const query = JSON.stringify({
  query: `
    {
      publisher {
        websites(publisherId: "8102806") {
          totalCount
          resultList {
            id
            name
            default
          }
        }
      }
    }
  `
});

const req = https.request('https://programs.api.cj.com/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer iTOZ5YSaULmdycZWAbA4ce0N1w',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query)
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('Websites via GraphQL:\n', d));
});
req.write(query);
req.end();
