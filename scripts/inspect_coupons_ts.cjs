const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
console.log('File length:', content.length);
console.log('First 500 chars:');
console.log(content.slice(0, 500));
console.log('Last 500 chars:');
console.log(content.slice(-500));

