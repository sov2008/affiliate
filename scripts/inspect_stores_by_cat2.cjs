const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 40 to 120 of Header.astro:');
console.log(lines.slice(40, 120).join('\n'));

