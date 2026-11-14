const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const scripts = [...body.matchAll(/<script[\s\S]*?<\/script>/gi)];
    console.log('Script tags count:', scripts.length);
    scripts.forEach((s, idx) => {
      console.log('Script ' + idx + ' len: ' + s[0].length + ' bytes, starts: ' + s[0].slice(0, 80).replace(/\n/g, ' '));
    });

    const links = [...body.matchAll(/<link[\s\S]*?>/gi)];
    console.log('--- External resources in head ---');
    links.forEach((l, idx) => {
      if (l[0].includes('stylesheet') || l[0].includes('font') || l[0].includes('preload')) {
        console.log('Link ' + idx + ': ' + l[0].replace(/\n/g, ' '));
      }
    });
  });
}).on('error', e => console.error(e.message));

