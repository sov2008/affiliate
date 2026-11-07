const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"[^>]*data-deal-id="([^"]*)"/g;
let m;
const cards = [];
while ((m = regex.exec(html)) !== null) {
  cards.push({ store: m[1], id: m[2] });
}

console.log('Total cards in grid:', cards.length);

// Count occurrences
const counts = {};
cards.forEach(c => counts[c.store] = (counts[c.store] || 0) + 1);

console.log('Stores with > 5 cards in grid:');
Object.entries(counts).filter(e => e[1] > 5).forEach(([s, cnt]) => {
  console.log(`  ${s}: ${cnt}`);
});

// Look for consecutive runs of the same store
let runStore = '';
let runLength = 0;
let maxRun = 0;
let maxRunStore = '';

for (let i = 0; i < cards.length; i++) {
  if (cards[i].store === runStore) {
    runLength++;
  } else {
    if (runLength > 1) {
      console.log(`Run of ${runStore}: length ${runLength} at index ${i - runLength} to ${i - 1}`);
    }
    if (runLength > maxRun) {
      maxRun = runLength;
      maxRunStore = runStore;
    }
    runStore = cards[i].store;
    runLength = 1;
  }
}
if (runLength > 1) {
  console.log(`Run of ${runStore}: length ${runLength} at end`);
}

// Check index 720 to 864
console.log('Cards from index 725 to 745:');
cards.slice(725, 745).forEach((c, i) => {
  console.log(`  #${725 + i + 1}: ${c.store} (${c.id})`);
});

