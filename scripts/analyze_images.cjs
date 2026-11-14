const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

// Find all image tags
const imgRegex = /<img\b[^>]*>/gi;
let m;
let totalImages = 0;
let eagerImages = 0;
let lazyImages = 0;
let missingDimensions = 0;

while ((m = imgRegex.exec(html)) !== null) {
  totalImages++;
  const tag = m[0];
  const isEager = tag.includes('loading="eager"');
  const isLazy = tag.includes('loading="lazy"');
  const hasWidth = tag.includes('width=');
  const hasHeight = tag.includes('height=');
  if (isEager) eagerImages++;
  if (isLazy) lazyImages++;
  if (!hasWidth || !hasHeight) missingDimensions++;
}

console.log('Total images:', totalImages);
console.log('Eager images:', eagerImages);
console.log('Lazy images:', lazyImages);
console.log('Missing dimensions:', missingDimensions);

