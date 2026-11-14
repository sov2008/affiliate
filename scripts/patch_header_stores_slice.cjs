const fs = require('fs');
const content = fs.readFileSync('deals-portal/src/components/Header.astro', 'utf8');

// Replace .slice(0, 14) with .slice(0, 6) in storesByCategory
let updated = content.replace(/\.slice\(0,\s*14\)/g, '.slice(0, 6)');
updated = updated.replace(/\.slice\(0,\s*12\)/g, '.slice(0, 6)');

fs.writeFileSync('deals-portal/src/components/Header.astro', updated, 'utf8');
console.log('Header.astro updated: storesByCategory items sliced to 6 per category');

