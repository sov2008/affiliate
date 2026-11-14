const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

console.log('HTML total characters:', html.length);
console.log('--- Sections Breakdown ---');

const sections = [
  { name: 'head', start: '<head', end: '</head>' },
  { name: 'preloader', start: 'id="promoradar-preloader"', end: '<!-- Header' },
  { name: 'header', start: '<header', end: '</header>' },
  { name: 'hero', start: 'id="heroDealCard"', end: 'id="mainDealsGrid"' },
  { name: 'dealsGrid', start: 'id="mainDealsGrid"', end: 'id="savingHacksSection"' },
  { name: 'savingHacks', start: 'id="savingHacksSection"', end: '<footer' },
  { name: 'footer', start: '<footer', end: '</footer>' },
  { name: 'modals & scripts', start: '</footer>', end: '</html>' }
];

sections.forEach(s => {
  const p1 = html.indexOf(s.start);
  const p2 = s.end ? html.indexOf(s.end, p1) : -1;
  const len = (p1 !== -1 && p2 !== -1) ? (p2 - p1) : -1;
  console.log(`${s.name}: start=${p1}, end=${p2}, length=${len} chars`);
});

