const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// The grid container
const gridStart = html.indexOf('id="dealsGridContainer"');
const gridEnd = html.indexOf('</nav>', gridStart);
const gridHtml = html.substring(gridStart, gridEnd);

// Let's parse all child elements of dealsGridContainer in order:
// They are either <article class="deal-grid-card..." or <div class="in-grid-partner-banner..."
const elementRegex = /(<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"[^>]*>)|(<div[^>]*class="[^"]*in-grid-partner-banner[^"]*"[^>]*data-banner-partner="([^"]*)"[^>]*>)/g;

let match;
let items = [];
while ((match = elementRegex.exec(gridHtml)) !== null) {
  if (match[1]) {
    const isHidden = match[1].includes('hidden');
    items.push({ type: 'card', store: match[2], isHidden });
  } else if (match[3]) {
    const isHidden = match[3].includes('hidden');
    items.push({ type: 'banner', partner: match[4], isHidden });
  }
}

console.log(`Total elements in grid: ${items.length}`);
console.log('First 35 elements:');
items.slice(0, 35).forEach((item, idx) => {
  console.log(`${idx + 1}: [${item.type.toUpperCase()}] ${item.store || item.partner} (hidden: ${item.isHidden})`);
});

