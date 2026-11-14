const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

console.log('Header.astro lines count:', content.split('\n').length);
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('storesMegaDropdown') || l.includes('categoriesMegaDropdown') || l.includes('headerMobileNavDrawer')) {
    console.log(`Line ${idx}: ${l.trim().substring(0, 100)}`);
  }
});

