const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('Stores mega dropdown (lines 234-320):');
console.log(lines.slice(234, 320).join('\n'));

