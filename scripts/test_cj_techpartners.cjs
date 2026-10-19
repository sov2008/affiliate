const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

function testTechPartners() {
  const query = JSON.stringify({
    query: `
      {
        __schema {
          mutationType {
            fields {
              name
              description
            }
          }
        }
      }
    `
  });

  const req = https.request('https://graph.cj.com/techpartners', {
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
    res.on('end', () => console.log('TECHPARTNERS STATUS:', res.statusCode, 'DATA:', d));
  });

  req.on('error', e => console.error('Error:', e.message));
  req.write(query);
  req.end();
}

testTechPartners();
