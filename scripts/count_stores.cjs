const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const counts = {};
const regex = /<article[^>]*class="[^"]*deal-grid-card[^"]*"[^>]*data-store="([^"]*)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  counts[m[1]] = (counts[m[1]] || 0) + 1;
}
console.log('Top 15 stores by offer count in grid:');
console.log(Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 15));

