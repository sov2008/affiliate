const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const p1 = html.indexOf('id="curatedSpotlightSection"');
const p2 = html.indexOf('id="partnerRotatorSection"');
const sectionHtml = html.substring(p1, p2);

// Count article tags or card tags
const articles = sectionHtml.match(/<article\b[^>]*>/gi) || [];
const links = sectionHtml.match(/<a\b[^>]*>/gi) || [];
console.log('curatedSpotlightSection length:', sectionHtml.length);
console.log('Articles count:', articles.length);
console.log('Links count:', links.length);

// What classes do the items have?
const cardClasses = sectionHtml.match(/class="([^"]*card[^"]*)"/gi) || [];
console.log('Card classes sample (first 10):', cardClasses.slice(0, 10));

