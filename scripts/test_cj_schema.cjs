const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const CID = '8102806';

function querySchema() {
  const query = JSON.stringify({
    query: `
      {
        __schema {
          queryType {
            fields {
              name
              description
            }
          }
        }
      }
    `
  });

  const options = {
    hostname: 'commissions.api.cj.com',
    path: '/query',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(query),
      'User-Agent': 'PromoRadar-Affiliate-Bot/1.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Schema Query Status:', res.statusCode);
      try {
        const json = JSON.parse(data);
        if (json.data && json.data.__schema) {
          console.log('Available Query Fields in Commissions API:');
          json.data.__schema.queryType.fields.forEach(f => console.log(' - ' + f.name));
        } else {
          console.log('Response:', data);
        }
      } catch (e) {
        console.log('Parse error:', data);
      }
    });
  });

  req.write(query);
  req.end();
}

querySchema();
