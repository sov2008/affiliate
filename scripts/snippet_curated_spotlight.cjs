const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const p1 = html.indexOf('id="curatedSpotlightSection"');
console.log('curatedSpotlightSection starts at:', p1);
console.log('First 1000 chars of curatedSpotlightSection:\n', html.substring(p1, p1 + 1000));

