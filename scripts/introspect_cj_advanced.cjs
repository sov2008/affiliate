const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function introspect(host, path = '/query') {
  const query = JSON.stringify({
    query: `
      {
        __schema {
          queryType {
            fields {
              name
            }
          }
          mutationType {
            fields {
              name
            }
          }
        }
      }
    `
  });

  const req = https.request({
    hostname: host,
    path: path,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query),
      'User-Agent': 'PromoRadar/1.0'
    }
  }, res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log(`[${host}] STATUS: ${res.statusCode}`);
      try {
        const j = JSON.parse(d);
        if (j.data && j.data.__schema) {
          console.log(`[${host}] Queries:`, j.data.__schema.queryType ? j.data.__schema.queryType.fields.map(f=>f.name) : 'none');
          console.log(`[${host}] Mutations:`, j.data.__schema.mutationType ? j.data.__schema.mutationType.fields.map(f=>f.name) : 'none');
        } else {
          console.log(`[${host}] RES:`, d.substring(0, 300));
        }
      } catch (e) {
        console.log(`[${host}] RAW:`, d.substring(0, 300));
      }
    });
  });

  req.write(query);
  req.end();
}

introspect('programs.api.cj.com');
setTimeout(() => introspect('accounts.api.cj.com', '/graphql'), 1500);
