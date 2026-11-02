const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

// Let us inspect the GraphQL schema for products/shopping
const query = `
query IntrospectProductQuery {
  __type(name: "Query") {
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
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const fields = json.data?.__type?.fields || [];
      const productFields = fields.filter(f => f.name.toLowerCase().includes('product') || f.name.toLowerCase().includes('item') || f.name.toLowerCase().includes('catalog'));
      console.log('Product/Shopping Fields in CJ GraphQL:');
      console.log(JSON.stringify(productFields, null, 2));
    } catch (e) {
      console.error(e, data);
    }
  });
});

req.on('error', console.error);
req.write(postData);
req.end();
