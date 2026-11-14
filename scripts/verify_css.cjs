const https = require('https');

https.get('https://promoradar.store/?v=' + Date.now(), (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const cssMatch = body.match(/href="([^"]*\.css)"/);
    if (!cssMatch) {
      console.log('No CSS match found');
      return;
    }
    const cssPath = cssMatch[1];
    console.log('Found CSS path:', cssPath);
    const fullUrl = cssPath.startsWith('http') ? cssPath : 'https://promoradar.store' + cssPath;
    https.get(fullUrl, (cssRes) => {
      let css = '';
      cssRes.on('data', c => css += c);
      cssRes.on('end', () => {
        console.log('CSS length:', css.length);
        console.log('Includes smooth-image-loading:', css.includes('smooth-image-loading'));
        console.log('Includes stageShimmer:', css.includes('stageShimmer'));
        console.log('Includes content-visibility:', css.includes('content-visibility'));
      });
    });
  });
});

