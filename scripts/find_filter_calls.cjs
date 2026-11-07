const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /filterDeals\(\)/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log(`Call at ${m.index}: ${html.substring(Math.max(0, m.index - 40), Math.min(html.length, m.index + 60)).replace(/\n/g, ' ')}`);
}

