const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 20 to 50:');
console.log(lines.slice(20, 50).join('\n'));

