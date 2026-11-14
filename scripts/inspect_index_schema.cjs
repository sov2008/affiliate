const fs = require('fs');
const filePath = 'deals-portal/src/pages/index.astro';
let content = fs.readFileSync(filePath, 'utf8');

const search = 'type="application/ld+json"';
const idx = content.lastIndexOf(search);
console.log('Last JSON-LD in index.astro:');
console.log(content.slice(idx - 50, idx + 600));

