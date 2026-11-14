const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
const content = fs.readFileSync(filePath, 'utf8');

const search = 'Optimized Web Fonts';
const idx = content.indexOf(search);
console.log(content.slice(idx - 50, idx + 600));

