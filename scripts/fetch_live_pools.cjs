const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    const poolsIdx = body.indexOf('GEO_BRAND_POOLS =');
    if (poolsIdx !== -1) {
      console.log('--- Server GEO_BRAND_POOLS UA ---');
      console.log(body.slice(poolsIdx, poolsIdx + 700));
    }
  });
});

