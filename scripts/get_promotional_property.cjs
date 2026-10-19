const https = require('https');

const query = JSON.stringify({
  query: `
    {
      publisher {
        contracts(publisherId: "8102806", limit: 5) {
          totalCount
          resultList {
            advertiserId
            status
            programTerms {
              name
              promotionalProperties {
                id
                name
              }
            }
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
  res.on('end', () => console.log('Contracts & Property:\n', d));
});
req.write(query);
req.end();
