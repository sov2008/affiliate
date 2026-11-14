const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const p1 = html.indexOf('id="partnerRotatorSection"');
const p2 = html.indexOf('id="filterConsoleWrapper"');
const sec = html.substring(p1, p2);

console.log('partnerRotatorSection length:', sec.length);
const slides = (sec.match(/class="[^"]*rotator-slide[^"]*"/gi) || []).length;
console.log('Rotator slides count:', slides);

