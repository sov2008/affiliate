const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const pos = indexAstro.indexOf('GEO_BRAND_POOLS =');
const endPos = indexAstro.indexOf('const resolvedBase', pos);
const poolsStr = indexAstro.slice(pos + 'GEO_BRAND_POOLS ='.length, endPos).trim().replace(/;$/, '');
const pools = JSON.parse(poolsStr);

console.log('UA pool list:');
pools.UA.forEach((b, i) => console.log(i, b.name));

