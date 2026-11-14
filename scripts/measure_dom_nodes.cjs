const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<([a-z0-9]+)\b[^>]*>/gi;
let totalElements = 0;
while (regex.exec(html) !== null) {
  totalElements++;
}
console.log('Total DOM elements in index.html:', totalElements);

const subCounts = [
  { name: 'header', start: '<header', end: '</header>' },
  { name: 'hero', start: '<div id="heroLeftContainer"', end: '<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8" id="curatedSpotlightSection"' },
  { name: 'curatedSpotlight', start: 'id="curatedSpotlightSection"', end: 'id="partnerRotatorSection"' },
  { name: 'partnerRotator', start: 'id="partnerRotatorSection"', end: 'id="filterConsoleWrapper"' },
  { name: 'dealsGrid', start: 'id="filterConsoleWrapper"', end: 'id="editorialGuaranteeSection"' },
  { name: 'footer & modals', start: '<footer', end: '</html>' }
];

subCounts.forEach(s => {
  const p1 = html.indexOf(s.start);
  const p2 = html.indexOf(s.end, p1);
  if (p1 !== -1 && p2 !== -1) {
    const sub = html.substring(p1, p2);
    let count = 0;
    const r = /<([a-z0-9]+)\b[^>]*>/gi;
    while (r.exec(sub) !== null) count++;
    console.log(`${s.name}: ${count} DOM nodes, ${(p2 - p1)} chars`);
  }
});

