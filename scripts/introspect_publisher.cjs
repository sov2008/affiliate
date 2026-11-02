const https = require('https');
const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function queryPublisherFields() {
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
                kind
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
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
      try {
        const json = JSON.parse(d);
        console.log('FIELDS:');
        json.data?.__type?.fields?.forEach(f => console.log(' - ' + f.name));
      } catch(e) {
        console.log('Raw response:', d);
      }
    });
  });

  req.write(query);
  req.end();
}

queryPublisherFields();
