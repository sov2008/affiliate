const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const pos = indexAstro.indexOf('const GEO_BRAND_POOLS =');
const endPos = indexAstro.indexOf('const resolvedBase', pos);
const poolsStr = indexAstro.slice(pos + 'const GEO_BRAND_POOLS ='.length, endPos).trim().replace(/;$/, '');

const pools = JSON.parse(poolsStr);
console.log('Pool keys:', Object.keys(pools));
for (const k of Object.keys(pools)) {
  console.log('--- Pool:', k, 'length:', pools[k].length);
  console.log(pools[k].slice(0, 10).map(x => x.name + ' (' + x.slug + ')').join(', '));
}

