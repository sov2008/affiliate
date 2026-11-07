const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Check banners
const bannerRegex = /class="([^"]*in-grid-partner-banner[^"]*)"/g;
let m;
let count = 0;
while ((m = bannerRegex.exec(html)) !== null) {
  count++;
  if (count <= 10) {
    console.log(`Banner ${count}: ${m[1]}`);
  }
}
console.log(`Total banners in dist/index.html: ${count}`);

// Check cards
const cardRegex = /class="([^"]*deal-card-item[^"]*)"/g;
let cardCount = 0;
while ((m = cardRegex.exec(html)) !== null) {
  cardCount++;
  if (cardCount <= 5 || (cardCount >= 20 && cardCount <= 25)) {
    console.log(`Card ${cardCount}: ${m[1]}`);
  }
}
console.log(`Total deal cards in dist/index.html: ${cardCount}`);

