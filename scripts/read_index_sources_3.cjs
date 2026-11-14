const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');
const search = 'enrichedDeals =';
let idx = content.indexOf(search);
console.log('enrichedDeals definition:');
console.log(content.slice(idx - 100, idx + 800));

