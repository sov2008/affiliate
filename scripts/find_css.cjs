const fs = require('fs');
const html = fs.readFileSync('deals-portal/dist/index.html', 'utf8');

const regex = /<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('CSS Link:', m[1]);
  if (m[1].startsWith('/')) {
    const filePath = 'deals-portal/dist' + m[1];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      console.log(`  File exists (${content.length} bytes). Contains dealCardReveal: ${content.includes('dealCardReveal')}, contains animate-card-entrance: ${content.includes('animate-card-entrance')}`);
    } else {
      console.log(`  File does NOT exist: ${filePath}`);
    }
  }
}

