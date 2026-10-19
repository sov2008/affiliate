const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryContracts() {
  const query = JSON.stringify({
    query: `
      {
        publisher {
          contracts(publisherId: "8102806", limit: 5) {
            totalCount
            records {
              id
              status
              advertiserId
              advertiserName
            }
          }
        }
      }
    `
  });

  const req = https.request('https://programs.api.cj.com/query', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('CONTRACTS RES:', d));
  });

  req.write(query);
  req.end();
}

queryContracts();
