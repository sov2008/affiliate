const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/PartnerBannerRotator.astro', 'utf8');

const lines = content.split('\n');
console.log('Lines 60 to 140:');
console.log(lines.slice(60, 140).join('\n'));

