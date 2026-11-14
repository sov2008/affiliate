const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const target = 'id="loadMoreContainer"';
const idx = html.indexOf(target);
console.log('loadMoreContainer found at:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 50, idx + 2500));
}

