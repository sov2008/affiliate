const fs = require('fs');
const filePath = 'deals-portal/src/pages/index.astro';
const content = fs.readFileSync(filePath, 'utf8');

const search = '<BaseLayout';
const idx = content.indexOf(search);
console.log(content.slice(idx, idx + 400));

