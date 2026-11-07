const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<article[^>]*class="([^"]*)"/g;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null) {
  count++;
  if (count <= 3 || count === 21 || count === 22) {
    console.log(`Article ${count}: ${m[1]}`);
  }
}
console.log(`Total articles: ${count}`);

