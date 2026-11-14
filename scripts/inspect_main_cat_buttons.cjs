const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const catBtnMatches = html.match(/<button[^>]*class="[^"]*main-cat-btn[^"]*"[^>]*>/g) || [];
console.log('main-cat-btn count:', catBtnMatches.length);
catBtnMatches.forEach((b, i) => {
  const catMatch = b.match(/data-cat="([^"]+)"/);
  console.log(i, 'data-cat:', catMatch ? catMatch[1] : 'none');
});
