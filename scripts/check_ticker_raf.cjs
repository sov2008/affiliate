const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const start = indexAstro.indexOf('// Base auto-spin speed');
console.log(indexAstro.slice(start, start + 1200));

