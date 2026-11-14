const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const head = html.slice(0, html.indexOf('</head>'));
console.log('--- ALL <link> tags in HEAD ---');
const links = head.match(/<link[^>]+>/gi) || [];
links.forEach((l, i) => console.log(i + 1, l));

