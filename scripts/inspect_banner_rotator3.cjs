const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/PartnerBannerRotator.astro', 'utf8');

const lines = content.split('\n');
console.log('Rotator client script:');
const scriptIdx = lines.findIndex(l => l.includes('<script'));
console.log(lines.slice(scriptIdx, scriptIdx + 100).join('\n'));

