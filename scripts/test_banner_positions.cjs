const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// The grid container
const gridStart = html.indexOf('id="dealsGridContainer"');
const gridEnd = html.indexOf('</nav>', gridStart);
const gridHtml = html.substring(gridStart, gridEnd);

const elementRegex = /(<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"[^>]*>)|(<div[^>]*class="[^"]*in-grid-partner-banner[^"]*"[^>]*data-banner-partner="([^"]*)"[^>]*>)/g;

let match;
let cards = [];
let banners = [];
let totalOrder = [];
while ((match = elementRegex.exec(gridHtml)) !== null) {
  if (match[1]) {
    const isHidden = match[1].includes('hidden');
    const store = match[2];
    cards.push({ store, isHidden, raw: match[1] });
    totalOrder.push({ type: 'card', store, isHidden });
  } else if (match[3]) {
    const isHidden = match[3].includes('hidden');
    const partner = match[4];
    banners.push({ partner, isHidden, raw: match[3] });
    totalOrder.push({ type: 'banner', partner, isHidden });
  }
}

console.log(`Cards: ${cards.length}, Banners: ${banners.length}, Total elements: ${totalOrder.length}`);

// Simulate clicking "Load Next 21 Deals" in JS:
// In current JS:
// visibleLimit += PAGE_SIZE; (from 21 to 42)
// filterDeals() iterates over cards (cards.forEach).
// card 1..42 become visible.
// then Math.floor(actuallyShown / 7) = Math.floor(42 / 7) = 6 banners become visible!
// Let's see which banners are at indices 0..5 in DOM:
console.log('--- Current DOM positioning of banners ---');
totalOrder.forEach((el, idx) => {
  if (el.type === 'banner') {
    console.log(`DOM #${idx + 1}: Banner [${el.partner}] (after card #${cards.findIndex(c => c === totalOrder[idx-1]) + 1 || '?'})`);
  }
});

