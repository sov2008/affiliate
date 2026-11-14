const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const search = 'onload="this.media=\'all\'"';
const idx = html.indexOf(search);
console.log(html.slice(idx - 100, idx + 400));

