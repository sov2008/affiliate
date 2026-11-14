const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let m;
let idx = 0;
while ((m = regex.exec(html)) !== null) {
  const fullTag = m[0];
  const srcMatch = fullTag.match(/src=["']([^"']+)["']/i);
  const inlineLen = m[1].trim().length;
  console.log(`Script #${idx++}:`, srcMatch ? `SRC: ${srcMatch[1]}` : `INLINE: ${inlineLen} chars`, fullTag.substring(0, 120).replace(/\n/g, ' '));
}

