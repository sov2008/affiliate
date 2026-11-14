const fs = require('fs');
const astro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const target = 'id="loadMoreDealsBtn"';
const idx = astro.indexOf(target);
console.log(astro.substring(idx - 100, idx + 800));
