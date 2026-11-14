const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const prodCards = (html.match(/class="[^"]*product-spotlight-card[^"]*"/gi) || []).length;
const dealCards = (html.match(/class="[^"]*spotlight-deal-card[^"]*"/gi) || []).length;
console.log('Product cards rendered in CuratedSpotlight:', prodCards);
console.log('Deal cards rendered in CuratedSpotlight:', dealCards);

