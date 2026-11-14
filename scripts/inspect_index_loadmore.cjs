const fs = require('fs');
const astro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');
const pIdx = astro.indexOf('loadMoreContainer');
console.log('loadMoreContainer in index.astro:');
if (pIdx !== -1) {
  console.log(astro.substring(pIdx - 100, pIdx + 1200));
}

