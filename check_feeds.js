const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const WEBSITE_ID = '101907236';

const query = `
query getFeeds {
  productFeeds(publisherId: "8102806") {
    resultList {
      id
      name
      advertiserId
      advertiserName
      recordCount
      lastImportDate
    }
  }
}
`;

const postData = JSON.stringify({ query });

const options = {
  hostname: 'ads.api.cj.com',
  path: '/query',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CJ_TOKEN}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data.slice(0, 500)));
});

req.on('error', console.error);
req.write(postData);
req.end();
