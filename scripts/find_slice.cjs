const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

// Check line where interleavedDeals is rendered
const search = 'interleavedDeals.slice';
const idx = indexAstro.indexOf(search);
console.log('Found slice:', idx);
if (idx !== -1) {
  console.log(indexAstro.slice(idx - 50, idx + 200));
}

