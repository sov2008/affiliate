const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const target = 'data-partner-slug="under-armour"';
const idx = html.indexOf(target);
console.log('Under Armour slide found at:', idx);
if (idx !== -1) {
  console.log(html.substring(idx - 60, idx + 1400));
}
