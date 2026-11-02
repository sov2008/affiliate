const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

// Query products for our joined partner 945Industries (7709572)
const query = `
query getProducts {
  products(companyId: "8102806", partnerIds: ["7709572"], limit: 5) {
    totalCount
    resultList {
      id
      title
      description
      price {
        amount
        currency
      }
      salePrice {
        amount
        currency
      }
      imageLink
      link
      advertiserId
      advertiserName
      brand
      inStock
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
