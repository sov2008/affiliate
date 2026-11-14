const https = require('https');

https.get('https://promoradar.store/stores/hostinger/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Hostinger page length:', body.length);
    const schemas = [...body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
    console.log('Total JSON-LD schemas found:', schemas.length);
    schemas.forEach((s, idx) => {
      try {
        const parsed = JSON.parse(s[1]);
        console.log(`Schema ${idx}: @type=${parsed['@type'] || (Array.isArray(parsed) ? 'Array' : 'Unknown')}`);
      } catch (e) {
        console.log(`Schema ${idx} raw:`, s[1].slice(0, 100));
      }
    });
  });
}).on('error', e => console.error(e.message));

