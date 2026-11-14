const fs = require('fs');
const code = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const dealsMatch = code.match(/id:\s*['"]deal_/g);
console.log('Total deals in couponsData.ts:', dealsMatch ? dealsMatch.length : 0);

