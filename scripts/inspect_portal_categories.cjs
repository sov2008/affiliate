const fs = require('fs');

const code = fs.readFileSync('deals-portal/src/data/couponsData.ts', 'utf8');
const lines = code.split('\n');
const cats = new Set();
for (const line of lines) {
  const m = line.match(/category:\s*['"]([^'"]+)['"]/);
  if (m) cats.add(m[1]);
}
console.log('Categories found in couponsData.ts:');
console.log([...cats].sort());

// Also check existing category pages or routes
const pages = fs.readdirSync('deals-portal/src/pages/categories');
console.log('\nCategory route files:', pages);

