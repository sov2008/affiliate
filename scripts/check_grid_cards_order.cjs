const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// extract brand of each deal-grid-card in order
const cards = [];
const regex = /<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"[^>]*data-deal-id="([^"]*)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  cards.push({ store: m[1], id: m[2] });
}

console.log(`Total deal-grid-cards in HTML: ${cards.length}`);
console.log('First 60 cards:');
for (let i = 0; i < Math.min(60, cards.length); i++) {
  console.log(`${i + 1}: ${cards[i].store} (${cards[i].id})`);
}

// Check adjacent duplicates or duplicates in batches of 4 or 8
let violations = 0;
for (let i = 0; i < cards.length; i++) {
  for (let j = i + 1; j < Math.min(cards.length, i + 6); j++) {
    if (cards[i].store.toLowerCase() === cards[j].store.toLowerCase()) {
      violations++;
      if (violations <= 15) {
        console.log(`Violation: ${cards[i].store} at #${i + 1} and #${j + 1} (dist: ${j - i})`);
      }
    }
  }
}
console.log(`Total brand spacing < 6 violations: ${violations}`);

