const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<script[^>]*src="([^"]*)"[^>]*>/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Script:', m[1]);
}

