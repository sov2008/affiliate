const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /class="[^"]*spotlight-expiring-card[^"]*"[^>]*data-regions="([^"]*)"[^>]*data-lang="([^"]*)"/g;
let m;
const cards = [];
while ((m = regex.exec(html)) !== null) {
  cards.push({ regions: m[1], lang: m[2] });
}

console.log('Spotlight cards rendered in HTML:', cards.length);
cards.forEach((c, i) => {
  console.log(`Card ${i + 1}: regions="${c.regions}", lang="${c.lang}"`);
});

