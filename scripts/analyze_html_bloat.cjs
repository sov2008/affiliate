const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Total HTML size:', Math.round(body.length / 1024), 'KB');
    
    // Scripts
    const scripts = [...body.matchAll(/<script[\s\S]*?<\/script>/gi)];
    let scriptBytes = 0;
    scripts.forEach((s, idx) => {
      scriptBytes += s[0].length;
      if (s[0].length > 50000) {
        console.log(`Script ${idx} size: ${Math.round(s[0].length / 1024)} KB, starts with: ${s[0].slice(0, 80).replace(/\n/g, ' ')}`);
      }
    });
    console.log('Total Script size:', Math.round(scriptBytes / 1024), 'KB');

    // Cards
    const cardMatches = body.match(/deal-grid-card/g) || [];
    console.log('deal-grid-card count:', cardMatches.length);

    // Dom element count estimate
    const tagsCount = (body.match(/<[a-zA-Z0-9-]+/g) || []).length;
    console.log('Total HTML tags count:', tagsCount);
  });
}).on('error', e => console.error(e.message));

