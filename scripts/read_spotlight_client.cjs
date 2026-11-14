const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/CuratedSpotlightSection.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 400 to 550:');
console.log(lines.slice(400, 550).join('\n'));

