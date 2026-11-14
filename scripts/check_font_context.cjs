const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');
const p = html.indexOf('media="print"');
console.log('Index:', p);
if (p !== -1) {
  console.log(html.slice(p - 100, p + 300));
}

