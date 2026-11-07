const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const gridStart = html.indexOf('id="dealsGridContainer"');
const gridEnd = html.indexOf('</nav>', gridStart);
const gridHtml = html.substring(gridStart, gridEnd);

const elementRegex = /(<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"[^>]*>)|(<div[^>]*class="[^"]*in-grid-partner-banner[^"]*"[^>]*data-banner-partner="([^"]*)"[^>]*>)/g;

let match;
let domElements = [];
while ((match = elementRegex.exec(gridHtml)) !== null) {
  if (match[1]) {
    domElements.push({ type: 'card', store: match[2] });
  } else if (match[3]) {
    domElements.push({ type: 'banner', partner: match[4] });
  }
}

// When visibleLimit = 42:
let cardCount = 0;
let bannerCount = 0;
domElements.forEach((el, idx) => {
  if (el.type === 'card') {
    cardCount++;
    const isVisible = cardCount <= 42;
    if (cardCount >= 21 && cardCount <= 42) {
      console.log(`Card #${cardCount} at DOM pos ${idx+1}: ${el.store}`);
    }
  } else if (el.type === 'banner') {
    bannerCount++;
    // In filterDeals():
    // maxBannersToShow = Math.floor(actuallyShown / 7) = Math.floor(42 / 7) = 6!
    // bIdx < 6 is visible!
    const isVisible = bannerCount <= 6;
    console.log(`BANNER #${bannerCount} at DOM pos ${idx+1}: [${el.partner}] (visible: ${isVisible})`);
  }
});

