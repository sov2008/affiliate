const fs = require('fs');

// We simulate what index.astro does to compute interleavedDeals
// by reading the index.astro logic
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

// Let's see how interleavedDeals is constructed:
const search = 'const interleavedDeals';
const idx = indexAstro.indexOf(search);
console.log(indexAstro.slice(idx, idx + 1000));

