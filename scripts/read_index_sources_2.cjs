const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/pages/index.astro', 'utf8');
const lines = content.split('\n');
console.log('Lines 40 to 120:');
for (let i = 40; i < 120; i++) {
  console.log(lines[i]);
}

