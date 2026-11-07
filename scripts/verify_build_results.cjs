const fs = require('fs');
console.log('=== Verifying dist/index.html results ===');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const storeMatches = html.split('data-store="').slice(1).map(s => s.split('"')[0]);
console.log('Total data-store cards found:', storeMatches.length);

let adjCount = 0;
for (let i = 0; i < storeMatches.length - 1; i++) {
  if (storeMatches[i].toLowerCase() === storeMatches[i+1].toLowerCase()) {
    adjCount++;
    console.log('Adjacent violation:', storeMatches[i], 'at index', i);
  }
}
console.log('Total adjacent store violations in entire grid:', adjCount);

const storeCounts = {};
for (const s of storeMatches) {
  storeCounts[s] = (storeCounts[s] || 0) + 1;
}
const maxCardsPerStore = Math.max(...Object.values(storeCounts));
console.log('Max cards per store on homepage grid:', maxCardsPerStore);

const bannerMatches = html.split('class="in-grid-partner-banner').deals = html.split('in-grid-partner-banner').length - 1;
console.log('Total in-grid banners in dist:', bannerMatches);

const spotlightMatches = html.split('spotlight-expiring-card').length - 1;
console.log('Total spotlight expiring cards in HTML:', spotlightMatches);

console.log('=== All checks completed! ===');