const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// The grid container
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

// Now let's simulate the page when visibleLimit = 21:
// 21 cards are shown.
// maxBannersToShow = Math.floor(21 / 7) = 3 banners.
// Which 3 banners? The first 3 banners in querySelectorAll('.in-grid-partner-banner')!
// And which DOM positions are they?
// Banner 0 is at DOM index 7 (after 7 cards).
// Banner 1 is at DOM index 15 (after 14 cards + 1 banner).
// Banner 2 is at DOM index 23 (after 21 cards + 2 banners).
// All other banners are hidden!
console.log('--- At visibleLimit = 21 (initial page load) ---');
let shownCards = 0;
let shownBanners = 0;
domElements.slice(0, 30).forEach((el, i) => {
  if (el.type === 'card' && shownCards < 21) {
    shownCards++;
    console.log(`Pos ${i+1}: CARD #${shownCards} (${el.store})`);
  } else if (el.type === 'banner' && shownBanners < 3) {
    shownBanners++;
    console.log(`Pos ${i+1}: BANNER #${shownBanners} (${el.partner})`);
  } else {
    console.log(`Pos ${i+1}: [HIDDEN] ${el.type} (${el.store || el.partner})`);
  }
});

// Now let's simulate clicking "Load Next 21 Deals": visibleLimit = 42:
// shownCards = 42.
// maxBannersToShow = Math.floor(42 / 7) = 6 banners.
// The banners shown will be banner indices 0, 1, 2, 3, 4, 5.
// Let's see what is rendered in positions 25..55:
console.log('\n--- At visibleLimit = 42 (after clicking Load More) ---');
shownCards = 0;
shownBanners = 0;
domElements.slice(20, 52).forEach((el, i) => {
  const actualIndex = i + 20;
  if (el.type === 'card') {
    shownCards++; // note: total cards up to this point
    // let's accurately count total cards
  }
});

