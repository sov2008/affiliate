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

console.log('Total parsed cards:', cards.length);

const testRegions = ['ALL', 'GLOBAL', 'UA', 'EU', 'US', 'GCC', 'GB', 'CA', 'DE', 'PL'];
testRegions.forEach(r => {
  const matched = cards.filter(c => {
    const matchReg = (r === 'ALL' || r === 'GLOBAL') ? true : (c.regions.includes(r) || c.regions.includes('GLOBAL'));
    const matchLang = (c.lang === 'en');
    return matchReg && matchLang;
  });
  console.log(`Region ${r}: matched ${matched.length} offers`);
});

