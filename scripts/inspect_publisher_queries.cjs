const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function inspectPublisherQueries() {
  const query = JSON.stringify({
    query: `
      {
        __type(name: "PublisherQueries") {
          fields {
            name
            description
            args {
              name
              type {
                name
                ofType {
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
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query)
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => console.log('PUBLISHER QUERIES:', JSON.stringify(JSON.parse(d), null, 2)));
  });

  req.write(query);
  req.end();
}

inspectPublisherQueries();
