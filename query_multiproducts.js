const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

// Query other joined partners
const query = `
query getOtherProducts {
  protein: products(companyId: "8102806", partnerIds: ["7971085"], limit: 3) {
    totalCount
    resultList {
      title
      price { amount currency }
      imageLink
    }
  }
  whokeys: products(companyId: "8102806", partnerIds: ["7958531"], limit: 3) {
    totalCount
    resultList {
      title
      price { amount currency }
    }
  }
  carpuride: products(companyId: "8102806", partnerIds: ["7997220"], limit: 3) {
    totalCount
    resultList {
      title
      price { amount currency }
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
  res.on('end', () => console.log('Response:', data));
});

req.on('error', console.error);
req.write(postData);
req.end();
