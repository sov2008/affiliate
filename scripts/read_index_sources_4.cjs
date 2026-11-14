const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');
const search = 'deduplicatedCoupons =';
let idx = content.indexOf(search);
console.log('deduplicatedCoupons definition:');
console.log(content.slice(idx - 200, idx + 600));

