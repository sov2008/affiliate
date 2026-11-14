const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Live HTML size:', body.length);
    console.log('Contains rafTick:', body.includes('rafTick'));
    console.log('Contains scaleX:', body.includes('scaleX'));
    console.log('Contains ultra-smooth transition:', body.includes('cubic-bezier(0.16, 1, 0.3, 1)'));
  });
}).on('error', e => console.error(e.message));

