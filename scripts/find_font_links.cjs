const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/layouts/BaseLayout.astro', 'utf8');

const search = 'googleapis.com';
let pos = 0;
while ((pos = content.indexOf(search, pos)) !== -1) {
  console.log(content.slice(Math.max(0, pos - 50), pos + 250));
  console.log('---');
  pos += search.length;
}

