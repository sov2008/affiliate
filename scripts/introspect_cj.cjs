const https = require('https');
const TOKEN = 'iTOZ5YSaULmdycZWAbA4ce0N1w';
const q = JSON.stringify({ query: '{ __type(name: "Query") { fields { name } } }' });
const req = https.request('https://programs.api.cj.com/query', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }
}, res => {
  let d = ''; res.on('data', c => d += c);
  res.on('end', () => console.log('SCHEMA FIELDS:', d));
});
req.write(q); req.end();
