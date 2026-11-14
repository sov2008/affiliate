const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('Categories mega dropdown (lines 330-410):');
console.log(lines.slice(330, 410).join('\n'));

