const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

console.log('=== 1. Checking meta robots ===');
const hasRobots = html.includes('name="robots"');
console.log('Robots meta present:', hasRobots);
if (hasRobots) {
  const m = html.match(/<meta[^>]+name="robots"[^>]*>/);
  console.log('Robots tag:', m ? m[0] : 'not found');
}

console.log('=== 2. Checking Google Fonts loading ===');
const fontLinks = html.match(/<link[^>]+fonts\.googleapis\.com[^>]+>/g) || [];
console.log('Google Fonts link tags count:', fontLinks.length);
fontLinks.forEach(l => console.log('Link:', l));

console.log('=== 3. Checking Schema.org CollectionPage ===');
const hasCollectionPage = html.includes('CollectionPage') && html.includes('ItemList');
console.log('Schema CollectionPage + ItemList present:', hasCollectionPage);

console.log('=== 4. Checking images missing width/height in dist/index.html ===');
const imgRegex = /<img\b([^>]*)>/gi;
let match;
let missing = 0;
let total = 0;
while ((match = imgRegex.exec(html)) !== null) {
  total++;
  const attrs = match[1];
  const hasW = /width=["'][^"']+["']/i.test(attrs);
  const hasH = /height=["'][^"']+["']/i.test(attrs);
  if (!hasW || !hasH) {
    missing++;
    console.log('Missing dim img snippet:', match[0].substring(0, 120));
  }
}
console.log('Total images inspected:', total);
console.log('Total images missing dimensions in dist/index.html:', missing);

