const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

// Find the ticker section
const tickerStart = indexAstro.indexOf('id="heroStoreTicker"');
console.log('Ticker start index:', tickerStart);
console.log(indexAstro.slice(tickerStart, tickerStart + 1200));

