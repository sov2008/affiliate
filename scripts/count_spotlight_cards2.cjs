const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');
const p1 = html.indexOf('id="curatedSpotlightSection"');
const p2 = html.indexOf('id="partnerRotatorSection"');
const sec = html.substring(p1, p2);

const prodCards = (sec.match(/class="[^"]*spotlight-product-card[^"]*"/gi) || []).length;
const expCards = (sec.match(/class="[^"]*spotlight-expiring-card[^"]*"/gi) || []).length;
console.log('spotlight-product-card count:', prodCards);
console.log('spotlight-expiring-card count:', expCards);

