const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const imgRegex = /<img\b[^>]*>/gi;
let m;
const missingNonFlag = [];
while ((m = imgRegex.exec(html)) !== null) {
  const tag = m[0];
  if (!tag.includes('/flags/') && (!tag.includes('width=') || !tag.includes('height='))) {
    missingNonFlag.push(tag);
  }
}

console.log('Missing non-flag images count:', missingNonFlag.length);
missingNonFlag.slice(0, 15).forEach(t => console.log(t.substring(0, 140)));

