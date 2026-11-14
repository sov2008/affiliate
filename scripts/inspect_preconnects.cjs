const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const preconnects = html.match(/<link[^>]+rel=["'](preconnect|dns-prefetch)["'][^>]*>/gi) || [];
console.log('Preconnect tags in index.html:');
preconnects.forEach(p => console.log(' ', p));

