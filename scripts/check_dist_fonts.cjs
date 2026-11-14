const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const matches = html.match(/<link[^>]+fonts\.googleapis[^>]*>/gi) || [];
console.log('Fonts matches in dist/index.html:');
matches.forEach((m, idx) => console.log(idx + 1, m));

