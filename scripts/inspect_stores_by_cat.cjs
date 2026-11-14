const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

const lines = content.split('\n');
console.log('StoresByCategory definition in frontmatter:');
lines.slice(0, 100).forEach((l, idx) => {
  if (l.includes('storesByCategory') || l.includes('megaCategories') || l.includes('smartCategories')) {
    console.log(`Line ${idx}: ${l.trim().substring(0, 100)}`);
  }
});

