const https = require('https');

const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const CID = '8102806';

function testAdvertiserLookup() {
  console.log('Testing Advertiser Lookup API (joined advertisers)...');
  
  const options = {
    hostname: 'advertiser-lookup.api.cj.com',
    path: '/v2/advertiser-lookup?requestor-cid=' + CID + '&advertiser-ids=joined&page-number=1&records-per-page=10',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'User-Agent': 'PromoRadar/1.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Joined Status:', res.statusCode);
      console.log('Joined Body:', data.substring(0, 500));
    });
  });

  req.on('error', (e) => console.error('Error:', e));
  req.end();
}

function testSearchAllAdvertisers() {
  console.log('Testing Advertiser Lookup API (search advertisers)...');
  
  const options = {
    hostname: 'advertiser-lookup.api.cj.com',
    path: '/v2/advertiser-lookup?requestor-cid=' + CID + '&advertiser-name=NordVPN&page-number=1&records-per-page=5',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + TOKEN,
      'User-Agent': 'PromoRadar/1.0'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Search Status:', res.statusCode);
      console.log('Search Body:', data.substring(0, 500));
    });
  });

  req.on('error', (e) => console.error('Error:', e));
  req.end();
}

testAdvertiserLookup();
setTimeout(testSearchAllAdvertisers, 1500);
