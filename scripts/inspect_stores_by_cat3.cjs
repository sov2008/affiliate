const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 115 to 140 of Header.astro:');
console.log(lines.slice(115, 140).join('\n'));

