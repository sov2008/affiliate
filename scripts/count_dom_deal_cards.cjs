const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const matches = html.match(/deal-grid-card/g) || [];
console.log('deal-grid-card class count in dist/index.html:', matches.length);

const re = /<article\b[^>]*class="[^"]*deal-grid-card[^"]*"[\s\S]*?<\/article>/g;
const articles = html.match(re) || [];
console.log('deal-grid-card articles count in dist/index.html:', articles.length);
