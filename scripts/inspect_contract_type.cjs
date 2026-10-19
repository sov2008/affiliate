const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function inspectContract() {
  const query = JSON.stringify({
    query: `
      {
        __type(name: "Contract") {
          fields {
            name
            type {
              name
              kind
              ofType {
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
    res.on('end', () => console.log('CONTRACT FIELDS:', JSON.stringify(JSON.parse(d), null, 2)));
  });

  req.write(query);
  req.end();
}

inspectContract();
