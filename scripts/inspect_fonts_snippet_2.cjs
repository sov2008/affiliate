const fs = require('fs');
const filePath = 'deals-portal/src/layouts/BaseLayout.astro';
const content = fs.readFileSync(filePath, 'utf8');

const search = 'fonts.googleapis.com';
const idx = content.indexOf(search);
console.log(content.slice(idx - 100, idx + 400));

