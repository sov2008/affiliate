const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// find all article.deal-grid-card
const articleMatches = [...html.matchAll(/<article[^>]*class="([^"]*deal-grid-card[^"]*)"[^>]*data-store="([^"]*)"/g)];
console.log('Total deal-grid-card articles:', articleMatches.length);
articleMatches.slice(0, 30).forEach((m, i) => {
  console.log(`Card ${i + 1}: ${m[2]} | hidden: ${m[1].includes('hidden')} | anim: ${m[1].includes('animate-card-entrance')}`);
});

