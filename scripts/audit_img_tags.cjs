const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const imgRegex = /<img\s+([^>]+)>/gi;
let match;
let count = 0;
while ((match = imgRegex.exec(html)) !== null) {
  const attrs = match[1];
  const srcMatch = attrs.match(/src=["']([^"']+)["']/);
  const src = srcMatch ? srcMatch[1] : 'no-src';
  const hasWidth = /width=/.test(attrs);
  const hasHeight = /height=/.test(attrs);
  const hasAlt = /alt=/.test(attrs);
  const hasLoading = /loading=/.test(attrs);
  if (!hasWidth || !hasHeight || !hasAlt) {
    console.log('Missing attrs:', { src, hasWidth, hasHeight, hasAlt });
    count++;
  }
}
console.log('Total images with missing width/height/alt:', count);

