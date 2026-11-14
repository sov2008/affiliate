const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const re = /<article\b[^>]*class="[^"]*deal-grid-card[^"]*"[\s\S]*?<\/article>/g;
let m;
let count = 0;
const countsByLang = {};
const countsByRegion = {};
const nonMatchingCards = [];

while ((m = re.exec(html)) !== null) {
  count++;
  const tag = m[0].match(/<article\b[^>]*>/)[0];
  const langMatch = tag.match(/data-lang="([^"]+)"/);
  const lang = langMatch ? langMatch[1] : 'none';
  const regMatch = tag.match(/data-regions="([^"]+)"/);
  const reg = regMatch ? regMatch[1] : 'none';
  const catMatch = tag.match(/data-category="([^"]+)"/);
  const cat = catMatch ? catMatch[1] : 'none';

  countsByLang[lang] = (countsByLang[lang] || 0) + 1;
  countsByRegion[reg] = (countsByRegion[reg] || 0) + 1;

  // Check default filter: category === 'ALL', region === 'ALL', lang === 'en', type === 'ALL'
  const matchLang = (lang === 'en');
  if (!matchLang) {
    nonMatchingCards.push({ id: count, lang, reg, cat, tagSnippet: tag.substring(0, 100) });
  }
}

console.log('Total articles:', count);
console.log('Counts by data-lang:', countsByLang);
console.log('Non-en articles count:', nonMatchingCards.length);
if (nonMatchingCards.length > 0) {
  console.log('First 3 non-en articles:', nonMatchingCards.slice(0, 3));
}
console.log('Articles matching default filter (en):', count - nonMatchingCards.length);
