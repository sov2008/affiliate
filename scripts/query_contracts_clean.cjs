const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryContracts() {
  const query = JSON.stringify({
    query: `
      {
        publisher {
          contracts(publisherId: "8102806", limit: 10) {
            totalCount
            resultList {
              status
              advertiserId
              programTerms {
                name
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
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('CONTRACTS RESULT:', JSON.stringify(JSON.parse(d), null, 2)));
  });

  req.write(query);
  req.end();
}

queryContracts();
