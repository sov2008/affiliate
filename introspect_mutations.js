const https = require('https');

const CJ_TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';

// Introspect mutations on GraphQL
const query = `
query IntrospectMutations {
  __type(name: "Mutation") {
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
  hostname: 'programs.api.cj.com',
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
