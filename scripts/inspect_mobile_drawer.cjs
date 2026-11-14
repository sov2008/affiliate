const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('Mobile drawer (lines 620-720):');
console.log(lines.slice(620, 720).join('\n'));

