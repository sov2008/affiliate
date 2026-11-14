const fs = require('fs');
const indexAstro = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');

const needle = 'bg-slate-50 dark:bg-slate-900/60 py-3.5';
const pos = indexAstro.indexOf(needle);
console.log('Ticker wrapper pos:', pos);
console.log(indexAstro.slice(pos - 100, pos + 400));

