const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const cssMatch = body.match(/href="([^"]*\.css)"/);
    if (cssMatch) {
      https.get('https://promoradar.store' + cssMatch[1], (cRes) => {
        let css = '';
        cRes.on('data', c => css += c);
        cRes.on('end', () => {
          console.log('CSS includes overflow-x:hidden:', css.includes('overflow-x:hidden') || css.includes('overflow-x: hidden'));
          const stickyMatches = css.match(/[^{}]*sticky[^{}]*\{[^{}]*\}/g);
          console.log('Sticky rules in CSS:', stickyMatches ? stickyMatches.slice(0, 5) : 'none');
        });
      });
    }
  });
});

