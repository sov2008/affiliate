const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

// Find GEO_BRAND_POOLS
const pos = indexAstro.indexOf('const GEO_BRAND_POOLS =');
console.log('GEO_BRAND_POOLS pos:', pos);
const endPos = indexAstro.indexOf('const resolvedBase', pos);
const poolsStr = indexAstro.slice(pos, endPos);

// Count occurrences of brand names
['Nike', 'Turbosto', 'Hostinger', 'PureVPN', 'Touch', 'Polis.ua', 'ALLPOWERS', 'Kodland', 'Airalo eSIM', 'ExpressVPN'].forEach(b => {
  const matches = (poolsStr.match(new RegExp(b, 'g')) || []).length;
  console.log(b, 'matches in GEO_BRAND_POOLS:', matches);
});

