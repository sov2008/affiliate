const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const imgRegex = /<img\b[^>]*>/gi;
let m;
const missing = [];
while ((m = imgRegex.exec(html)) !== null) {
  const tag = m[0];
  if (!tag.includes('width=') || !tag.includes('height=')) {
    missing.push(tag);
  }
}

console.log('Sample missing dimensions (first 10):');
missing.slice(0, 10).forEach(t => console.log(t.substring(0, 120)));

