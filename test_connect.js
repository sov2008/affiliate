const https = require('https');

const CLIENT_ID = '497e2d7ed310265e6e2fb37cd2a237';
const BASE64_HEADER = 'NDk3ZTJkN2VkMzEwMjY1ZTZlMmZiMzdjZDJhMjM3OmY4MzJlOWU0NWQxOGVlN2E2MTU5ZTg3NDE3ODgyNA==';
const SCOPES = 'advcampaigns advcampaigns_for_website';

function getToken() {
  const postData = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    scope: SCOPES
  }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.admitad.com',
      port: 443,
      path: '/token/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${BASE64_HEADER}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d).access_token));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function testPostConnect(token, campaignId, websiteId) {
  const postData = new URLSearchParams({
    action: 'apply'
  }).toString();

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.admitad.com',
      port: 443,
      path: `/advcampaigns/website/${websiteId}/connect/${campaignId}/`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(postData);
    req.end();
  });
}

async function main() {
  const token = await getToken();
  console.log('Got Admitad Token.');
  const res = await testPostConnect(token, '186094', '3012753');
  console.log('Connect test response:', res);
}

main();
