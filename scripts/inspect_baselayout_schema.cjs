const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
const content = fs.readFileSync(filePath, 'utf8');

const search = 'application/ld+json';
let pos = 0;
while ((pos = content.indexOf(search, pos)) !== -1) {
  console.log(content.slice(pos - 50, pos + 300));
  console.log('---');
  pos += search.length;
}

