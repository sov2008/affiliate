const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/PartnerBannerRotator.astro', 'utf8');

console.log('PartnerBannerRotator.astro lines count:', content.split('\n').length);
const lines = content.split('\n');
console.log('Lines 0 to 60:');
console.log(lines.slice(0, 60).join('\n'));

