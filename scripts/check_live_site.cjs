const https = require('https');

https.get('https://promoradar.store/', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const cssMatch = d.match(/href="([^"]+\.css)"/);
    console.log('CSS match:', cssMatch ? cssMatch[1] : 'NONE');
    const titleMatch = d.match(/<title>([^<]+)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'NONE');
    console.log('Includes PromoRadar:', d.includes('PromoRadar'));
    console.log('Includes DealBureau:', d.includes('DealBureau'));
    console.log('HTML Length:', d.length);

    // Check if CSS file is reachable
    if (cssMatch) {
      const cssUrl = 'https://promoradar.store' + cssMatch[1];
      https.get(cssUrl, cssRes => {
        console.log('CSS file status:', cssRes.statusCode);
      });
    }
  });
});
