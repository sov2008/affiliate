const https = require('https');

const options = {
  hostname: 'old.reddit.com',
  path: '/user/sov2008/',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
};

https.get(options, res => {
  console.log('OLD REDDIT STATUS:', res.statusCode);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    const isSuspended = d.includes('suspended') || d.includes('banned');
    const notFound = d.includes('page not found') || d.includes('not found');
    const title = d.match(/<title>(.*?)<\/title>/);
    console.log('Title:', title ? title[1] : 'None');
    console.log('isSuspended:', isSuspended);
    console.log('notFound:', notFound);
    const karma = d.match(/<span class="karma[^"]*">([^<]+)<\/span>/g);
    console.log('Karma matches:', karma);
  });
}).on('error', e => console.error(e));
