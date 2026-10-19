const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const CID = '8102806';

async function testCJ() {
  console.log('Testing CJ Commissions API GraphQL...');
  
  const query = JSON.stringify({
    query: `
      {
        publisher(id: "${CID}") {
          id
          name
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
      console.log('GraphQL Status:', res.statusCode);
      console.log('GraphQL Response:', data);
    });
  });

  req.on('error', (e) => {
    console.error('Request error:', e.message);
  });

  req.write(query);
  req.end();
}

testCJ();
