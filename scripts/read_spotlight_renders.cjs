const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 125 to 145:');
console.log(lines.slice(125, 145).join('\n'));
console.log('Lines 205 to 225:');
console.log(lines.slice(205, 225).join('\n'));

