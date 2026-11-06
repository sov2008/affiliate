const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<article[^>]*class="deal-grid-card[^"]*"[^>]*data-store="([^"]+)"[^>]*data-regions="([^"]+)"/g;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null && count < 25) {
  count++;
  console.log(`[${count}] store=${m[1]}, regions=${m[2]}`);
}

