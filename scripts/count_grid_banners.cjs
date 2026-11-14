const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const bannerMatches = (html.match(/in-grid-partner-banner/g) || []);
console.log('in-grid-partner-banner count in dist/index.html:', bannerMatches.length);

const re = /<div class="[^"]*in-grid-partner-banner[^"]*"[\s\S]*?<\/div>\s*<\/div>/g;
let m;
let count = 0;
while ((m = re.exec(html)) !== null && count < 3) {
  count++;
  console.log(`\n--- Banner ${count} ---`);
  console.log(m[0].substring(0, 300));
}
