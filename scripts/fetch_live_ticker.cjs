const https = require('https');

https.get('https://promoradar.store/', (res) => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
    if (body.length > 500000 && !body.includes('heroStoreTicker')) {
      // keep reading until ticker
    }
  });
  res.on('end', () => {
    console.log('Total HTML length:', body.length);
    const tickerIdx = body.indexOf('id="heroStoreTicker"');
    if (tickerIdx !== -1) {
      console.log('--- Server SSR Ticker Slice ---');
      console.log(body.slice(tickerIdx, tickerIdx + 1200));
    } else {
      console.log('heroStoreTicker not found!');
    }
  });
}).on('error', (e) => {
  console.error('Fetch error:', e.message);
});

