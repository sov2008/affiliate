const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const start = indexAstro.indexOf('function updateCenterLensZoom()');
console.log(indexAstro.slice(start, start + 1200));

