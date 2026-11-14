const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');
const lines = content.split('\n');
console.log('Frontmatter imports:');
for (let i = 0; i < 40; i++) {
  console.log(lines[i]);
}

