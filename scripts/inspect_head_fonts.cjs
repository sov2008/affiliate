const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const headEnd = html.indexOf('</head>');
const head = html.slice(0, headEnd);
console.log('--- HEAD CONTENT (fonts & styles) ---');
const fontLinks = head.match(/<link[^>]+googleapis[^>]*>/gi) || [];
fontLinks.forEach(l => console.log(l));

