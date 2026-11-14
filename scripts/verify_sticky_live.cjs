const https = require('https');

https.get('https://promoradar.store/?v=' + Date.now(), (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Includes overflow-x-clip in body:', body.includes('overflow-x-clip'));
    const cssMatch = body.match(/href="([^"]*\.css)"/);
    if (cssMatch) {
      https.get('https://promoradar.store' + cssMatch[1], (cRes) => {
        let css = '';
        cRes.on('data', c => css += c);
        cRes.on('end', () => {
          console.log('CSS includes position:sticky:', css.includes('position:sticky') || css.includes('position:-webkit-sticky'));
          console.log('CSS includes top:0!important:', css.includes('top:0!important') || css.includes('top:0'));
          console.log('CSS includes overflow-x:clip:', css.includes('overflow-x:clip') || css.includes('overflow-x: clip'));
        });
      });
    }
  });
});

