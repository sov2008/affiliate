const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const re = /<article\b[^>]*class="[^"]*deal-grid-card[^"]*"[\s\S]*?<\/article>/g;
let m;
const cards = [];
while ((m = re.exec(html)) !== null) {
  const tag = m[0].match(/<article\b[^>]*>/)[0];
  const lang = (tag.match(/data-lang="([^"]+)"/) || [])[1] || 'en';
  const reg = (tag.match(/data-regions="([^"]+)"/) || [])[1] || 'GLOBAL';
  const cat = (tag.match(/data-category="([^"]+)"/) || [])[1] || 'ALL';
  cards.push({ lang, regions: reg.split(','), cat });
}

const catCounts = {};
cards.forEach(c => {
  catCounts[c.cat] = (catCounts[c.cat] || 0) + 1;
});

console.log('Category breakdown in rendered DOM:');
for (const [k, v] of Object.entries(catCounts)) {
  console.log(`  ${k}: ${v}`);
}
